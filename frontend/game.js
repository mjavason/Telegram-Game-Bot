const gameArea = document.getElementById("game-area");
const message = document.getElementById("message");
const timerElement = document.getElementById("timer");
const blinkInterval = 500; // Blinking interval in milliseconds
let blinkIntervalId;
handleMissingUsername();
updateLeaderBoard();

// Initial state variables
let isVisible = true;
let clicks = 0;

// Function to retrieve username from URL (optional error handling)
function getUsernameFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("username") || ""; // Return empty string if username not found
}

// Function to check for missing username and redirect if needed
function handleMissingUsername() {
  const username = getUsernameFromUrl();
  if (!username) window.location = "error.html";
}

function handleClick() {
  clicks++;
  gameArea.textContent = clicks; // Update displayed click count

  // Add animation styles for swelling on click
  gameArea.classList.add("swell");
  setTimeout(() => {
    gameArea.classList.remove("swell");
  }, 200); // Remove animation class after 200ms (adjust duration as needed)
}

function handleGameOver() {
  clearTimeout(timer);
  message.textContent = `Game Over! Your score: ${clicks}`;
  uploadScore(clicks); // Upload score
  gameArea.removeEventListener("click", handleClick);
  startBlinking();
}

function startGame() {
  document.getElementById("trigger-btn").style.display = "none";
  stopBlinking();
  gameArea.addEventListener("click", handleClick);
  message.textContent = "Click as fast as you can!";
  clicks = 0; // Reset click count
  gameArea.textContent = clicks; // Update displayed click count initially

  remainingTime = 30; // Set initial remaining time (seconds)
  updateTimer(); // Call to update timer display initially

  timer = setInterval(() => {
    remainingTime--;
    updateTimer();
    if (remainingTime === 0) {
      handleGameOver();
    }
  }, 1000); // Update timer every second
}

function updateTimer() {
  const seconds = remainingTime % 30 || 30; // Ensure seconds are displayed even at 0
  timerElement.textContent = `Time Remaining: ${seconds
    .toString()
    .padStart(2, "0")}`;
}

async function uploadScore(score) {
  // Replace with your actual API URL and logic
  try {
    const response = await fetch(
      "https://telegram-game-bot-tbdr.onrender.com/new-score",
      // 'http://localhost:5000/new-score',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: getUsernameFromUrl(), clicks: score }),
      }
    );
    const data = await response.json();
    console.log("Score uploaded:", data);
    updateLeaderBoard();
    // Handle successful upload, e.g., display confirmation message
  } catch (error) {
    console.error("Error uploading score:", error);
    // Handle upload error, e.g., display error message to user
  }
}

async function updateLeaderBoard() {
  const leaderboardList = document.getElementById("leaderboard-list");

  try {
    const response = await fetch(
      "https://telegram-game-bot-tbdr.onrender.com/leaderboard"
      // 'http://localhost:5000/leaderboard',
    );
    const data = await response.json();

    // Clear any existing list items
    leaderboardList.innerHTML = "";

    // Loop through the data and create list items
    data.forEach((player) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<b><span class="user">${player.username}</span></b> | <span class="score">${player.clicks}</span> clicks`;
      leaderboardList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    // Handle error gracefully, e.g., display an error message to the user
  }
}

function blink() {
  isVisible = !isVisible;
  gameArea.style.visibility = isVisible ? "visible" : "hidden";
}

function startBlinking() {
  blinkIntervalId = setInterval(blink, blinkInterval);
}

function stopBlinking() {
  gameArea.style.visibility = "visible";
  clearInterval(blinkIntervalId);
}
