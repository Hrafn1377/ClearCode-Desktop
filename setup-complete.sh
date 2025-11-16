#!/bin/bash
echo "🚀 Setting up complete ClearCode Desktop..."

echo "Where is your ClearCode web version?"
echo "Example: ~/Desktop/ClearCode-Desktop"
read -p "Path: " WEB_PATH

if [ ! -d "$WEB_PATH" ]; then
    echo "❌ Directory not found!"
    exit 1
fi

echo "📁 Copying files..."
cp "$WEB_PATH/index.html" src/
cp "$WEB_PATH/style.css" src/styles.css
cp "$WEB_PATH/script.js" src/app.js

echo "🔧 Fixing file references..."
sed -i '' 's/style\.css/styles.css/g' src/index.html
sed -i '' 's/script\.js/app.js/g' src/index.html

echo "✅ Done! Now run: npm start"


