const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectDir = path.resolve(__dirname);

// ==================================================
// Configuration
// ==================================================

const GENERATED_HTML_FILES = new Set([
    'image-review.html'
]);

const GENERATED_FILES = new Set([
    'image-review.html',
    'image-safety.json'
]);

// Ignore these directories completely.
const IGNORED_DIRECTORIES = new Set([
    'node_modules',
    '.git'
]);

// --------------------------------------------------
// Media extensions
// --------------------------------------------------

const MEDIA_EXTENSIONS =
    /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico|avif|mp4|webm|mov|avi|mkv|ogg|mp3|wav|flac)$/i;

const IMAGE_EXTENSIONS =
    /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico|avif)$/i;

const VIDEO_EXTENSIONS =
    /\.(mp4|webm|mov|avi|mkv|ogg)$/i;

const AUDIO_EXTENSIONS =
    /\.(mp3|wav|flac|ogg)$/i;

const JS_EXTENSIONS =
    /\.js$/i;

// ==================================================
// Find all files recursively
// ==================================================

function getAllFiles(dir) {
    const entries = fs.readdirSync(dir, {
        withFileTypes: true
    });

    const files = [];

    for (const entry of entries) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
            continue;
        }

        const fullPath =
            path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(
                ...getAllFiles(fullPath)
            );
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

const allFiles =
    getAllFiles(projectDir);

// ==================================================
// Helpers
// ==================================================

function normalizeProjectPath(file) {
    return path.normalize(
        path.relative(projectDir, file)
    );
}

function isGeneratedHTML(file) {
    return GENERATED_HTML_FILES.has(
        normalizeProjectPath(file)
    );
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getWebPath(file) {
    return path
        .relative(projectDir, file)
        .split(path.sep)
        .join('/');
}

function getMediaType(file) {
    if (IMAGE_EXTENSIONS.test(file)) {
        return 'IMAGE';
    }

    if (VIDEO_EXTENSIONS.test(file)) {
        return 'VIDEO';
    }

    if (AUDIO_EXTENSIONS.test(file)) {
        return 'AUDIO';
    }

    return 'OTHER';
}

// ==================================================
// SHA-256 duplicate detection
// ==================================================

function getFileHash(file) {
    try {
        const buffer =
            fs.readFileSync(file);

        return crypto
            .createHash('sha256')
            .update(buffer)
            .digest('hex');

    } catch (error) {
        console.error(
            `⚠️ Could not hash ${file}:`,
            error.message
        );

        return null;
    }
}

// ==================================================
// 1. Find media files
// ==================================================

const mediaFiles =
    allFiles.filter(file =>
        MEDIA_EXTENSIONS.test(file)
    );

console.log(
    `\n📦 Found ${mediaFiles.length} media file(s).`
);

// ==================================================
// 2. Find ROOT media files
// ==================================================

const rootFiles =
    fs.readdirSync(projectDir);

const rootMediaFiles =
    rootFiles.filter(file =>
        MEDIA_EXTENSIONS.test(file)
    );

// ==================================================
// 3. Find HTML and JS files
// ==================================================

const htmlFiles =
    allFiles.filter(file =>
        path.extname(file).toLowerCase() === '.html' &&
        !isGeneratedHTML(file)
    );

const jsFiles =
    allFiles.filter(file =>
        JS_EXTENSIONS.test(file)
    );

console.log(
    `🔎 Scanning ${htmlFiles.length} HTML file(s)...`
);

console.log(
    `⚙️ Scanning ${jsFiles.length} JavaScript file(s)...\n`
);

// ==================================================
// 4. Shared reference tracking
// ==================================================

const referencedMedia = new Map();
const missingFiles = new Set();

function addReference(
    absolutePath,
    sourceFile,
    referenceType
) {
    const relativePath =
        path.relative(
            projectDir,
            absolutePath
        );

    const normalizedPath =
        path.normalize(relativePath);

    const sourceName =
        path.relative(
            projectDir,
            sourceFile
        );

    if (!referencedMedia.has(
        normalizedPath
    )) {
        referencedMedia.set(
            normalizedPath,
            []
        );
    }

    referencedMedia
        .get(normalizedPath)
        .push({
            source: sourceName,
            type: referenceType
        });

    if (!fs.existsSync(absolutePath)) {
        missingFiles.add(
            `${normalizedPath} (referenced by ${sourceName})`
        );
    }
}

// ==================================================
// 5. Scan HTML media references
// ==================================================

const mediaReferenceRegex =
    /["'`](?!https?:\/\/|\/\/|data:)([^"'`?#]+?\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico|avif|mp4|webm|mov|avi|mkv|ogg|mp3|wav|flac))["'`]/gi;

for (let i = 0; i < htmlFiles.length; i++) {

    const htmlFile =
        htmlFiles[i];

    const html =
        fs.readFileSync(
            htmlFile,
            'utf8'
        );

    let match;

    while (
        (match =
            mediaReferenceRegex.exec(html)) !== null
    ) {

        const reference =
            match[1];

        const absolutePath =
            path.resolve(
                path.dirname(htmlFile),
                reference
            );

        addReference(
            absolutePath,
            htmlFile,
            'HTML'
        );
    }

    const percent =
        Math.round(
            ((i + 1) /
                Math.max(
                    htmlFiles.length,
                    1
                )) * 100
        );

    process.stdout.write(
        `\r🔎 HTML Progress: ${i + 1}/${htmlFiles.length} (${percent}%)`
    );
}

console.log(
    '\n✨ HTML scan complete!\n'
);

// ==================================================
// 6. Scan JavaScript media references
// ==================================================

const jsMediaStringRegex =
    /(["'`])((?:(?!\1).)*?\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico|avif|mp4|webm|mov|avi|mkv|ogg|mp3|wav|flac))\1/gi;

const dynamicWarnings = [];

function looksDynamicExpression(line) {

    return (
        /\b(?:img|image|video|audio|source)\s*\.\s*(?:src|poster)\s*=/i.test(line) ||

        /\b(?:img|image|video|audio|source)\s*\.\s*setAttribute\s*\(\s*["'](?:src|poster)["']/i.test(line) ||

        /\b(?:poster|backgroundImage|background-image)\s*[:=]/i.test(line) ||

        /\bimages?\s*\[\s*[^]]+\s*\]/i.test(line) ||

        /\bvideos?\s*\[\s*[^]]+\s*\]/i.test(line) ||

        /\baud(?:ios?)?\s*\[\s*[^]]+\s*\]/i.test(line) ||

        /[`'"].*\$\{[^}]+\}.*\.(?:png|jpe?g|gif|svg|webp|bmp|ico|avif|mp4|webm|mov|avi|mkv|ogg|mp3|wav|flac)/i.test(line)
    );
}

for (let i = 0; i < jsFiles.length; i++) {

    const jsFile =
        jsFiles[i];

    const js =
        fs.readFileSync(
            jsFile,
            'utf8'
        );

    const lines =
        js.split(/\r?\n/);

    let match;

    while (
        (match =
            jsMediaStringRegex.exec(js)) !== null
    ) {

        const reference =
            match[2];

        if (
            /^https?:\/\//i.test(reference) ||
            /^\/\//.test(reference) ||
            /^data:/i.test(reference)
        ) {
            continue;
        }

        const absolutePath =
            path.resolve(
                path.dirname(jsFile),
                reference
            );

        addReference(
            absolutePath,
            jsFile,
            'JavaScript'
        );
    }

    lines.forEach((line, index) => {

        if (
            !looksDynamicExpression(line)
        ) {
            return;
        }

        const hasDynamicPart =
            /\$\{|[+]\s*[A-Za-z_$]|[A-Za-z_$][\w$]*\s*\[/.test(
                line
            );

        const hasStaticMedia =
            MEDIA_EXTENSIONS.test(line);

        if (
            hasDynamicPart &&
            !hasStaticMedia
        ) {

            dynamicWarnings.push({
                file:
                    path.relative(
                        projectDir,
                        jsFile
                    ),

                line:
                    index + 1,

                code:
                    line.trim()
            });
        }
    });

    const percent =
        Math.round(
            ((i + 1) /
                Math.max(
                    jsFiles.length,
                    1
                )) * 100
        );

    process.stdout.write(
        `\r⚙️ JS Progress: ${i + 1}/${jsFiles.length} (${percent}%)`
    );
}

console.log(
    '\n✨ JavaScript scan complete!\n'
);

// ==================================================
// 7. Find unused ROOT media
// ==================================================

const unusedMedia =
    rootMediaFiles.filter(file => {

        const normalized =
            path.normalize(file);

        return !referencedMedia.has(
            normalized
        );
    });

console.log(
    '\n🧹 Unused media files in ROOT:\n'
);

if (unusedMedia.length === 0) {

    console.log('✨ None!');

} else {

    unusedMedia.forEach(file => {
        console.log('❌', file);
    });
}

console.log(
    `\n✨ Found ${unusedMedia.length} unused root media file(s).`
);

// ==================================================
// 8. Missing references
// ==================================================

console.log(
    '\n⚠️ Referenced media files that are MISSING:\n'
);

if (missingFiles.size === 0) {

    console.log('✨ None!');

} else {

    [...missingFiles].forEach(file => {
        console.log('❌', file);
    });
}

console.log(
    `\n✨ Found ${missingFiles.size} missing media reference(s).`
);

// ==================================================
// 9. Dynamic warnings
// ==================================================

console.log(
    '\n🟨 Possible dynamic JavaScript media references:\n'
);

const filteredDynamicWarnings =
    dynamicWarnings.filter(warning => {

        const code =
            String(
                warning.code || ''
            ).toLowerCase();

        return (
            MEDIA_EXTENSIONS.test(code) ||

            code.includes('img.src') ||

            code.includes('image.src') ||

            code.includes('video.src') ||

            code.includes('audio.src') ||

            code.includes('source.src') ||

            code.includes('poster') ||

            code.includes('backgroundimage') ||

            code.includes('background-image') ||

            code.includes('images[') ||

            code.includes('videos[') ||

            code.includes('audio[')
        );
    });

if (
    filteredDynamicWarnings.length === 0
) {

    console.log(
        '✨ None detected!'
    );

} else {

    filteredDynamicWarnings
        .forEach(warning => {

            console.log(
                `⚠️ ${warning.file}:${warning.line}`
            );

            console.log(
                `   ${warning.code}`
            );

            console.log();
        });
}

console.log(
    `✨ Found ${filteredDynamicWarnings.length} possible dynamic media reference(s).`
);

// ==================================================
// 10. Shared media
// ==================================================

const sharedMedia =
    [...referencedMedia.entries()]
        .filter(
            ([file, sources]) =>
                sources.length > 1
        );

console.log(
    '\n🔗 Media referenced by multiple files:\n'
);

if (sharedMedia.length === 0) {

    console.log('✨ None!');

} else {

    for (
        const [file, sources]
        of sharedMedia
    ) {

        console.log(
            '📁',
            file
        );

        sources.forEach(
            reference => {

                console.log(
                    `   ↳ ${reference.source} [${reference.type}]`
                );
            }
        );

        console.log();
    }
}

console.log(
    `✨ Found ${sharedMedia.length} media file(s) referenced by multiple files.`
);

// ==================================================
// 11. Find unreferenced media for review
// ==================================================

console.log(
    '\n🖼️ Finding unreferenced media for review...\n'
);

const reviewMedia =
    mediaFiles
        .filter(file => {

            const normalizedPath =
                normalizeProjectPath(file);

            return !referencedMedia.has(
                normalizedPath
            );
        })
        .map(file => {

            const relativePath =
                path.relative(
                    projectDir,
                    file
                );

            const type =
                getMediaType(file);

            return {
                file:
                    relativePath,

                src:
                    getWebPath(file),

                type:
                    path.extname(file)
                        .slice(1)
                        .toUpperCase(),

                mediaType:
                    type
            };
        })
        .sort((a, b) => {

            const typeCompare =
                a.mediaType.localeCompare(
                    b.mediaType
                );

            if (
                typeCompare !== 0
            ) {
                return typeCompare;
            }

            return a.file.localeCompare(
                b.file,
                undefined,
                {
                    numeric: true,
                    sensitivity: 'base'
                }
            );
        });

console.log(
    `🖼️ Found ${reviewMedia.length} unreferenced media file(s) for review.`
);

// ==================================================
// 12. Detect exact duplicate files
// ==================================================

console.log(
    '\n🔍 Checking for duplicate media files...\n'
);

const hashMap =
    new Map();

for (
    let i = 0;
    i < mediaFiles.length;
    i++
) {

    const file =
        mediaFiles[i];

    const hash =
        getFileHash(file);

    if (!hash) {
        continue;
    }

    if (!hashMap.has(hash)) {
        hashMap.set(
            hash,
            []
        );
    }

    hashMap
        .get(hash)
        .push(file);

    const percent =
        Math.round(
            ((i + 1) /
                Math.max(
                    mediaFiles.length,
                    1
                )) * 100
        );

    process.stdout.write(
        `\r🔍 Duplicate scan: ${i + 1}/${mediaFiles.length} (${percent}%)`
    );
}

console.log(
    '\n✨ Duplicate scan complete!\n'
);

const duplicateGroups =
    [...hashMap.entries()]
        .filter(
            ([hash, files]) =>
                files.length > 1
        )
        .map(
            ([hash, files]) => ({
                hash,
                files
            })
        );

let duplicateFileCount = 0;

duplicateGroups.forEach(
    group => {
        duplicateFileCount +=
            group.files.length;
    }
);

console.log(
    `🔁 Found ${duplicateGroups.length} duplicate group(s).`
);

console.log(
    `📦 ${duplicateFileCount} file(s) are part of duplicate groups.`
);

if (
    duplicateGroups.length > 0
) {

    duplicateGroups.forEach(
        (group, index) => {

            console.log(
                `\n🔁 Duplicate Group ${index + 1}`
            );

            console.log(
                `   SHA-256: ${group.hash}`
            );

            group.files.forEach(
                file => {

                    console.log(
                        `   ↳ ${path.relative(
                            projectDir,
                            file
                        )}`
                    );
                }
            );
        }
    );
}

// ==================================================
// 13. Build media cards
// ==================================================

const mediaCards =
    reviewMedia.map(
        (media, index) => {

            const safeFile =
                escapeHTML(
                    media.file
                );

            const safeSrc =
                escapeHTML(
                    media.src
                );

            const safeType =
                escapeHTML(
                    media.type
                );

            const preview =
                media.mediaType === 'VIDEO'
                    ? `
                        <video
                            src="${safeSrc}"
                            controls
                            preload="metadata"
                        ></video>
                    `
                    : `
                        <img
                            src="${safeSrc}"
                            alt="${safeFile}"
                            loading="lazy"
                        >
                    `;

            return `
                <div
                    class="image-card"
                    data-file="${safeFile}"
                    data-src="${safeSrc}"
                    data-type="${safeType}"
                    data-media-type="${media.mediaType}"
                    data-index="${index}"
                    data-status="unreviewed"
                >

                    ${preview}

                    <div class="file-type">
                        ${safeType}
                    </div>

                    <div class="filename">
                        ${safeFile}
                    </div>

                    <div class="status">
                        🟡 UNREVIEWED
                    </div>

                    <div class="buttons">

                        <button
                            class="safe"
                            onclick="setStatus(this, 'safe')"
                        >
                            🟢 Safe
                        </button>

                        <button
                            class="unsafe"
                            onclick="setStatus(this, 'unsafe')"
                        >
                            🔴 Unsafe
                        </button>

                        <button
                            class="reset"
                            onclick="setStatus(this, 'unreviewed')"
                        >
                            ↩ Reset
                        </button>

                    </div>

                    <button
                        class="copy"
                        onclick="copyHTML(this)"
                        disabled
                    >
                        📋 Copy HTML
                    </button>

                </div>
            `;
        }
    )
    .join('\n');

// ==================================================
// 14. Duplicate dashboard section
// ==================================================

const duplicateHTML =
    duplicateGroups.length === 0
        ? `
            <div class="no-duplicates">
                ✨ No exact duplicate files detected!
            </div>
        `
        : duplicateGroups
            .map(
                (group, index) => {

                    const filesHTML =
                        group.files
                            .map(file => {

                                const relative =
                                    path.relative(
                                        projectDir,
                                        file
                                    );

                                return `
                                    <div class="duplicate-file">
                                        📄 ${escapeHTML(relative)}
                                    </div>
                                `;
                            })
                            .join('');

                    return `
                        <div class="duplicate-group">

                            <div class="duplicate-title">
                                🔁 Duplicate Group ${index + 1}
                            </div>

                            <div class="duplicate-hash">
                                SHA-256:
                                ${group.hash}
                            </div>

                            ${filesHTML}

                        </div>
                    `;
                }
            )
            .join('\n');

// ==================================================
// 15. Generate dashboard
// ==================================================

const reviewHTML =
`<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Media Safety Review</title>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 20px;
    background: #111;
    color: white;
    font-family: Arial, sans-serif;
}

h1 {
    text-align: center;
}

#stats {
    text-align: center;
    font-size: 18px;
    margin: 15px 0;
}

.warning-box {
    max-width: 1000px;
    margin: 0 auto 20px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 180, 0, 0.12);
    border: 1px solid rgba(255, 180, 0, 0.35);
}

.controls {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
}

.controls button {
    padding: 9px 13px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.bulk-safe {
    background: #267a3a;
    color: white;
}

.bulk-unsafe {
    background: #a83232;
    color: white;
}

#gallery {
    display: grid;
    grid-template-columns:
        repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
}

.image-card {
    background: #222;
    border-radius: 12px;
    padding: 8px;
    overflow: hidden;
}

.image-card img,
.image-card video {
    width: 100%;
    height: 180px;
    object-fit: contain;
    background: #000;
    border-radius: 8px;
    display: block;
}

.file-type {
    margin-top: 6px;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    opacity: 0.7;
}

.filename {
    margin-top: 5px;
    font-size: 13px;
    word-break: break-all;
}

.status {
    margin-top: 8px;
    text-align: center;
    font-weight: bold;
}

.buttons {
    display: flex;
    gap: 5px;
    margin-top: 8px;
}

.buttons button {
    flex: 1;
    padding: 7px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.safe {
    background: #267a3a;
    color: white;
}

.unsafe {
    background: #a83232;
    color: white;
}

.reset {
    background: #555;
    color: white;
}

.copy {
    width: 100%;
    margin-top: 6px;
    padding: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    background: #3568a8;
    color: white;
}

.copy:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

#duplicates {
    max-width: 1000px;
    margin: 40px auto;
}

#duplicates h2 {
    text-align: center;
}

.duplicate-group {
    background: #222;
    border: 1px solid #444;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 10px;
}

.duplicate-title {
    font-size: 17px;
    font-weight: bold;
    margin-bottom: 5px;
}

.duplicate-hash {
    font-size: 11px;
    opacity: 0.6;
    word-break: break-all;
    margin-bottom: 8px;
}

.duplicate-file {
    padding: 5px 0;
    border-top: 1px solid #333;
    word-break: break-all;
}

.no-duplicates {
    text-align: center;
    background: #222;
    padding: 15px;
    border-radius: 10px;
}

#copy-output {
    position: fixed;
    left: -99999px;
    top: -99999px;
}

@media (max-width: 768px) {

    body {
        padding: 10px;
    }

    #gallery {
        grid-template-columns:
            repeat(auto-fill, minmax(120px, 1fr));
        gap: 7px;
    }

    .image-card {
        padding: 5px;
    }

    .image-card img,
    .image-card video {
        height: 120px;
    }

    .buttons {
        flex-direction: column;
    }

    .buttons button {
        width: 100%;
    }
}

@media (max-width: 480px) {

    #gallery {
        grid-template-columns:
            repeat(auto-fill, minmax(95px, 1fr));
        gap: 5px;
    }

    .image-card img,
    .image-card video {
        height: 95px;
    }

    .filename {
        font-size: 11px;
    }

}

</style>

</head>

<body>

<h1>🖼️ Media Safety Review</h1>

<div id="stats">
    Reviewed: 0 / ${reviewMedia.length}
</div>

${
    filteredDynamicWarnings.length > 0
        ? `
            <div class="warning-box">
                ⚠️
                <strong>
                    ${filteredDynamicWarnings.length}
                </strong>
                possible dynamic JavaScript media
                reference(s) were detected.
                Review these before assuming media
                is unused.
            </div>
        `
        : ''
}

<div class="controls">

    <button onclick="filterMedia('all')">
        📁 All
    </button>

    <button onclick="filterMedia('unreviewed')">
        🟡 Unreviewed
    </button>

    <button onclick="filterMedia('safe')">
        🟢 Safe
    </button>

    <button onclick="filterMedia('unsafe')">
        🔴 Unsafe
    </button>

    <button onclick="filterMedia('IMAGE')">
        🖼️ Images
    </button>

    <button onclick="filterMedia('VIDEO')">
        🎬 Videos
    </button>

    <button onclick="filterMedia('PNG')">
        PNG
    </button>

    <button onclick="filterMedia('JPG')">
        JPG
    </button>

    <button onclick="filterMedia('JPEG')">
        JPEG
    </button>

    <button onclick="filterMedia('GIF')">
        GIF
    </button>

    <button onclick="filterMedia('SVG')">
        SVG
    </button>

    <button onclick="filterMedia('WEBP')">
        WEBP
    </button>

    <button onclick="filterMedia('MP4')">
        MP4
    </button>

    <button onclick="filterMedia('WEBM')">
        WEBM
    </button>

    <button
        class="bulk-safe"
        onclick="copyBulk('safe')"
    >
        📋 Copy All Safe
    </button>

    <button
        class="bulk-unsafe"
        onclick="copyBulk('unsafe')"
    >
        📋 Copy All Unsafe
    </button>

    <button onclick="exportResults()">
        💾 Export JSON
    </button>

</div>

<div id="gallery">
    ${mediaCards}
</div>

<div id="duplicates">

    <h2>
        🔍 Exact Duplicate Files
    </h2>

    ${duplicateHTML}

</div>

<textarea id="copy-output"></textarea>

<script>

const STORAGE_KEY =
    'imageSafetyReview';

let results =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEY
        ) || '{}'
    );

// ==================================================
// Set status
// ==================================================

function setStatus(
    button,
    status
) {

    const card =
        button.closest(
            '.image-card'
        );

    const file =
        card.dataset.file;

    card.dataset.status =
        status;

    if (
        status === 'unreviewed'
    ) {

        delete results[file];

    } else {

        results[file] =
            status;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(results)
    );

    updateCard(card);
    updateStats();
}

// ==================================================
// Update card
// ==================================================

function updateCard(card) {

    const status =
        card.dataset.status;

    const statusElement =
        card.querySelector(
            '.status'
        );

    const copyButton =
        card.querySelector(
            '.copy'
        );

    if (
        status === 'safe'
    ) {

        statusElement.textContent =
            '🟢 SAFE';

        copyButton.disabled =
            false;

    } else if (
        status === 'unsafe'
    ) {

        statusElement.textContent =
            '🔴 UNSAFE';

        copyButton.disabled =
            false;

    } else {

        statusElement.textContent =
            '🟡 UNREVIEWED';

        copyButton.disabled =
            true;
    }
}

// ==================================================
// Generate gallery HTML
// ==================================================

function getMediaHTML(card) {

    const src =
        card.dataset.src;

    const status =
        card.dataset.status;

    if (
        status !== 'safe' &&
        status !== 'unsafe'
    ) {
        return '';
    }

    const safeValue =
        status === 'safe'
            ? 'true'
            : 'false';

    const mediaType =
        card.dataset.mediaType;

    if (
        mediaType === 'VIDEO'
    ) {

        return (
            '<div class="media-item img-responsive zoom">' +
            '<video src="' +
            src +
            '" controls data-safe="' +
            safeValue +
            '" loading="lazy"></video>' +
            '</div>'
        );

    }

    return (
        '<div class="media-item img-responsive zoom">' +
        '<img src="' +
        src +
        '" alt="Hayase Yuuka" data-safe="' +
        safeValue +
        '" loading="lazy">' +
        '</div>'
    );
}

// ==================================================
// Copy one item
// ==================================================

async function copyHTML(button) {

    const card =
        button.closest(
            '.image-card'
        );

    const html =
        getMediaHTML(card);

    if (!html) {
        return;
    }

    await copyText(
        html,
        button
    );
}

// ==================================================
// Bulk copy
// ==================================================

async function copyBulk(status) {

    const cards =
        [
            ...document.querySelectorAll(
                '.image-card'
            )
        ];

    const matchingCards =
        cards.filter(card =>
            card.dataset.status === status
        );

    if (
        matchingCards.length === 0
    ) {

        alert(
            status === 'safe'
                ? 'No safe media has been reviewed yet.'
                : 'No unsafe media has been reviewed yet.'
        );

        return;
    }

    const html =
        matchingCards
            .map(card =>
                getMediaHTML(card)
            )
            .filter(Boolean)
            .join('\\n');

    try {

        await navigator.clipboard.writeText(
            html
        );

        alert(
            '📋 Copied ' +
            matchingCards.length +
            ' ' +
            status +
            ' media item(s)!'
        );

    } catch (error) {

        const output =
            document.getElementById(
                'copy-output'
            );

        output.value =
            html;

        output.select();

        document.execCommand(
            'copy'
        );

        alert(
            '📋 Copied ' +
            matchingCards.length +
            ' ' +
            status +
            ' media item(s)!'
        );
    }
}

// ==================================================
// Copy helper
// ==================================================

async function copyText(
    text,
    button
) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        const original =
            button.textContent;

        button.textContent =
            '✅ Copied!';

        setTimeout(() => {

            button.textContent =
                original;

        }, 1200);

    } catch (error) {

        const output =
            document.getElementById(
                'copy-output'
            );

        output.value =
            text;

        output.select();

        document.execCommand(
            'copy'
        );

        const original =
            button.textContent;

        button.textContent =
            '✅ Copied!';

        setTimeout(() => {

            button.textContent =
                original;

        }, 1200);
    }
}

// ==================================================
// Restore saved results
// ==================================================

document
    .querySelectorAll(
        '.image-card'
    )
    .forEach(card => {

        const file =
            card.dataset.file;

        if (
            results[file]
        ) {

            card.dataset.status =
                results[file];

            updateCard(card);
        }
    });

// ==================================================
// Statistics
// ==================================================

function updateStats() {

    const cards =
        [
            ...document.querySelectorAll(
                '.image-card'
            )
        ];

    const reviewed =
        cards.filter(
            card =>
                card.dataset.status !==
                'unreviewed'
        ).length;

    const safe =
        cards.filter(
            card =>
                card.dataset.status ===
                'safe'
        ).length;

    const unsafe =
        cards.filter(
            card =>
                card.dataset.status ===
                'unsafe'
        ).length;

    document.getElementById(
        'stats'
    ).textContent =
        'Reviewed: ' +
        reviewed +
        ' / ' +
        cards.length +
        ' | 🟢 Safe: ' +
        safe +
        ' | 🔴 Unsafe: ' +
        unsafe +
        ' | 🔁 Duplicate groups: ${duplicateGroups.length}';
}

updateStats();

// ==================================================
// Filtering
// ==================================================

function filterMedia(filter) {

    document
        .querySelectorAll(
            '.image-card'
        )
        .forEach(card => {

            const status =
                card.dataset.status;

            const type =
                card.dataset.type;

            const mediaType =
                card.dataset.mediaType;

            let visible =
                false;

            if (
                filter === 'all'
            ) {

                visible =
                    true;

            } else if (
                filter === 'unreviewed' ||
                filter === 'safe' ||
                filter === 'unsafe'
            ) {

                visible =
                    status === filter;

            } else if (
                filter === 'IMAGE' ||
                filter === 'VIDEO' ||
                filter === 'AUDIO'
            ) {

                visible =
                    mediaType === filter;

            } else {

                visible =
                    type === filter;
            }

            card.style.display =
                visible
                    ? ''
                    : 'none';
        });
}

// ==================================================
// Export results
// ==================================================

function exportResults() {

    const data =
        JSON.stringify(
            results,
            null,
            2
        );

    const blob =
        new Blob(
            [data],
            {
                type:
                    'application/json'
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            'a'
        );

    link.href =
        url;

    link.download =
        'image-safety.json';

    link.click();

    URL.revokeObjectURL(
        url
    );
}

</script>

</body>

</html>`;

// ==================================================
// 16. Write dashboard
// ==================================================

const reviewPath =
    path.join(
        projectDir,
        'image-review.html'
    );

fs.writeFileSync(
    reviewPath,
    reviewHTML,
    'utf8'
);

console.log(
    '\n✨ Media review dashboard created!'
);

console.log(
    `📄 ${path.relative(
        projectDir,
        reviewPath
    )}`
);

console.log(
    '\n🚀 Open image-review.html in your browser to begin reviewing.'
);

console.log(
    '📋 Safe and unsafe media can now be bulk-copied.'
);

console.log(
    '🎬 Video files are supported.'
);

console.log(
    '🔁 Exact duplicate files are detected using SHA-256.'
);
