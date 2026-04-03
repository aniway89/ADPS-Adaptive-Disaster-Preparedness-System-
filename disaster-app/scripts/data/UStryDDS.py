import pandas as pd
import json
import os

# -------------------------
# PATH SETUP
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

USGS_INDIA = os.path.join(BASE_DIR, "USGS_IN.csv")
USGS_JAPAN = os.path.join(BASE_DIR, "USGS_JP.csv")

IBTRACS_INDIA = os.path.join(BASE_DIR, "NOSS_IN.csv")
IBTRACS_JAPAN = os.path.join(BASE_DIR, "NOSS_WP.csv")
EMDAT_FILE = os.path.join(BASE_DIR, "EM-DAT.xlsx")

# -------------------------
# HELPERS
# -------------------------
def safe_numeric(series):
    return pd.to_numeric(series, errors="coerce")


# -------------------------
# ⚡ GEO CLUSTER (FAST CORE)
# -------------------------
def create_geo_cluster(df, lat_col, lon_col):
    df[lat_col] = safe_numeric(df[lat_col])
    df[lon_col] = safe_numeric(df[lon_col])

    df = df.dropna(subset=[lat_col, lon_col])

    # 🔥 DIRECT REGION MAPPING
    df["state"] = df.apply(
        lambda x: map_to_region(x[lat_col], x[lon_col]),
        axis=1
    )

    return df

INDIA_STATES = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
    "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
    "Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
    "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
    "Uttar Pradesh","Uttarakhand","West Bengal","Delhi"
]

JAPAN_PREFS = [
    "Tokyo","Osaka","Hokkaido","Aichi","Fukuoka","Kyoto","Hyogo","Chiba",
    "Saitama","Hiroshima","Miyagi","Niigata","Nagano","Shizuoka","Okayama",
    "Kagoshima","Okinawa","Gunma","Tochigi","Ibaraki","Gifu","Yamaguchi",
    "Ehime","Nagasaki","Kumamoto","Akita","Fukushima","Yamanashi",
    "Toyama","Ishikawa","Fukui","Shiga","Nara","Wakayama","Tottori",
    "Shimane","Kagawa","Tokushima","Kochi","Saga","Oita","Miyazaki"
]
def map_to_region(lat, lon):

    # -------- INDIA --------
    if 6 <= lat <= 37 and 68 <= lon <= 97:

        if 26 <= lat <= 30 and 76 <= lon <= 80:
            return "Delhi"
        elif 22 <= lat <= 28 and 72 <= lon <= 75:
            return "Gujarat"
        elif 19 <= lat <= 23 and 72 <= lon <= 78:
            return "Maharashtra"
        elif 8 <= lat <= 13 and 76 <= lon <= 80:
            return "Tamil Nadu / Kerala"
        elif 12 <= lat <= 18 and 74 <= lon <= 78:
            return "Karnataka"
        elif 15 <= lat <= 20 and 78 <= lon <= 84:
            return "Telangana / Andhra"
        elif 24 <= lat <= 28 and 88 <= lon <= 92:
            return "West Bengal / NE"
        elif 30 <= lat <= 35 and 75 <= lon <= 80:
            return "Punjab / Himachal"
        elif 20 <= lat <= 26 and 80 <= lon <= 86:
            return "Chhattisgarh / Odisha"
        elif 23 <= lat <= 28 and 77 <= lon <= 82:
            return "Madhya Pradesh"
        else:
            return "Rest of India"

    # -------- JAPAN --------
    elif 30 <= lat <= 46 and 129 <= lon <= 146:

        if 34 <= lat <= 36 and 138 <= lon <= 141:
            return "Tokyo"
        elif 34 <= lat <= 36 and 135 <= lon <= 136:
            return "Osaka"
        elif 43 <= lat <= 45 and 141 <= lon <= 144:
            return "Hokkaido"
        elif 36 <= lat <= 40 and 138 <= lon <= 142:
            return "Tohoku"
        elif 35 <= lat <= 37 and 136 <= lon <= 138:
            return "Chubu"
        else:
            return "Rest of Japan"

    return "Other"



from geopy.geocoders import Nominatim
from time import sleep

geolocator = Nominatim(user_agent="disaster_app")

def cluster_to_region(cluster_dict, top_n=20):
    clusters = list(cluster_dict.items())
    clusters.sort(key=lambda x: x[1]["freq"], reverse=True)

    result = {}

    for i, (cluster, val) in enumerate(clusters):

        # 🔥 FIX: skip non-coordinate keys
        if "_" not in cluster:
            result[cluster] = val
            continue

        lat, lon = map(float, cluster.split("_"))

        if i < top_n:
            try:
                loc = geolocator.reverse(f"{lat}, {lon}", timeout=10)
                addr = loc.raw.get("address", {})

                region = (
                    addr.get("state") or
                    addr.get("region") or
                    addr.get("county")
                )

                if not region:
                    continue

                sleep(0.2)

            except:
                continue
        else:
            continue

        # merge safely
        if region not in result:
            result[region] = val
        else:
            result[region]["freq"] += val["freq"]
            result[region]["sev"] = (
                result[region]["sev"] + val["sev"]
            ) / 2

    return result


def process_emdat(file):
    df = pd.read_excel(file)
    df = df.fillna(0)

    result = {
        "India": {"FL": [0, 0], "HW": [0, 0]},
        "Japan": {"FL": [0, 0], "HW": [0, 0]}
    }

    for _, row in df.iterrows():
        country = row.get("Country", "")
        dtype = row.get("Disaster Type", "")

        if country not in result:
            continue

        if dtype == "Flood":
            key = "FL"
        elif dtype == "Extreme temperature":
            key = "HW"
        else:
            continue

        deaths = float(row.get("Total Deaths", 0) or 0)
        affected = float(row.get("Total Affected", 0) or 0)
        damage = float(row.get("Total Damage ('000 US$)", 0) or 0)

        severity = (
            deaths * 0.5 +
            affected * 0.0001 +
            damage * 0.00001
        )

        result[country][key][0] += 1
        result[country][key][1] += severity

    for country in result:
        for key in result[country]:
            freq, sev_sum = result[country][key]
            avg = sev_sum / freq if freq > 0 else 0
            result[country][key] = {
                "freq": freq,
                "sev": round(avg / 1000, 2)
            }

    return result
# -------------------------
# CORE PROCESSOR (FAST)
# -------------------------
def process_with_states(df, lat_col, lon_col, value_col):

    df[value_col] = safe_numeric(df[value_col])

    # ⚡ replace API mapping with clustering
    df = create_geo_cluster(df, lat_col, lon_col)

    grouped = df.groupby("state").agg({
        value_col: "mean",
        "state": "count"
    }).rename(columns={"state": "freq", value_col: "sev"})

    return grouped.fillna(0).to_dict(orient="index")


# -------------------------
# EARTHQUAKE
# -------------------------
def earthquake_state(file):
    df = pd.read_csv(file, low_memory=False)
    return process_with_states(df, "latitude", "longitude", "mag")


# -------------------------
# CYCLONE
# -------------------------
def cyclone_state(file):
    df = pd.read_csv(file, low_memory=False)

    wind_col = None
    for col in ["USA_WIND", "WMO_WIND", "WIND"]:
        if col in df.columns:
            wind_col = col
            break

    if not wind_col:
        df["wind"] = 50
        wind_col = "wind"

    return process_with_states(df, "LAT", "LON", wind_col)


# -------------------------
# MAIN
# -------------------------
def build_state_dataset():

    # -------- India --------
    print("Processing India eq datasets...")
    india_eq = earthquake_state(USGS_INDIA)
    print("Processing India  cy datasets...")
    india_cy = cyclone_state(IBTRACS_INDIA)
    print("Processing India datasets...")

    india_eq = cluster_to_region(india_eq)
    print("Processing India eq datasets...")
    india_cy = cluster_to_region(india_cy)
    print("Processing India cy datasets...")

    # -------- Japan --------
    japan_eq = earthquake_state(USGS_JAPAN)
    print("Processing Japan eq datasets...")
    japan_ty = cyclone_state(IBTRACS_JAPAN)
    print("Processing Japan ty datasets...")

    japan_eq = cluster_to_region(japan_eq)
    print("Processing Japan eq  datasets...")
    japan_ty = cluster_to_region(japan_ty)
    print("Processing Japan ty datasets...")

    # -------- EM-DAT --------
    emdat = process_emdat(EMDAT_FILE)

    return {
        "India": {
            "EQ": india_eq,
            "CY": india_cy,
            "FL": emdat["India"]["FL"],
            "HW": emdat["India"]["HW"]
        },
        "Japan": {
            "EQ": japan_eq,
            "TY": japan_ty,
            "FL": emdat["Japan"]["FL"],
            "HW": emdat["Japan"]["HW"]
        }
    }
# -------------------------
# SAVE
# -------------------------
def save(data):
    with open(os.path.join(BASE_DIR, "stateDisasterData.json"), "w") as f:
        json.dump(data, f, indent=2)


# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    data = build_state_dataset()
    save(data)

    print("✅ ULTRA-FAST geo-cluster data generated!")