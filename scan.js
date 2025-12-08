const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname); // your project folder
const imagesDir = path.join(projectDir); // folder with images

// Get all files in the project (HTML, CSS, JS)
function getProjectFiles(dir) {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(getProjectFiles(fullPath));
        } else if (/\.(html|css|js)$/.test(file)) {
            results.push(fullPath);
        }
    });
    return results;
}

// Get all image files
const images = fs.readdirSync(imagesDir).filter(f => /\.(png|jpg|jpeg|gif|svg)$/.test(f));
const projectFiles = getProjectFiles(projectDir);

// Check which images are unused
const unusedImages = images.filter(img => {
    return !projectFiles.some(file => fs.readFileSync(file, 'utf8').includes(img));
});

console.log("Unused images:");
console.log(unusedImages);
