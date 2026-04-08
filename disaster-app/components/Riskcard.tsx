import React from "react";
import { Text, View } from "react-native";

export const RiskCard = ({ data }: any) => {
  if (!data) return null;

  const { weather, risk, alerts } = data;

  return (
    <View style={{ padding: 12, backgroundColor: "#111", borderRadius: 10 }}>
      
      <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
        🌍 Risk Overview
      </Text>

      <Text style={{ color: "#ccc" }}>
        🌡 Temp: {weather.temp}°C
      </Text>
      <Text style={{ color: "#ccc" }}>
        💧 Humidity: {weather.humidity}%
      </Text>
      <Text style={{ color: "#ccc" }}>
        🌧 Rain: {weather.rain} mm ({weather.rainProb}%)
      </Text>
      <Text style={{ color: "#ccc" }}>
        🌬 Wind: {weather.wind} km/h
      </Text>

      <View style={{ marginTop: 10 }}>
        <Text style={{ color: "#fff" }}>
          Flood Risk: {risk.flood}%
        </Text>
        <Text style={{ color: "#fff" }}>
          Storm Risk: {risk.storm}%
        </Text>
        <Text style={{ color: "#fff" }}>
          Heat Risk: {risk.heat}%
        </Text>
        <Text style={{ color: "#fff" }}>
          Earthquake Risk: {risk.earthquake}%
        </Text>
      </View>

      {alerts.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "red" }}>
            ⚠ Alerts: {alerts.join(", ")}
          </Text>
        </View>
      )}
    </View>
  );
};