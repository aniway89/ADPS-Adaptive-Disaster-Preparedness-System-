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
# GEO SETUP
# -------------------------
geolocator = Nominatim(user_agent="disaster_app")

# load cache
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, "r") as f:
        geo_cache = json.load(f)
else:
    geo_cache = {}

# -------------------------
# FAST STATE LOOKUP (DEDUPED)
# -------------------------
def batch_get_states(coords):
    results = {}

    for lat, lon in coords:
        key = f"{round(lat,2)}_{round(lon,2)}"

        if key in geo_cache:
            results[(lat, lon)] = geo_cache[key]
            continue

        try:
            location = geolocator.reverse(f"{lat}, {lon}", timeout=10)
            address = location.raw.get("address", {})
            state = address.get("state", address.get("region", "Unknown"))

            geo_cache[key] = state
            results[(lat, lon)] = state

            sleep(0.5)  # smaller delay

        except:
            results[(lat, lon)] = "Unknown"

    return results


# -------------------------
# HELPERS
# -------------------------
def safe_numeric(series):
    return pd.to_numeric(series, errors="coerce")


# -------------------------
# CORE PROCESSOR (FAST)
# -------------------------
def process_with_states(df, lat_col, lon_col, value_col):

    df[lat_col] = safe_numeric(df[lat_col])
    df[lon_col] = safe_numeric(df[lon_col])
    df[value_col] = safe_numeric(df[value_col])

    df = df.dropna(subset=[lat_col, lon_col])

    # 🔥 STEP 1: UNIQUE COORDS ONLY
    unique_coords = list(set(zip(df[lat_col], df[lon_col])))

    print(f"⚡ Unique locations to resolve: {len(unique_coords)} (instead of {len(df)})")

    # 🔥 STEP 2: BATCH RESOLVE
    coord_map = batch_get_states(unique_coords)

    # 🔥 STEP 3: MAP BACK
    df["state"] = df.apply(lambda x: coord_map.get((x[lat_col], x[lon_col]), "Unknown"), axis=1)

    # 🔥 STEP 4: GROUP
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

    india_eq = earthquake_state(USGS_INDIA)
    india_cy = cyclone_state(IBTRACS_INDIA)

    japan_eq = earthquake_state(USGS_JAPAN)
    japan_ty = cyclone_state(IBTRACS_JAPAN)

    return {
        "India": {"EQ": india_eq, "CY": india_cy},
        "Japan": {"EQ": japan_eq, "TY": japan_ty}
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

    print("✅ FAST state-level data generated!")