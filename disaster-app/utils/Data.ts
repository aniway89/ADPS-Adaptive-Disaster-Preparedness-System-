import AsyncStorage from '@react-native-async-storage/async-storage';

// ----------------------------------------------------------------------
// Helper: fetch with timeout
// ----------------------------------------------------------------------
const fetchWithTimeout = (url: string, timeoutMs = 8000) => {
  return Promise.race([
    fetch(url),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${url}`)), timeoutMs)
    ),
  ]);
};

// ----------------------------------------------------------------------
// Helper: Haversine distance (km) between two lat/lon points
// ----------------------------------------------------------------------
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ----------------------------------------------------------------------
// Helper: Cached NASA EONET (TTL = 10 minutes) using AsyncStorage
// ----------------------------------------------------------------------
const CACHE_KEY = '@eonet_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getEonetWithCache = async () => {
  try {
    const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const { data, timestamp } = JSON.parse(cachedRaw);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data; // return cached data
      }
    }
    // Fetch fresh data
    const res = await fetchWithTimeout(
      'https://eonet.gsfc.nasa.gov/api/v3/events?limit=100'
    );
    const data = await res.json();
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (err) {
    console.warn('EONET fetch failed, returning empty events', err);
    return { events: [] };
  }
};

// ----------------------------------------------------------------------
// MAIN FUNCTION: getDisasterAlerts (optimised + location‑filtered)
// ----------------------------------------------------------------------
export const getDisasterAlerts = async (lat: number, lon: number) => {
  try {
    // 1. Run all three independent data sources in parallel
    const [weatherPromise, eqPromise, eonetData] = await Promise.allSettled([
      fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,precipitation,precipitation_probability,relative_humidity_2m&alerts=true`
      ),
      fetchWithTimeout(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&limit=5`
      ),
      getEonetWithCache(), // cached NASA events
    ]);

    // -------------------------
    // 2. Parse WEATHER (with fallbacks)
    // -------------------------
    let weather = null;
    if (weatherPromise.status === 'fulfilled') {
      try {
        weather = await weatherPromise.value.json();
      } catch (e) {
        console.warn('Weather JSON parse error', e);
      }
    }

    const temp = Math.round(weather?.current?.temperature_2m ?? 20);
    const wind = weather?.current?.wind_speed_10m ?? 0;
    const rain = weather?.current?.precipitation ?? 0;
    const rainProb = weather?.current?.precipitation_probability ?? 0;
    const humidity = weather?.current?.relative_humidity_2m ?? 50;
    const officialAlerts = weather?.alerts ?? [];

    // -------------------------
    // 3. Parse EARTHQUAKE data
    // -------------------------
    let eqData = null;
    if (eqPromise.status === 'fulfilled') {
      try {
        eqData = await eqPromise.value.json();
      } catch (e) {
        console.warn('Earthquake JSON parse error', e);
      }
    }

    // -------------------------
    // 4. Filter NASA EONET events by distance (200 km radius)
    // -------------------------
    let nasaFlood = false;
    let nasaStorm = false;

    const eonet = eonetData; // already resolved data (or cached)
    if (eonet?.events && Array.isArray(eonet.events)) {
      for (const event of eonet.events) {
        // Some events may lack geometry
        if (!event.geometry || event.geometry.length === 0) continue;

        // Use the most recent geometry (last in array)
        const latestGeo = event.geometry[event.geometry.length - 1];
        // Coordinates are [longitude, latitude] in EONET
        const [eventLon, eventLat] = latestGeo.coordinates;
        const distance = getDistance(lat, lon, eventLat, eventLon);

        // Only consider events within 200 km
        if (distance <= 200) {
          const categories = event.categories.map((c: any) => c.id);
          if (categories.includes('floods')) nasaFlood = true;
          if (categories.includes('severeStorms')) nasaStorm = true;
        }
      }
    }

    // -------------------------
    // 5. RISK ENGINE (local weather + verified NASA events)
    // -------------------------

    // 🌧️ Flood Risk
    let floodRisk = 0;
    if (rain > 50) floodRisk += 30;
    if (rain > 100) floodRisk += 20;
    if (rainProb > 70) floodRisk += 20;
    if (humidity > 80) floodRisk += 10;
    if (wind > 50) floodRisk += 10;
    if (nasaFlood) floodRisk += 20;   // only if NASA flood within 200km
    floodRisk = Math.min(floodRisk, 100);

    // 🌍 Earthquake Risk (already filtered by USGS radius)
    let earthquakeRisk = 0;
    if (eqData?.features) {
      eqData.features.forEach((q: any) => {
        const mag = q?.properties?.mag;
        if (mag >= 4) earthquakeRisk += 20;
        if (mag >= 5) earthquakeRisk += 30;
        if (mag >= 6) earthquakeRisk += 50;
      });
    }
    earthquakeRisk = Math.min(earthquakeRisk, 100);

    // 🌡️ Heat Risk
    let heatRisk = 0;
    if (temp > 35) heatRisk += 30;
    if (temp > 40) heatRisk += 40;
    if (humidity > 70) heatRisk += 20;
    heatRisk = Math.min(heatRisk, 100);

    // 🌪️ Storm Risk
    let stormRisk = 0;
    if (wind > 50) stormRisk += 30;
    if (wind > 80) stormRisk += 40;
    if (rainProb > 60) stormRisk += 20;
    if (nasaStorm) stormRisk += 30;    // only if NASA storm within 200km
    stormRisk = Math.min(stormRisk, 100);

    // -------------------------
    // 6. GENERATE FINAL ALERTS (only high‑risk, verified)
    // -------------------------
    const alerts: string[] = [];

    if (floodRisk >= 70 && nasaFlood) {
      alerts.push('Flood Risk');
    }
    if (stormRisk >= 70 && nasaStorm) {
      alerts.push('Storm Risk');
    }
    if (heatRisk >= 70) {
      alerts.push('Heatwave Risk');
    }
    if (earthquakeRisk >= 50) {
      alerts.push('Earthquake Risk');
    }

    // Also include official weather alerts if any
    if (officialAlerts.length > 0) {
      for (const alert of officialAlerts) {
        if (!alerts.includes(alert.event)) {
          alerts.push(alert.event);
        }
      }
    }

    // -------------------------
    // 7. FINAL RETURN
    // -------------------------
    return {
      location: { lat, lon },
      weather: { temp, wind, rain, rainProb, humidity },
      alerts,
      risk: {
        flood: floodRisk,
        storm: stormRisk,
        heat: heatRisk,
        earthquake: earthquakeRisk,
      },
    };
  } catch (err) {
    console.error('Disaster Engine Fatal Error:', err);
    return {
      location: { lat, lon },
      weather: { temp: 20, wind: 0, rain: 0, rainProb: 0, humidity: 50 },
      alerts: ['Unable to fetch disaster data'],
      risk: { flood: 0, storm: 0, heat: 0, earthquake: 0 },
    };
  }
};