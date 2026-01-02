const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname);

// Media extensions (images + videos)
const MEDIA_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|mp4|webm|mov|avi|mkv)$/i;

// Code files to check references
const CODE_EXTENSIONS = /\.(html|css|js|json)$/i;

// Read only ROOT directory
const rootFiles = fs.readdirSync(projectDir);

// Media files in root only
const mediaFiles = rootFiles.filter(file => MEDIA_EXTENSIONS.test(file));

// Code files in root only
const codeFiles = rootFiles.filter(file => CODE_EXTENSIONS.test(file));

// Combine all code text
const codeText = codeFiles
  .map(file =>
    fs.readFileSync(path.join(projectDir, file), 'utf8')
  )
  .join('\n');

// Check if media is referenced (filename + extension)
function isUsed(fileName) {
  return codeText.includes(fileName);
}

// Find unused media
const unusedMedia = mediaFiles.filter(file => !isUsed(file));

// Output
console.log('\n🧹 Unused media files (ROOT ONLY):\n');

unusedMedia.forEach(file => {
  console.log('❌', file);
});

console.log(`\n✨ Done. Found ${unusedMedia.length} unused media file(s).`);
