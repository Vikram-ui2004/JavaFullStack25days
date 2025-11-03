const API_GEO = 'https://geocoding-api.open-meteo.com/v1/search?name=';
        const API_FORECAST = 'https://api.open-meteo.com/v1/forecast';

  
        async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) {
         
                        if (response.status === 400) throw new Error("Invalid request parameter.");
                        if (response.status === 404) throw new Error("Resource not found.");
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                } catch (error) {
                    if (i === retries - 1) throw error; // Re-throw on last attempt
                    console.warn(`Fetch failed (attempt ${i + 1}/${retries}). Retrying in ${delay / 1000}s...`, error.message);
                    await new Promise(resolve => setTimeout(resolve, delay * (2 ** i)));
                }
            }
        }




        function getWeatherIcon(code) {
            let icon, description;
            switch(true) {
                case code >= 0 && code < 3: 
                    icon = 'sun';
                    description = 'Clear';
                    break;
                case code === 3: 
                    icon = 'cloud';
                    description = 'Overcast';
                    break;
                case code >= 45 && code <= 48: 
                    icon = 'cloud-fog';
                    description = 'Foggy';
                    break;
                case code >= 51 && code <= 55: 
                    icon = 'cloud-drizzle';
                    description = 'Drizzle';
                    break;
                case code >= 61 && code <= 65:
                    icon = 'cloud-rain';
                    description = 'Rainy';
                    break;
                case code >= 71 && code <= 75: 
                    icon = 'cloud-snow';
                    description = 'Snow';
                    break;
                case code >= 80 && code <= 82:
                    icon = 'cloud-lightning-rain';
                    description = 'Rain Showers';
                    break;
                case code >= 95 && code <= 99:
                    icon = 'cloud-lightning';
                    description = 'Thunderstorm';
                    break;
                default:
                    icon = 'cloud-off';
                    description = 'Unknown';
            }
            return { icon, description };
        }

    
        function renderCurrentWeather(data, location) {
            const current = data.current_weather;
            const daily = data.daily;
            const { icon, description } = getWeatherIcon(current.weather_code);

            const content = `
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-4xl md:text-5xl font-bold">${location}</h2>
                        <p class="text-lg text-gray-400 mt-1">${new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <button class="text-gray-400 hover:text-white transition-colors" onclick="handleGeolocation()">
                         <i data-lucide="locate-fixed" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <div class="flex flex-col md:flex-row items-center md:items-end justify-between">
                    <!-- Main Temperature & Icon -->
                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                        <i data-lucide="${icon}" class="w-20 h-20 text-blue-400 flex-shrink-0"></i>
                        <div>
                            <div id="current-temp">${Math.round(current.temperature)}<span class="text-4xl align-top">°C</span></div>
                            <p class="text-2xl font-semibold text-gray-200 capitalize">${description}</p>
                        </div>
                    </div>

                    <!-- Highlights / Details -->
                    <div class="grid grid-cols-2 gap-4 text-sm w-full md:w-auto md:text-base">
                        <div class="flex items-center space-x-2 text-gray-300">
                            <i data-lucide="thermometer" class="w-4 h-4 text-red-400"></i>
                            <span>High: ${Math.round(daily.temperature_2m_max[0])}°C</span>
                        </div>
                        <div class="flex items-center space-x-2 text-gray-300">
                            <i data-lucide="thermometer-snowflake" class="w-4 h-4 text-cyan-400"></i>
                            <span>Low: ${Math.round(daily.temperature_2m_min[0])}°C</span>
                        </div>
                        <div class="flex items-center space-x-2 text-gray-300">
                            <i data-lucide="wind" class="w-4 h-4 text-white"></i>
                            <span>Wind: ${current.windspeed} km/h</span>
                        </div>
                        <div class="flex items-center space-x-2 text-gray-300">
                            <i data-lucide="compass" class="w-4 h-4 text-white"></i>
                            <span>Dir: ${current.winddirection}°</span>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('current-weather-content').innerHTML = content;
            lucide.createIcons(); // Re-render icons after DOM update
        }

    
        function renderDailyForecast(data) {
            const container = document.getElementById('daily-forecast');
            container.innerHTML = `<h2 class="text-xl font-bold mb-2 text-gray-300">7-Day Forecast</h2>`;

         
            for (let i = 1; i < 7; i++) {
                const date = new Date(data.daily.time[i]);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const { icon, description } = getWeatherIcon(data.daily.weather_code[i]);
                
                const card = `
                    <div class="card p-4 rounded-xl flex items-center justify-between">
                        <span class="font-semibold text-gray-400 w-1/4">${dayName}</span>
                        <div class="flex items-center space-x-2 w-1/4">
                            <i data-lucide="${icon}" class="w-5 h-5 text-yellow-400"></i>
                            <span class="text-sm text-gray-300 hidden sm:inline">${description}</span>
                        </div>
                        <div class="w-1/4 text-right">
                            <span class="font-semibold">${Math.round(data.daily.temperature_2m_max[i])}°</span>
                            <span class="text-gray-500 ml-2">${Math.round(data.daily.temperature_2m_min[i])}°</span>
                        </div>
                    </div>
                `;
                container.innerHTML += card;
            }
            lucide.createIcons();
        }

        function renderHourlyOutlook(data) {
            const container = document.getElementById('hourly-outlook');
            container.innerHTML = '';
            const now = new Date();
            const currentHourIndex = data.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
            

            for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
                if (i >= data.hourly.time.length) break; // Safety check

                const time = new Date(data.hourly.time[i]);
                const hour = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                const temp = Math.round(data.hourly.temperature_2m[i]);
                const precip = data.hourly.precipitation_probability[i];
                const { icon } = getWeatherIcon(data.hourly.weather_code[i]);
                
                const card = `
                    <div class="card flex-shrink-0 w-32 p-4 rounded-xl text-center">
                        <p class="text-sm font-semibold text-gray-400">${hour}</p>
                        <div class="my-2">
                            <i data-lucide="${icon}" class="w-6 h-6 mx-auto text-blue-400"></i>
                        </div>
                        <p class="text-xl font-bold">${temp}°C</p>
                        <p class="text-xs text-green-400 flex items-center justify-center mt-1">
                            <i data-lucide="droplets" class="w-3 h-3 mr-1"></i>
                            ${precip}%
                        </p>
                    </div>
                `;
                container.innerHTML += card;
            }
            lucide.createIcons();
        }


        function updateUI(data, location) {
            renderCurrentWeather(data, location);
            renderDailyForecast(data);
            renderHourlyOutlook(data);
            document.getElementById('current-panel').classList.add('bg-opacity-50'); // Add a slight dynamic effect
        }

   
        function setLoading(isLoading) {
            const content = document.getElementById('current-weather-content');
            const button = document.getElementById('search-btn');
            
            if (isLoading) {
                content.innerHTML = `<div class="flex justify-center items-center h-48"><div class="loader"></div></div>`;
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
                document.getElementById('hourly-outlook').innerHTML = `<div class="flex justify-center items-center h-24 w-full card rounded-2xl p-4"><p class="text-gray-400">Loading hourly data...</p></div>`;
                document.getElementById('daily-forecast').innerHTML = `<h2 class="text-xl font-bold mb-2 text-gray-300">7-Day Forecast</h2><div class="flex justify-center items-center h-48 card rounded-2xl p-4"><p class="text-gray-400">Loading forecast...</p></div>`;
            } else {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }

        function displayError(message) {
            const content = document.getElementById('current-weather-content');
            content.innerHTML = `
                <div class="flex flex-col justify-center items-center h-48 p-4 text-center">
                    <i data-lucide="alert-triangle" class="w-10 h-10 text-red-500 mb-4"></i>
                    <p class="text-lg font-semibold text-red-400">Error</p>
                    <p class="text-gray-400">${message}</p>
                </div>
            `;
            document.getElementById('daily-forecast').innerHTML = `<p class="text-center text-red-400 p-4">Cannot load forecast data.</p>`;
            document.getElementById('hourly-outlook').innerHTML = `<p class="text-center text-red-400 p-4">Cannot load hourly data.</p>`;
            lucide.createIcons();
        }

   

   
        async function getCoordinates(city) {
            if (!city) return null;
            try {
                const url = `${API_GEO}${encodeURIComponent(city)}&count=1&language=en&format=json`;
                const geoData = await fetchWithRetry(url);

                if (!geoData.results || geoData.results.length === 0) {
                    throw new Error(`City "${city}" not found. Please check spelling.`);
                }
                
                const result = geoData.results[0];
                return {
                    latitude: result.latitude,
                    longitude: result.longitude,
                    name: result.name
                };
            } catch (error) {
                console.error("Geocoding Error:", error);
                throw new Error(`Could not find location: ${error.message}`);
            }
        }

       
        async function fetchWeatherData(lat, lon, locationName) {
            try {
                const url = `${API_FORECAST}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`;
                const weatherData = await fetchWithRetry(url);
                updateUI(weatherData, locationName);
            } catch (error) {
                console.error("Weather Fetch Error:", error);
                displayError("Failed to fetch weather data. Please try again later.");
            }
        }

       
        
        async function handleCityQuery(city) {
            setLoading(true);
            try {
                const location = await getCoordinates(city);
                if (location) {
                    await fetchWeatherData(location.latitude, location.longitude, location.name);
                } else {
                    throw new Error('Could not resolve city location.');
                }
            } catch (error) {
                displayError(error.message);
            } finally {
                setLoading(false);
            }
        }

        function handleSearch() {
            const city = document.getElementById('city-input').value.trim();
            if (city) {
                handleCityQuery(city);
            } else {
                displayError("Please enter a city name to search.");
            }
        }

        function handleGeolocation() {
            setLoading(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // Reverse geocode to get a city name (for better UX)
                    const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
                    let locationName = "Your Current Location";
                    try {
                        const response = await fetch(reverseGeoUrl);
                        const data = await response.json();
                        locationName = data.address.city || data.address.town || data.address.village || 'Unknown Location';
                    } catch(e) {
                        console.warn("Reverse geocoding failed, using generic name.");
                    }

                    await fetchWeatherData(lat, lon, locationName);
                    setLoading(false);
                }, (error) => {
                    setLoading(false);
                    displayError(`Geolocation failed. Error: ${error.message}. Please search manually.`);
                });
            } else {
                setLoading(false);
                displayError("Geolocation is not supported by this browser.");
            }
        }



        function initApp() {

            const lastCity = sessionStorage.getItem('lastCity');
            if (lastCity) {
                handleCityQuery(lastCity);
            } else {
       
                handleGeolocation();
            }

 
            document.getElementById('city-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSearch();
                }
            });


            lucide.createIcons();
        }


        window.onload = initApp;
