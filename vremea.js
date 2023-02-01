// https://api.open-meteo.com/v1/forecast?latitude=47.17&longitude=27
//.60&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m
//&daily=weathercode,temperature_2m_max,temperature_2m_min
//,apparent_temperature_max,apparent_temperature_min,precipitation_sum,windspeed_10m_max
//&current_weather=true&timeformat=unixtime&timezone=Europe%2FBerlin

import axios from "axios";

const weatherAPI_KEY =
  "https://api.open-meteo.com/v1/forecast?latitude=47.17&longitude=27.60&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,windspeed_10m_max&current_weather=true&timeformat=unixtime&timezone=Europe%2FBerlin";

export function getWeather(lat, lon, timezone) {
  return axios
    .get(weatherAPI_KEY, {
      params: {
        latitude: lat,
        longitude: lon,
        timezone,
      },
    })
    .then(({ data }) => {
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data),
      };
    });
}

function parseCurrentWeather({ current_weather, daily }) {
  //formatam data care vine
  const {
    temperature: currentTemp,
    windspeed: windSpeed,
    weathercode: iconCode,
  } = current_weather;

  const {
    temperature_2m_max: [maxTemp], // e acelasi lucru cu : const maxTemp = daily.temperature_2m_max[0] - ia prima val din arr
    temperature_2m_min: [minTemp],
    apparent_temperature_max: [maxFeelsLike],
    apparent_temperature_min: [minFeelsLike],
    precipitation_sum: [precip],
  } = daily;

  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
    highFeelsLike: Math.round(maxFeelsLike),
    lowFeelsLike: Math.round(minFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
  };
}

function parseDailyWeather({ daily }) {
  return daily.time.map((time, index) => {
    return {
      timestamp: time * 1000, // *convertime din sec in ms
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
    };
  });
}

function parseHourlyWeather({ hourly, current_weather }) {
  return hourly.time
    .map((time, index) => {
      return {
        timestamp: time * 1000,
        iconCode: hourly.weathercode[index],
        temp: Math.round(hourly.temperature_2m[index]),
        feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        precip: Math.round(hourly.precipitation[index] * 100) / 100,
      };
    })
    .filter(({ timestamp }) => timestamp >= current_weather.time * 1000);
}
