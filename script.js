document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const DOM = {
    searchButton: document.querySelector("#search-btn"),
    usernameInput: document.querySelector("#username"),
    statsContainer: document.querySelector(".stats-container"),
    progressCircles: {
      easy: document.querySelector(".easy-progress"),
      medium: document.querySelector(".medium-progress"),
      hard: document.querySelector(".hard-progress"),
    },
    difficultyLabels: {
      easy: document.querySelector("#easy-label"),
      medium: document.querySelector("#medium-label"),
      hard: document.querySelector("#hard-label"),
    },
    statsCards: document.querySelector(".stats-cards"),
    errorContainer:
      document.querySelector(".error-container") || createErrorContainer(),
  };

  // Helper to create error container if not in HTML
  function createErrorContainer() {
    const container = document.createElement("div");
    container.className = "error-container";
    document.body.prepend(container);
    return container;
  }

  // Validation
  function validateUsername(username) {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      showError("Please enter username!");
      return false;
    }

    const isValid = /^[\w-]{1,15}$/.test(cleanUsername);
    if (!isValid)
      showError(
        "Invalid username! Use 1-15 characters with letters, numbers, underscores, or hyphens."
      );

    return isValid;
  }

  // Error handling
  function showError(message) {
    DOM.errorContainer.textContent = message;
    DOM.errorContainer.classList.add("visible");
    setTimeout(() => DOM.errorContainer.classList.remove("visible"), 5000);
  }

  // API Call
  async function fetchUserDetails(username) {
    try {
      toggleLoadingState(true);
      const response = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${username}`
      );

      if (!response.ok)
        throw new Error(
          response.status === 404 ? "User not found" : "Failed to fetch data"
        );

      const data = await response.json();
      if (data.status === "error") throw new Error(data.message);

      displayUserData(data);
      DOM.statsContainer.classList.add("visible");
    } catch (error) {
      DOM.statsCards.innerHTML = `<div class="error-card">${error.message}</div>`;
    } finally {
      toggleLoadingState(false);
    }
  }

  // UI States
  function toggleLoadingState(isLoading) {
    DOM.searchButton.textContent = isLoading ? "Searching..." : "Search";
    DOM.searchButton.disabled = isLoading;
  }

  // Progress Updates
  function updateProgress(solved, total, label, circle) {
    const percentage = Math.round((solved / total) * 100);
    circle.style.setProperty("--progress", `${percentage}%`);
    label.textContent = `${solved} / ${total}`;
  }

  // Data Display
  function displayUserData(data) {
    // Clear previous cards
    DOM.statsCards.innerHTML = "";

    // Update progress circles
    const difficulties = ["easy", "medium", "hard"];
    difficulties.forEach((difficulty) => {
      updateProgress(
        data[`${difficulty}Solved`],
        data[
          `total${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
        ],
        DOM.difficultyLabels[difficulty],
        DOM.progressCircles[difficulty]
      );
    });

    // Create stats cards
    const cardConfig = [
      { label: "Acceptance Rate", value: `${data.acceptanceRate}%` },
      { label: "Ranking", value: `#${Number(data.ranking).toLocaleString()}` },
      { label: "Contribution", value: data.contributionPoints },
    ];

    const fragment = document.createDocumentFragment();
    cardConfig.forEach(({ label, value }) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${label}</h3>
        <p aria-label="${label} value">${value}</p>
      `;
      fragment.appendChild(card);
    });

    DOM.statsCards.appendChild(fragment);
  }

  // Event Listeners
  DOM.searchButton.addEventListener("click", () => {
    const username = DOM.usernameInput.value.trim();
    if (validateUsername(username)) fetchUserDetails(username);
  });

  DOM.usernameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") DOM.searchButton.click();
  });
});
