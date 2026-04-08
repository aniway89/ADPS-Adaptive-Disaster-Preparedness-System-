export const getDisasterAlerts = async (lat: number, lon: number) => {
  try {
    // -------------------------
    // 🔥 WEATHER (Open-Meteo)
    // -------------------------
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,precipitation,precipitation_probability,relative_humidity_2m`
    );

    const weather = await weatherRes.json();

    const temp = Math.round(weather.current.temperature_2m);
    const wind = weather.current.wind_speed_10m;
    const rain = weather.current.precipitation;
    const rainProb = weather.current.precipitation_probability;
    const humidity = weather.current.relative_humidity_2m;

    // -------------------------
    // 🌍 EARTHQUAKE (USGS)
    // -------------------------
    const eqRes = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&limit=5`
    );
    const eqData = await eqRes.json();

    // -------------------------
    // 🌐 NASA EONET
    // -------------------------
    const eonetRes = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v3/events`
    );
    const eonet = await eonetRes.json();

    // -------------------------
    // 🔥 VERIFICATION FLAGS
    // -------------------------
    const nasaFlood = eonet?.events?.some((e: any) =>
      e.categories?.some((c: any) => c.id === "floods")
    );

    const nasaStorm = eonet?.events?.some((e: any) =>
      e.categories?.some((c: any) => c.id === "severeStorms")
    );

    // -------------------------
    // 🔥 RISK ENGINE
    // -------------------------

    // 🌧️ Flood Risk
    let floodRisk = 0;

    if (rain > 50) floodRisk += 30;
    if (rain > 100) floodRisk += 20;
    if (rainProb > 70) floodRisk += 20;
    if (humidity > 80) floodRisk += 10;
    if (wind > 50) floodRisk += 10;
    if (nasaFlood) floodRisk += 20;

    floodRisk = Math.min(floodRisk, 100);

    // 🌍 Earthquake Risk
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
    if (nasaStorm) stormRisk += 30;

    stormRisk = Math.min(stormRisk, 100);

    // -------------------------
    // 🔥 VERIFIED ALERTS ONLY
    // -------------------------
    const alerts: string[] = [];

    if (floodRisk >= 70 && nasaFlood) {
      alerts.push("Flood Risk");
    }

    if (stormRisk >= 70 && nasaStorm) {
      alerts.push("Storm Risk");
    }

    if (heatRisk >= 70) {
      alerts.push("Heatwave Risk");
    }

    if (earthquakeRisk >= 50) {
      alerts.push("Earthquake Risk");
    }

    // -------------------------
    // 🔥 FINAL RETURN
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
    console.error("Disaster Engine Error:", err);
    return null;
  }
};