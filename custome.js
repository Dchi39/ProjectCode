const apiKey = '13e91c411cde8290346ee240dee13eca'; // Your OpenWeatherMap API key

async function getWeather(defaultCity = null) {
    // Get the city entered by the user or use the default city
    const city = defaultCity || document.getElementById('city').value;

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === '200') {
            displayWeather(data);
            createTempHumidityChart(data);
            createWindSpeedChart(data);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error fetching weather data. Please check the city name and try again.');
    }
}

function displayWeather(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    if (data && data.list) {
        const dailyData = {};
        data.list.forEach(entry => {
            const date = new Date(entry.dt * 1000);
            const day = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!dailyData[day]) {
                dailyData[day] = { 
                    temps: [], 
                    weather: entry.weather[0].description, 
                    icon: entry.weather[0].icon,
                    windSpeed: entry.wind.speed,
                    humidity: entry.main.humidity,
                    dayName: date.toLocaleDateString('en-US', { weekday: 'long' }) // Get day name
                };
            }
            dailyData[day].temps.push(entry.main.temp);
        });

        const days = Object.keys(dailyData).slice(0, 5);
        days.forEach(day => {
            const dayName = dailyData[day].dayName;
            const date = new Date(day).toLocaleDateString();
            const temps = dailyData[day].temps;
            const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
            const weather = dailyData[day].weather;
            const icon = `http://openweathermap.org/img/wn/${dailyData[day].icon}.png`;
            const windSpeed = dailyData[day].windSpeed; 
            const humidity = dailyData[day].humidity;

            const card = document.createElement('div');
            card.className = 'weather-card';
            card.innerHTML = `
                <h4>${dayName}</h3>
                <p>${date}</p>
                <img src="${icon}" alt="${weather}">
                <p class="temp">${avgTemp}°C</p>
                <p>${weather}</p>
                <p>Wind: ${windSpeed} m/s</p> 
                <p>Humidity: ${humidity}%</p>
            `;
            forecastContainer.appendChild(card);
        });
    } else {
        forecastContainer.innerHTML = '<p>No data available.</p>';
    }
}

function createTempHumidityChart(data) {
    const labels = [];
    const tempData = [];
    const humidityData = [];

    data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const timeLabel = `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getHours()}:00`;
        labels.push(timeLabel);
        tempData.push(entry.main.temp);
        humidityData.push(entry.main.humidity);
    });

    const ctx = document.getElementById('tempHumidityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: tempData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y-axis-temp',
                },
                {
                    label: 'Humidity (%)',
                    data: humidityData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'y-axis-humidity',
                }
            ]
        },
        options: {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-temp',
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Temperature (°C)'
                        }
                    },
                    {
                        id: 'y-axis-humidity',
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Humidity (%)'
                        },
                        gridLines: {
                            drawOnChartArea: false, // Prevent grid lines overlapping
                        },
                    }
                ]
            }
        }
    });
}

function createWindSpeedChart(data) {
    const labels = [];
    const windSpeedData = [];

    data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const timeLabel = `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getHours()}:00`;
        labels.push(timeLabel);
        windSpeedData.push(entry.wind.speed);
    });

    const ctx = document.getElementById('windSpeedChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Wind Speed (m/s)',
                    data: windSpeedData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'y-axis-wind',
                }
            ]
        },
        options: {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-wind',
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Wind Speed (m/s)'
                        }
                    }
                ]
            }
        }
    });
}

////////Clock data/////////////// 
function updateClock() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;

    document.getElementById('hour').style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    document.getElementById('minute').style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    document.getElementById('second').style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

    const digitalTime = now.toLocaleTimeString();
    const day = now.toLocaleString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('digital-time').textContent = digitalTime;
    document.getElementById('day').textContent = day;
    document.getElementById('date').textContent = date;
}

setInterval(updateClock, 1000);
updateClock();


//////video///////////
const video = document.getElementById('video');
const ws = new WebSocket('ws://localhost:6789');
////////////////websocket///////////////////
ws.onopen = () => {
    console.log("WebSocket connection established");
};

ws.onmessage = (event) => {
    const message = event.data;
    console.log(`Received message: ${message}`);

    // Display soil moisture data
    if (message.startsWith('moisture:')) {
        const moistureValue = message.split(':')[1];
        document.getElementById('moisture-value').innerText = moistureValue;
    }
};

function sendCommand(command) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(command);
    } else {
        console.error("WebSocket connection not open");
    }
}
///////////////////////////////////////////////////////
const stageProgression = [
    "Seed-Germinating",
    "Seedling-Stage",
    "Seedling-stage-2",
    "Vegetation-Growth",
    "vegetation-growth-2",
    "Flowering",
    "Fruiting",
    "Harvesting"
];

let previousGrowingStage = "";

//////////////// WebSocket Setup ///////////////////
ws.onopen = function () {
    console.log("WebSocket connection established.");
};

ws.onmessage = function (event) {
    try {
        // Parse the incoming data
        const data = JSON.parse(event.data);

        // Update the video feed
        if (data.frame) {
            video.src = "data:image/jpeg;base64," + data.frame;
        }

        // Check and handle growing stage changes
        if (data.growing_stage) {
            const currentStage = data.growing_stage;

            if (currentStage !== previousGrowingStage) {
                console.log(`Growing stage changed to: ${currentStage}.`);

                // Update the growing stage field
                document.getElementById("growingStage").value = currentStage;

                // Reset the plant disease field to "Healthy"
                document.getElementById("plantDisease").value = "Healthy";

                // Clear active diseases
                data.active_diseases = [];

                // Determine the next stage
                const currentStageIndex = stageProgression.indexOf(currentStage);
                if (currentStageIndex !== -1 && currentStageIndex < stageProgression.length - 1) {
                    const nextStage = stageProgression[currentStageIndex + 1];
                    document.getElementById("nextStage").value = nextStage;
                } else {
                    document.getElementById("nextStage").value =
                        currentStage === "Harvesting" ? "Final Stage" : "Unknown Stage";
                }

                // Update the previous stage
                previousGrowingStage = currentStage;
            }
        }

        // Append new diseases to the plant disease field
        if (data.active_diseases) {
            const diseaseList = data.active_diseases;
            const currentDiseases = document.getElementById("plantDisease").value;

            diseaseList.forEach((disease) => {
                if (currentDiseases === "Healthy") {
                    // Replace "Healthy" with the first detected disease
                    document.getElementById("plantDisease").value = disease;
                } else if (!currentDiseases.includes(disease)) {
                    // Append new diseases
                    document.getElementById("plantDisease").value += ", " + disease;
                }
            });
        }

        

        console.log("Dashboard updated:", data);
    } catch (error) {
        console.error("Error parsing WebSocket message:", error);
    }
};

ws.onerror = function (error) {
    console.error("WebSocket error:", error);
};

ws.onclose = function () {
    console.log("WebSocket connection closed.");
};

//conect temp humidity sensor///////////////////////
const wss = new WebSocket('ws://192.168.8.121:81'); // Change to ESP32 IP

    // WebSocket event listeners
    wss.onopen = () => {
      console.log('Connected to WebSocket server');
      // Automatically request data when the connection opens
      wss.send('getData');
    };

    wss.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    wss.onmessage = (event) => {
      // Parse the JSON data received from the ESP32
      const data = JSON.parse(event.data);
      document.getElementById('temperature').textContent =  data.temperature + ' °C';
      document.getElementById('humidity').textContent =  data.humidity + ' %';
      document.getElementById('moisture-value').textContent = data.soilMoisture + ' %';
    };

    // Handle WebSocket errors
    wss.onerror = (error) => {
      console.error('WebSocket Error: ' + error);
    };

    // Establish WebSocket connection/////////////////////////////////
const wp = new WebSocket('ws://localhost:6791'); // Replace with your WebSocket port for additional functionality

wp.onopen = () => {
    console.log("WebSocket connected.");
};

wp.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log("Received response:", response);

    // Check if prediction is defined
    if (response.prediction !== undefined) {
        if (response.prediction === 0) {
            // Set to "Ready to Harvest" for Harvesting stage
            document.getElementById("harvestPrediction").value = "Ready to Harvest";
        } else {
            // Update prediction for harvesting days
            document.getElementById("harvestPrediction").value = `${response.prediction} days`;
        }
    } else if (response.error) {
        console.error("Error from server:", response.error);
    }
};

// Function to fetch real-time sensor values and send them to the server
function sendSensorData() {
    const temperature = document.getElementById("temperature").textContent.replace("°C", "").trim();
    const humidity = document.getElementById("humidity").textContent.replace("%", "").trim();
    const moisture = document.getElementById("moisture-value").textContent.replace("%", "").trim();
    const growingStage = document.getElementById("growingStage").value.trim();

    const sensorData = {
        temperature: parseFloat(temperature) || 0,
        humidity: parseFloat(humidity) || 0,
        soil_moisture: parseFloat(moisture) || 0,
        growing_stage: growingStage || "Unknown Stage",
    };

   
    // Send the data to the server
    wp.send(JSON.stringify(sensorData));
}

// Send sensor data to the server every 5 seconds
setInterval(sendSensorData, 1000); // Adjust interval as needed


// simulation
function updateSimulation() {

    const images = {
        "Seed-Germinating": "Seed-Germinating.jpeg",
        "Seedling-Stage": "seedling.webp",
        "Vegetation-Growth": "Vegetation-Growth.jpeg",
        "Flowering": "Flowering.webp",
        "Fruiting": "Fruiting.webp",
        "Harvesting":"Harvesting.webp",
        "Seedling-stage-2":"seedling2.jpeg",
        "Vegetation-Growth-2":"vegetation2.webp",
    };
    const diseaseImages = {
        "seed_wilt": "seed_wilting.webp",
        "damping_off": "Damping-Off.webp",
        "sedlling_pm": "sedlling_pm.webp",
        "seedling_willting": "seedling_willting.webp",
        "V_Powerdey": "V_Powerdey.jpeg",
        "V_willting": "V_willting.jpeg",
        "Floweing_mildew": "flower_pm.webp",
        "Flowering_seed_wilting": "flowering_wilting.webp",
        "Fruiting_pm": "Fruiting_pm.webp",
        "Fruting_Wilting": "Fruting_Wilting.webp",
        "Harvesting_wilt": "harvest-wilting.webp",
        "Harvesting_pm": "harvest-pm.webp",
    };

    // Get real-time data from the webpage
    const temperature = parseFloat(document.getElementById("temperature").textContent.replace("°C", "").trim());
    const humidity = parseFloat(document.getElementById("humidity").textContent.replace("%", "").trim());
    const moisture = parseFloat(document.getElementById("moisture-value").textContent.replace("%", "").trim());
    const growingStage = document.getElementById("growingStage").value.trim();

    // Default image source
    let imgSrc = `Model_Images/all.webp`;

    // Apply conditions based on the growing stage
    if (growingStage && images[growingStage]) {
        // Default image for the detected stage
        imgSrc = `Model_Images/${images[growingStage]}`;
        
        // Stage-specific conditions for disease images
        if (growingStage === "Seed-Germinating") {
            if (humidity > 80 && temperature < 27) {
                imgSrc = `Model_Images/${diseaseImages["damping_off"]}`;
            } else if (temperature > 35 && moisture < 30) {
                imgSrc = `Model_Images/${diseaseImages["seed_wilt"]}`;
            }
        }else if (growingStage === "Seed-Germinating-2") {
            if (humidity > 80 && temperature < 27) {
                imgSrc = `Model_Images/${diseaseImages["damping_off"]}`;
            } else if (temperature > 35 && moisture < 30) {
                imgSrc = `Model_Images/${diseaseImages["seed_wilt"]}`;
            }
        }else if (growingStage === "Seedling-Stage") {
            if (humidity > 60 && temperature < 30) {
                imgSrc = `Model_Images/${diseaseImages["sedlling_pm"]}`;
            } else if (temperature > 30 && moisture < 40) {
                imgSrc = `Model_Images/${diseaseImages["seedling_willting"]}`;
            }
        } else if (growingStage === "Vegetation-Growth") {
            if (humidity > 80 && temperature < 30) {
                imgSrc = `Model_Images/${diseaseImages["V_Powerdey"]}`;
            } else if (temperature > 30 && moisture < 30) {
                imgSrc = `Model_Images/${diseaseImages["V_willting"]}`;
            }
        }else if (growingStage === "Vegetation-Growth-2") {
            if (humidity > 80 && temperature < 30) {
                imgSrc = `Model_Images/${diseaseImages["V_Powerdey"]}`;
            } else if (temperature > 30 && moisture < 30) {
                imgSrc = `Model_Images/${diseaseImages["V_willting"]}`;
            }
        }else if (growingStage === "Flowering") {
            if (humidity > 70 && temperature < 27) {
                imgSrc = `Model_Images/${diseaseImages["Floweing_mildew"]}`;
            } else if (temperature > 30 && moisture < 30) {
                imgSrc = `Model_Images/${diseaseImages["Flowering_seed_wilting"]}`;
            }
        } else if (growingStage === "Fruiting") {
            if (humidity > 80 && temperature < 24) {
                imgSrc = `Model_Images/${diseaseImages["Fruiting_pm"]}`;
            } else if (temperature > 30 && moisture < 30) {
                imgSrc = `Model_Images/${diseaseImages["Fruting_Wilting"]}`;
            }
        } else if (growingStage === "Harvesting") {
            if (humidity > 60 && temperature < 25) {
                imgSrc = `Model_Images/${diseaseImages["Harvesting_pm"]}`;
            } else if (temperature > 30 && moisture < 30) {
                imgSrc = `Model_Images/${diseaseImages["Harvesting_wilt"]}`;
            }
        }
    }

    // Update the image inside the 'simu-frame' div
    const imgFrame = document.getElementById("simu-frame");
    imgFrame.innerHTML = `<img src="${imgSrc}" alt="${growingStage} Image" style="width: 350px; height: 350px;">`;
}

// Set up a listener for changes in data
function setupRealTimeUpdate() {
    // Monitor changes in real-time sensor data
    setInterval(updateSimulation, 1000); // Update every second
}

// Call the setup function
setupRealTimeUpdate();


///conect with raspberry pi////////////////////////
const btn = new WebSocket('ws://localhost:6792');

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

       
        function sendCommand(command) {
            if (btn.readyState === WebSocket.OPEN) {
                btn.send(command);
            } else {
                console.error("WebSocket connection not open");
            }
        }
//////////////////////////////////////////////