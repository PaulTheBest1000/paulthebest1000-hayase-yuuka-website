// results.js
document.addEventListener("DOMContentLoaded", function() {
    const resultsContainer = document.getElementById('results-container');
    const clearResultsBtn = document.getElementById('clear-results-btn');
    const sortBySelect = document.getElementById('sortBy');
    
    const adminPassword = "YuukaLovesYouAlways!";
    const savedResults = JSON.parse(localStorage.getItem('gameResults')) || [];
  
    // Function to render the results
    function renderResults(results) {
      resultsContainer.innerHTML = '';
  
      results.forEach((entry, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result-item');
        
        const img = document.createElement('img');
        img.src = entry.image;
        img.alt = `Result for ${entry.name}`;
        
        const details = document.createElement('div');
        details.classList.add('details');
        details.innerHTML = `
          <strong>${entry.name}</strong><br>
          Score: ${entry.score}<br>
          <em>${new Date(entry.timestamp).toLocaleString()}</em>
        `;
  
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = entry.image;
        downloadLink.download = `Result_${entry.name}_${index + 1}.png`;
        downloadLink.textContent = "⬇️ Download Image";
        downloadLink.classList.add('download-link');
  
        resultDiv.appendChild(img);
        resultDiv.appendChild(details);
        resultDiv.appendChild(downloadLink);
        resultsContainer.appendChild(resultDiv);
      });
    }
  
    // Sort the results based on selected option
    function sortResults() {
      const sortBy = sortBySelect.value;
      let sortedResults;
  
      if (sortBy === "score") {
        sortedResults = [...savedResults].sort((a, b) => b.score - a.score);
      } else {
        sortedResults = [...savedResults].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
  
      renderResults(sortedResults);
    }
  
    // Event listener for sorting
    sortBySelect.addEventListener('change', sortResults);
  
    // Function to handle the password and clear action
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        const inputPassword = prompt('Enter the admin password to access the gallery settings:');
        if (inputPassword === null) return;
  
        if (inputPassword === adminPassword) {
          clearResultsBtn.style.display = 'block';
          clearResultsBtn.addEventListener('click', () => {
            const accessCode = prompt('Enter admin code to clear the results:');
            if (accessCode === null) return;
  
            if (accessCode === adminPassword) {
              localStorage.removeItem('gameResults');
              alert('Results have been cleared.');
              location.reload();
            } else {
              alert('Access denied. Incorrect admin code.');
            }
          });
        } else {
          alert('Incorrect password!');
        }
      }
    });
  
    // Initial rendering of results
    renderResults(savedResults);
    sortResults();
  });
  