const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname);
const yuukaMediaCodeFiles = ['hayase-yuuka-photos.html', 'hayase-yuuka-videos.html']; // Example: HTML files that reference Yuuka media

// Media extensions (images + videos)
const MEDIA_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|mp4|webm|mov|avi|mkv)$/i;

// Code files to check references for Yuuka media
const CODE_EXTENSIONS = /\.(html|css|js|json)$/i;

// 1️⃣ Scan root for media files
const rootFiles = fs.readdirSync(projectDir);
const mediaFiles = rootFiles.filter(file => MEDIA_EXTENSIONS.test(file));

// 2️⃣ Combine code text from Yuuka-specific HTML files
const codeText = yuukaMediaCodeFiles
  .filter(file => fs.existsSync(path.join(projectDir, file)))
  .map(file => fs.readFileSync(path.join(projectDir, file), 'utf8'))
  .join('\n');

// 3️⃣ Find unused media in root
function isUsed(fileName) {
  return codeText.includes(fileName);
}

const unusedMedia = mediaFiles.filter(file => !isUsed(file));

// 4️⃣ Find references in HTML that point to non-existent files in root
const referencedFiles = [];
const regex = /["'`]\s*([\w\-.]+\.(?:png|jpg|jpeg|gif|svg|webp|mp4|webm|mov|avi|mkv))\s*["'`]/gi;

let match;
while ((match = regex.exec(codeText)) !== null) {
  referencedFiles.push(match[1]);
}

const missingFiles = referencedFiles.filter(file => !mediaFiles.includes(file));

// 5️⃣ Output
console.log('\n🧹 Unused media files in ROOT:\n');
unusedMedia.forEach(file => console.log('❌', file));
console.log(`\n✨ Found ${unusedMedia.length} unused media file(s).`);

console.log('\n⚠️ Referenced media files in Yuuka HTML that are MISSING:\n');
missingFiles.forEach(file => console.log('❌', file));
console.log(`\n✨ Found ${missingFiles.length} missing media reference(s).`);
