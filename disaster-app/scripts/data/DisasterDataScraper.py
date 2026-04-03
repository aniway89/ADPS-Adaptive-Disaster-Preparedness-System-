import pandas as pd
import json
import os
from geopy.geocoders import Nominatim
from time import sleep

# -------------------------
# PATH SETUP
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

USGS_INDIA = os.path.join(BASE_DIR, "USGS_IN.csv")
USGS_JAPAN = os.path.join(BASE_DIR, "USGS_JP.csv")

IBTRACS_INDIA = os.path.join(BASE_DIR, "NOSS_IN.csv")
IBTRACS_JAPAN = os.path.join(BASE_DIR, "NOSS_WP.csv")

CACHE_FILE = os.path.join(BASE_DIR, "geo_cache.json")

# -------------------------
# GEOLOCATOR (STATE MAPPING)
# -------------------------
geolocator = Nominatim(user_agent="disaster_app")

# load cache
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, "r") as f:
        geo_cache = json.load(f)
else:
    geo_cache = {}

def get_state(lat, lon):
    key = f"{round(lat,2)}_{round(lon,2)}"

    if key in geo_cache:
        return geo_cache[key]

    try:
        location = geolocator.reverse(f"{lat}, {lon}", timeout=10)
        address = location.raw.get("address", {})
        state = address.get("state", address.get("region", "Unknown"))

        geo_cache[key] = state

        # prevent rate limit
        sleep(1)

        return state

    except:
        return "Unknown"


# -------------------------
# HELPERS
# -------------------------
def safe_numeric(series):
    return pd.to_numeric(series, errors="coerce")


def normalize(val, max_val):
    return round((val / max_val) * 10, 2) if max_val > 0 else 0


# -------------------------
# EARTHQUAKE → STATE
# -------------------------
def earthquake_state(file):
    df = pd.read_csv(file, low_memory=False)

    df["latitude"] = safe_numeric(df["latitude"])
    df["longitude"] = safe_numeric(df["longitude"])
    df["mag"] = safe_numeric(df["mag"])

    df = df.dropna(subset=["latitude", "longitude"])

    print("🌍 Mapping earthquake locations to states...")

    df["state"] = df.apply(lambda x: get_state(x["latitude"], x["longitude"]), axis=1)

    grouped = df.groupby("state").agg({
        "mag": "mean",
        "state": "count"
    }).rename(columns={"state": "freq", "mag": "sev"})

    return grouped.fillna(0).to_dict(orient="index")


# -------------------------
# CYCLONE → STATE
# -------------------------
def cyclone_state(file):
    df = pd.read_csv(file, low_memory=False)

    df["LAT"] = safe_numeric(df["LAT"])
    df["LON"] = safe_numeric(df["LON"])

    df = df.dropna(subset=["LAT", "LON"])

    # wind column detection
    wind_col = None
    for col in ["USA_WIND", "WMO_WIND", "WIND"]:
        if col in df.columns:
            wind_col = col
            break

    if wind_col:
        df[wind_col] = safe_numeric(df[wind_col])
    else:
        df["wind"] = 50
        wind_col = "wind"

    print("🌪️ Mapping cyclone locations to states...")

    df["state"] = df.apply(lambda x: get_state(x["LAT"], x["LON"]), axis=1)

    grouped = df.groupby("state").agg({
        wind_col: "mean",
        "state": "count"
    }).rename(columns={"state": "freq", wind_col: "sev"})

    return grouped.fillna(0).to_dict(orient="index")


# -------------------------
# RANKING
# -------------------------
def rank_states(state_data):
    scores = {}

    for state, val in state_data.items():
        freq = val.get("freq", 0)
        sev = val.get("sev", 0)

        score = freq * 0.6 + sev * 0.4
        scores[state] = score

    return sorted(scores, key=scores.get, reverse=True)


# -------------------------
# MAIN
# -------------------------
def build_state_dataset():

    india_eq = earthquake_state(USGS_INDIA)
    india_cy = cyclone_state(IBTRACS_INDIA)

    japan_eq = earthquake_state(USGS_JAPAN)
    japan_ty = cyclone_state(IBTRACS_JAPAN)

    return {
        "India": {
            "EQ": india_eq,
            "CY": india_cy
        },
        "Japan": {
            "EQ": japan_eq,
            "TY": japan_ty
        }
    }


# -------------------------
# SAVE
# -------------------------
def save(data):

    with open(os.path.join(BASE_DIR, "stateDisasterData.json"), "w") as f:
        json.dump(data, f, indent=2)

    with open(CACHE_FILE, "w") as f:
        json.dump(geo_cache, f, indent=2)


# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    data = build_state_dataset()

    save(data)

    print("✅ State-level disaster data generated!")