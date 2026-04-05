export const getDisasterAlerts = async (lat: number, lon: number) => {
  try {
    // -------------------------
    // 🔥 FETCH WEATHER (Open-Meteo)
    // -------------------------
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation,precipitation_probability`
    );
    const weather = await weatherRes.json();

    const temp = weather.current.temperature_2m;
    const wind = weather.current.wind_speed_10m;
    const rain = weather.current.precipitation;
    const rainProb = weather.current.precipitation_probability;

    // -------------------------
    // 🔥 FETCH EARTHQUAKE (USGS)
    // -------------------------
    const eqRes = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&limit=5`
    );
    const eqData = await eqRes.json();

    // -------------------------
    // 🔥 FETCH DISASTER (NASA EONET)
    // -------------------------
    const eonetRes = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v3/events`
    );
    const eonet = await eonetRes.json();

    // -------------------------
    // 🔥 ALERT ENGINE
    // -------------------------
    const alerts: string[] = [];

    // 🌧️ Rain / Flood
    if (rain > 50) alerts.push("Heavy Rain");
    if (rain > 100) alerts.push("Flood Risk");

    // 🌡️ Heatwave
    if (temp > 40) alerts.push("Heatwave");
    if (temp > 45) alerts.push("Severe Heatwave");

    // 🌪️ Storm / Cyclone
    if (wind > 60) alerts.push("Storm Warning");
    if (wind > 100) alerts.push("Cyclone Risk");

    // 🌍 Earthquake
    eqData.features.forEach((q: any) => {
      if (q.properties.mag >= 5) {
        alerts.push(`Earthquake M${q.properties.mag}`);
      }
    });

    // 🌐 NASA EONET events (basic filter)
    eonet.events.forEach((event: any) => {
      if (event.categories.some((c: any) => c.id === "severeStorms")) {
        alerts.push("Severe Storm (NASA)");
      }
      if (event.categories.some((c: any) => c.id === "floods")) {
        alerts.push("Flood (NASA)");
      }
      if (event.categories.some((c: any) => c.id === "wildfires")) {
        alerts.push("Wildfire");
      }
    });

    // -------------------------
    // 🔥 CLEAN RESULT
    // -------------------------
    return {
      location: { lat, lon },
      weather: { temp, wind, rain, rainProb },
      alerts: [...new Set(alerts)] // remove duplicates
    };

  } catch (err) {
    console.error("Disaster Engine Error:", err);
    return null;
  }
};