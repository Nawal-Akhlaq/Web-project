const apiKey = "f919eafea249cbada612300ff8a2a34f"; // Replace with your OpenWeatherMap API key
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherInfo = document.getElementById("weather-info");

const getWeatherData = async (cityName) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("City not found or API issue");
    }
    const weatherData = await response.json();
    return weatherData;
  } catch (error) {
    throw new Error("City not found or API issue");
  }
};

const displayWeather = (data) => {
    const city = data.name;
    const temp = Math.round(data.main.temp - 273.15); // Convert Kelvin to Celsius
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    let bodyClass = "";
    if (description.includes("rain")) {
        bodyClass = "rainy";
    } else if (description.includes("cloud")) {
        bodyClass = "cloudy";
    } else if (description.includes("clear")) {
        bodyClass = "sunny";
    } else if (description.includes("smoke")) {
        bodyClass = "smoke";
    } else {
        bodyClass = "cold";
    }

    document.body.className = bodyClass + " slide";

    weatherInfo.innerHTML = `
        <h2>${city}</h2>
        <p>Temperature: ${temp}°C</p>
        <p>Description: ${description}</p>
        <img class="weather-icon" src="${iconUrl}" alt="Weather Icon">
    `;
};
  

searchBtn.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (!cityName) {
    alert("Please enter a city name");
    return;
  }

  getWeatherData(cityName)
    .then((weatherData) => {
      displayWeather(weatherData);
    })
    .catch((error) => {
      if (error.message === "City not found or API issue") {
        alert("City not found. Please try a different city name.");
      } else {
        alert("Error: An unexpected issue occurred.");
        console.error(error);
      }
    });
});
