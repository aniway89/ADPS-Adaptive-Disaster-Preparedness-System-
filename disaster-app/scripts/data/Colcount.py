import pandas as pd
import os
import time

# -------------------------
# PATH SETUP
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FILES = {
    "USGS_INDIA": os.path.join(BASE_DIR, "USGS_IN.csv"),
    "USGS_JAPAN": os.path.join(BASE_DIR, "USGS_JP.csv"),
    "IBTRACS_INDIA": os.path.join(BASE_DIR, "NOSS_IN.csv"),
    "IBTRACS_JAPAN": os.path.join(BASE_DIR, "NOSS_WP.csv"),
}


# -------------------------
# ANALYSIS FUNCTION
# -------------------------
def analyze_file(name, path, lat_col, lon_col):
    print(f"\n📂 FILE: {name}")

    try:
        df = pd.read_csv(path, low_memory=False)

        rows, cols = df.shape
        print(f"Rows: {rows}")
        print(f"Columns: {cols}")

        # check coords
        if lat_col in df.columns and lon_col in df.columns:
            df[lat_col] = pd.to_numeric(df[lat_col], errors="coerce")
            df[lon_col] = pd.to_numeric(df[lon_col], errors="coerce")

            df = df.dropna(subset=[lat_col, lon_col])

            unique_coords = len(set(zip(df[lat_col], df[lon_col])))

            print(f"Valid coordinate rows: {len(df)}")
            print(f"Unique locations (REAL API calls): {unique_coords}")

            # ⏱️ TIME ESTIMATION
            # assume ~0.5 sec per API call
            estimated_seconds = unique_coords * 0.5
            estimated_minutes = estimated_seconds / 60

            print(f"⏱️ Estimated time: {round(estimated_minutes, 2)} minutes")

        else:
            print("⚠️ No coordinate columns found")

    except Exception as e:
        print(f"❌ Error reading file: {e}")


# -------------------------
# RUN ANALYSIS
# -------------------------
if __name__ == "__main__":

    analyze_file("USGS_INDIA", FILES["USGS_INDIA"], "latitude", "longitude")
    analyze_file("USGS_JAPAN", FILES["USGS_JAPAN"], "latitude", "longitude")

    analyze_file("IBTRACS_INDIA", FILES["IBTRACS_INDIA"], "LAT", "LON")
    analyze_file("IBTRACS_JAPAN", FILES["IBTRACS_JAPAN"], "LAT", "LON")

    print("\n✅ Analysis complete")
    
    
    
    time.sleep(1000)  # just to separate outputs