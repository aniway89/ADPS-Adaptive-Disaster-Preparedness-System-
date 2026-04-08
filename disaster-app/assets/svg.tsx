import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

export type IconProps = {
  size?: number;
  color?: string;
};

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = "#000";

export const HomeIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="home-outline" size={size} color={color} />
);

export const CheckIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="check-circle-outline" size={size} color={color} />
);

export const AlertIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="alert-circle-outline" size={size} color={color} />
);

export const deleteIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="delete-outline" size={size} color={color} />
);

export const crossIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="close" size={size} color={color} />
);

export const calanderIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="calendar-month" size={size} color={color} />
);

export const locationIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="map-marker-outline" size={size} color={color} />
);

export const userIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="account-outline" size={size} color={color} />
);

export const windIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="weather-windy" size={size} color={color} />
);

export const cloudIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="cloud-outline" size={size} color={color} />
);

export const rainIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="weather-rainy" size={size} color={color} />
);

export const sunIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="weather-sunny" size={size} color={color} />
);

export const snowIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="weather-snowy" size={size} color={color} />
);

export const thunderIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="weather-lightning" size={size} color={color} />
);

export const humidityIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="water" size={size} color={color} />
);

export const hurricaneIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="weather-hurricane" size={size} color={color} />
);

export const snowflakeIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="snowflake" size={size} color={color} />
);

export const thermometerIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="thermometer" size={size} color={color} />
);

export const coldthermometerIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="thermometer-low" size={size} color={color} />
);

export const hotthermometerIcon = ({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) => (
  <MaterialCommunityIcons name="thermometer-high" size={size} color={color} />
);

export const Icons = {
  home: HomeIcon,
  check: CheckIcon,
  alert: AlertIcon,
  delete: deleteIcon,
  cross: crossIcon,
  calendar: calanderIcon,
  location: locationIcon,
  user: userIcon,
  wind: windIcon,
  cloud: cloudIcon,
  rain: rainIcon,
  sun: sunIcon,
  snow: snowIcon,
  thunder: thunderIcon,
  humidity: humidityIcon,
  hurricane: hurricaneIcon,
  snowflake: snowflakeIcon,
  thermometer: thermometerIcon,
  Thermometer: coldthermometerIcon,
  hotThermometer: hotthermometerIcon,
};

export type IconName = keyof typeof Icons;

export const Icon = ({
  name,
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) => {
  const Component = Icons[name];
  if (!Component) return null;
  return <Component size={size} color={color} />;
};