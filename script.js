const apiKey = '1ab8d06a75a76a1e269238fbd080b6d5';

$(function() {
    $("#locationInput").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: `https://api.openweathermap.org/data/2.5/find?q=${request.term}&type=like&sort=population&cnt=30&appid=${apiKey}`,
                dataType: "json",
                success: function(data) {
                    response(data.list.map(city => `${city.name}, ${city.sys.country}`));
                },
                error: function(error) {
                    console.error('Error:', error);
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            $("#locationInput").val(ui.item.value);
            getWeatherByLocation();
        }
    });
});

function displayWeather(data) {
    document.getElementById('weatherInfo').style.display = 'block';
    document.getElementById('location').innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById('description').innerText = `Weather: ${data.weather[0].description}`;
    document.getElementById('temperature').innerText = `Temperature: ${data.main.temp}°C`;
    document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').innerText = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById('pressure').innerText = `Pressure: ${data.main.pressure} hPa`;
    document.getElementById('visibility').innerText = `Visibility: ${data.visibility} meters`;
    document.getElementById('sunrise').innerText = `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
    document.getElementById('sunset').innerText = `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;

    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weatherIcon').innerHTML = `<img src="${icon}" alt="Weather icon">`;

    const weatherDescription = data.weather[0].main.toLowerCase();
    setWeatherBackground(weatherDescription);

    getHourlyForecast(data.coord.lat, data.coord.lon);
}

function getWeatherByLocation() {
    const location = document.getElementById('locationInput').value;
    if (location) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => displayWeather(data))
            .catch(error => console.error('Error:', error));
    }
}

function getWeatherByUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => displayWeather(data))
                .catch(error => console.error('Error:', error));
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function setWeatherBackground(description) {
    const body = document.body;
    const container = document.querySelector('.background-container');
    if (container) container.remove();

    const newContainer = document.createElement('div');
    newContainer.className = `background-container ${description.includes('rain') ? 'rainy' : description.includes('cloud') ? 'cloudy' : 'sunny'}`;
    body.appendChild(newContainer);

    if (description.includes('rain')) {
        for (let i = 0; i < 50; i++) {
            const raindrop = document.createElement('div');
            raindrop.className = 'raindrop';
            newContainer.appendChild(raindrop);
        }
    } else if (description.includes('cloud')) {
        for (let i = 0; i < 4; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            newContainer.appendChild(cloud);
        }
    }
}

function getHourlyForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const hourlyForecast = document.getElementById('hourlyForecast');
            hourlyForecast.innerHTML = '';

            for (let i = 0; i < 8; i++) {
                const forecast = data.list[i];
                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <p>${new Date(forecast.dt * 1000).toLocaleTimeString()}</p>
                    <p>${forecast.main.temp}°C</p>
                    <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
                `;
                hourlyForecast.appendChild(forecastItem);
            }
        })
        .catch(error => console.error('Error:', error));
}
