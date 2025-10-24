const fs = require("fs");
const path = require("path");

// Source HTML
const src = path.join(__dirname, "html", "mediapipe.html");

// Android destination folder
const destDir = path.join(__dirname, "android", "app", "src", "main", "assets", "html");
const dest = path.join(destDir, "mediapipe.html");

// Create destination folder if missing
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy file
if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log("✅ Copied mediapipe.html to Android assets folder");
} else {
  console.error("❌ Source file mediapipe.html not found in html/ folder!");
}
