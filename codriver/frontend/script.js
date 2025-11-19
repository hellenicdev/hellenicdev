// Theme Preferences
const userPreferences = JSON.parse(localStorage.getItem("preferences")) || { theme: "light" };
document.body.className = userPreferences.theme;

function changeTheme() {
  userPreferences.theme = userPreferences.theme === "light" ? "dark" : "light";
  document.body.className = userPreferences.theme;
  localStorage.setItem("preferences", JSON.stringify(userPreferences));
}
// HUGGING FACE API
const response = await fetch("https://new-codriver.onrender.com", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ message: input })
});


// DOM Elements
const userInput = document.getElementById("userInput");
const messageArea = document.getElementById("messageArea");
const micStatus = document.getElementById("micStatus");

// Constants
const WEATHER_API_KEY = "5b72dabcdd9d4b67a75170510250304";
const NYT_API_KEY = "N8j8mb3TSiexCbefuDeT1Ap5MgKPGwmw";

let gameActive = false;
let secretNumber = null;

// Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = false;

recognition.addEventListener("start", () => micStatus.style.display = "block");
recognition.addEventListener("end", () => micStatus.style.display = "none");

recognition.addEventListener("result", (event) => {
  userInput.value = event.results[0][0].transcript;
  sendMessage();
});

function startListening() {
  recognition.start();
}

// User presses Enter
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") sendMessage();
});

// Utility Functions
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

function addAssistantMessage(response) {
  const assistantContainer = document.createElement("div");
  assistantContainer.classList.add("assistant-message-container");

  const assistantMessage = document.createElement("p");
  assistantMessage.textContent = "Codriver: " + response;
  assistantMessage.classList.add("assistant-message");

  const assistantSpeaker = document.createElement("button");
  assistantSpeaker.textContent = "🔊";
  assistantSpeaker.onclick = () => speak(response);

  assistantContainer.appendChild(assistantMessage);
  assistantContainer.appendChild(assistantSpeaker);
  messageArea.appendChild(assistantContainer);
}

// External Fetches
async function fetchWeather(city) {
  try {
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`);
    const data = await response.json();
    return `🌤 Weather in ${data.location.name}: ${data.current.temp_c}°C, ${data.current.condition.text}`;
  } catch {
    return "Sorry, I couldn't fetch the weather.";
  }
}

async function fetchNews() {
  try {
    const response = await fetch(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${NYT_API_KEY}`);
    const data = await response.json();
    return data.results.slice(0, 5).map(article => `• ${article.title}`).join("\n");
  } catch {
    return "Sorry, I couldn't fetch the top news.";
  }
}

// Random Data Generators
function getRandomQuote() {
  return [
    "The only limit to our realization of tomorrow is our doubts of today.",
    "Be the change you wish to see in the world.",
    "Life is 10% what happens to us and 90% how we react to it.",
    "Keep your face always toward the sunshine—and shadows will fall behind you."
  ][Math.floor(Math.random() * 4)];
}

function getRandomFunFact() {
  return [
    "Honey never spoils!",
    "Bananas are berries, but strawberries aren't!",
    "Sharks existed before trees.",
    "Octopuses have three hearts."
  ][Math.floor(Math.random() * 4)];
}

function getRandomJoke() {
  return [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "I told my computer I needed a break, and it said 'No problem, I'll go to sleep.'"
  ][Math.floor(Math.random() * 3)];
}

function getRandomRiddle() {
  return [
    "What has keys but can’t open locks? A piano.",
    "What can travel around the world while staying in one spot? A stamp.",
    "What gets wetter the more it dries? A towel."
  ][Math.floor(Math.random() * 3)];
}

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `The current time is ${formattedHours}:${minutes} ${period}`;
}

// Main Handler
async function sendMessage() {
  const input = userInput.value.trim();
  if (!input) return;

  const userMessage = document.createElement("p");
  userMessage.textContent = "You: " + input;
  userMessage.classList.add("user-message");
  messageArea.appendChild(userMessage);

  if (gameActive) {
    if (/exit game/i.test(input)) {
      gameActive = false;
      addAssistantMessage("Game exited. How else can I assist you?");
    } else if (/^\d+$/.test(input)) {
      const guess = parseInt(input, 10);
      if (guess === secretNumber) {
        gameActive = false;
        addAssistantMessage("Congratulations! You guessed it right.");
      } else if (guess < secretNumber) {
        addAssistantMessage("Too low. Try again!");
      } else {
        addAssistantMessage("Too high. Try again!");
      }
    } else {
      addAssistantMessage("We're in a game! Please enter a number or type 'exit game'.");
    }
    userInput.value = "";
    return;
  }

  let response = "";

  if (/hello|hi|hey|greetings/i.test(input)) {
    response = "Hello! How can I assist you today?";
  } else if (/quote/i.test(input)) {
    response = getRandomQuote();
  } else if (/weather/i.test(input)) {
    const city = input.split(" ").pop();
    response = await fetchWeather(city);
  } else if (/news/i.test(input)) {
    response = await fetchNews();
  } else if (/fun fact/i.test(input)) {
    response = getRandomFunFact();
  } else if (/joke/i.test(input)) {
    response = getRandomJoke();
  } else if (/riddle/i.test(input)) {
    response = getRandomRiddle();
  } else if (/time/i.test(input)) {
    response = getCurrentTime();
  } else if (/game/i.test(input)) {
    gameActive = true;
    secretNumber = Math.floor(Math.random() * 10) + 1;
    response = "Let's play a game! I'm thinking of a number between 1 and 10. What's your guess?";
  } else if (/calculate|what'?s|what is|^[0-9+\-*/().\s]+$/i.test(input)) {
    try {
      const expression = input.replace(/[^0-9+\-*/().]/g, "");
      const result = Function("'use strict'; return (" + expression + ")")();
      response = `The result is ${result}`;
    } catch {
      response = "I couldn't calculate that. Please check your expression.";
    }
  } else {
    response = "Sorry, I didn't understand that.";
  }

  addAssistantMessage(response);
  userInput.value = "";
  messageArea.scrollTop = messageArea.scrollHeight;
}
