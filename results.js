window.addEventListener("DOMContentLoaded", () => {
  const resultsContainer = document.getElementById("results-container");
  const sortBySelect = document.getElementById("sortBy");
  const savedResults = JSON.parse(localStorage.getItem("yuukaResults")) || [];

  const adminPassword = "YuukaLovesYouAlways!";
  const clearResultsBtn = document.getElementById("clearResultsBtn");
  let adminAuthorized = false;
  let promptActive = false;
  clearResultsBtn.style.display = "none";

  // 🔐 Admin prompt
function openAdminPrompt() {
  if (promptActive) return;
  promptActive = true;

  // If already admin, don't show the "Already logged in as admin" message
  if (adminAuthorized) {
    alert("🟢 Already logged in as admin!"); 
    promptActive = false; // End prompt process immediately
    return;
  }

  const inputPassword = prompt("Enter the admin password:");
  promptActive = false;
  if (inputPassword === null) return; // User canceled, exit

  if (inputPassword === adminPassword) {
    adminAuthorized = true;
    alert("✅ Access granted!");
    showAdminControls(); // Show admin controls after successful login
  } else {
    alert("❌ Incorrect password.");
  }
}

  // 🎛️ Admin controls
  function showAdminControls() {
    clearResultsBtn.style.display = "block";

    clearResultsBtn.onclick = () => {
      const results = JSON.parse(localStorage.getItem("yuukaResults")) || [];
      const count = results.length;

      if (count === 0) {
        alert("📋 No results to clear!");
        return;
      }

      if (confirm(`Clear ${count} saved result(s)?`)) {
        localStorage.removeItem("yuukaResults");
        alert(`🧹 Cleared ${count} results!`);
        resultsContainer.innerHTML = "<p style='text-align:center; color:gray;'>No results available.</p>";
      }
    };
  }

  // 🎨 Render results
  function renderResults(results) {
    resultsContainer.innerHTML = "";

    if (results.length === 0) {
      resultsContainer.innerHTML = "<p style='text-align:center; color:gray;'>No results yet!</p>";
      return;
    }

    results.forEach((entry, index) => {
      const item = document.createElement("div");
      item.className = "yuukaResults";

      const img = document.createElement("img");
      img.src = entry.image;
      img.alt = `Result for ${entry.name}`;

      const details = document.createElement("div");
      details.className = "details";
      details.innerHTML = `
        <strong>${entry.name}</strong><br>
        Score: ${entry.score}<br>
        <em>${entry.timestamp}</em>
      `;

      const downloadLink = document.createElement("a");
      downloadLink.href = entry.image;
      downloadLink.download = `Yuuka_Result_${entry.name}_${index + 1}.png`;
      downloadLink.textContent = "⬇️ Download Image";
      downloadLink.className = "download-link";

      // Append everything to the result item and to the results container
      item.appendChild(img);
      item.appendChild(details);
      item.appendChild(downloadLink); // Add download link as well
      resultsContainer.appendChild(item);  // Add item to the container
    });
  }

  // 🔄 Sorting logic
  function sortResults() {
    const sortBy = sortBySelect.value;
    let sortedResults;

    if (sortBy === "score") {
      sortedResults = [...savedResults].sort((a, b) => b.score - a.score);
    } else {
      sortedResults = [...savedResults].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }

    renderResults(sortedResults);
  }

  sortResults();
  sortBySelect.addEventListener("change", sortResults);

  // 💻 Ctrl+Enter (desktop) or 📱 long press (mobile)
  let pressTimer;
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") openAdminPrompt();
  });

  // Touchstart and touchend for mobile long press
  resultsContainer.addEventListener("touchstart", () => {
    pressTimer = setTimeout(openAdminPrompt, 2000);
  });
  resultsContainer.addEventListener("touchend", () => clearTimeout(pressTimer));
});
