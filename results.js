// results.js
window.addEventListener("DOMContentLoaded", () => {
  const galleryContainer = document.getElementById("gallery-container");
  const sortBySelect = document.getElementById("sortBy");
  const savedGallery = JSON.parse(localStorage.getItem("yuukaResultGallery")) || [];

  const adminPassword = "YuukaLovesYouAlways!";
  const clearGalleryBtn = document.getElementById("clearGalleryBtn");
  let adminAuthorized = false;
  let promptActive = false; // 🧠 Prevents double triggering
  clearGalleryBtn.style.display = "none";

  // 🔐 Unified admin prompt logic
  function openAdminPrompt() {
    if (promptActive) return; // prevents duplicates
    promptActive = true;

    if (adminAuthorized) {
      alert("🟢 You’re already logged in as admin!");
      showAdminControls();
      promptActive = false;
      return;
    }

    const inputPassword = prompt("Enter the admin password to access gallery settings:");
    promptActive = false;
    if (inputPassword === null) return;

    if (inputPassword === adminPassword) {
      adminAuthorized = true;
      alert("✅ Admin access granted!");
      showAdminControls();
    } else {
      alert("❌ Incorrect password.");
    }
  }

  // 🎛️ Admin controls
  function showAdminControls() {
    clearGalleryBtn.style.display = "block";
    const clearResultsBtn = document.getElementById("clear-results-btn");
    if (clearResultsBtn) clearResultsBtn.style.display = "block";

    // 🧹 Clear Gallery button
    clearGalleryBtn.onclick = () => {
      const galleryData = JSON.parse(localStorage.getItem("yuukaResultGallery")) || [];
      const galleryCount = galleryData.length;

      if (galleryCount === 0) {
        alert("🖼️ No gallery items to clear!");
        return;
      }

      if (confirm(`Clear ${galleryCount} gallery item(s)?`)) {
        localStorage.removeItem("yuukaResultGallery");
        alert(`🧹 Cleared ${galleryCount} gallery item(s)!`);
        galleryContainer.innerHTML = "<p style='text-align:center; color:gray;'>No gallery entries available.</p>";
      }
    };

    // 🧽 Clear Results button
    if (clearResultsBtn) {
      clearResultsBtn.onclick = () => {
        const resultData = JSON.parse(localStorage.getItem("yuukaQuizResults")) || [];
        const resultCount = resultData.length || 0;

        if (resultCount === 0) {
          alert("📋 No quiz results to clear!");
          return;
        }

        if (confirm(`Clear ${resultCount} saved result(s)?`)) {
          localStorage.removeItem("yuukaQuizResults");
          alert(`🧼 Cleared ${resultCount} saved result(s)!`);
        }
      };
    }
  }

  // 🎨 Render Gallery
  function renderGallery(gallery) {
    galleryContainer.innerHTML = "";

    if (gallery.length === 0) {
      galleryContainer.innerHTML = "<p style='text-align:center; color:gray;'>No gallery entries yet!</p>";
      return;
    }

    gallery.forEach((entry, index) => {
      const item = document.createElement("div");
      item.className = "gallery-item";

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
      downloadLink.download = `Yuuka_Quiz_Result_${entry.name}_${index + 1}.png`;
      downloadLink.textContent = "⬇️ Download Image";
      downloadLink.className = "download-link";

      item.appendChild(img);
      item.appendChild(details);
      item.appendChild(downloadLink);
      galleryContainer.appendChild(item);
    });
  }

  // 🔄 Sorting logic
  function sortGallery() {
    const sortBy = sortBySelect.value;
    let sortedGallery;

    if (sortBy === "score") {
      sortedGallery = [...savedGallery].sort((a, b) => b.score - a.score);
    } else {
      sortedGallery = [...savedGallery].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }

    renderGallery(sortedGallery);
  }

  sortGallery();
  sortBySelect.addEventListener("change", sortGallery);

  // 💻 Ctrl + Enter for desktop or 📱 long press for mobile
  let pressTimer;
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      openAdminPrompt();
    }
  });
  galleryContainer.addEventListener("touchstart", () => {
    pressTimer = setTimeout(openAdminPrompt, 2000);
  });
  galleryContainer.addEventListener("touchend", () => {
    clearTimeout(pressTimer);
  });
});
