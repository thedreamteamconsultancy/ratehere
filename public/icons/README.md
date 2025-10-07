# PWA Icons

This folder contains icons for the Progressive Web App.

## Required Icon Sizes

You need to generate the following icon sizes from your logo:

- **icon-72x72.png** - Small notification icon
- **icon-96x96.png** - Small shortcut icon
- **icon-128x128.png** - Medium icon
- **icon-144x144.png** - Medium-large icon
- **icon-152x152.png** - iOS icon
- **icon-192x192.png** - Standard Android icon (also used for shortcuts)
- **icon-384x384.png** - Large icon
- **icon-512x512.png** - Extra large icon (splash screen, app icon)

## How to Generate Icons

### Method 1: Using Online Tool (Easiest)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo (preferably 512x512px or larger, transparent background recommended)
3. Download the generated icon package
4. Extract and place all icons in this folder

### Method 2: Using Command Line
If you have ImageMagick installed:

```bash
# Install ImageMagick first
# On Windows: choco install imagemagick
# On Mac: brew install imagemagick
# On Linux: sudo apt-get install imagemagick

# Then run these commands from your logo file:
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

### Method 3: Using Node.js Script
Create a script to generate all sizes:

```javascript
// generate-icons.js
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = 'logo.png'; // Your source logo

sizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(`public/icons/icon-${size}x${size}.png`)
    .then(() => console.log(`Generated ${size}x${size}`))
    .catch(err => console.error(`Error generating ${size}x${size}:`, err));
});
```

Then run:
```bash
npm install sharp
node generate-icons.js
```

## Icon Design Guidelines

- Use a **simple, recognizable design**
- Ensure good contrast on both light and dark backgrounds
- Test icons at all sizes to ensure clarity
- Use **transparent background** for best results
- Consider using a **maskable icon** (safe zone in center) for Android
- Keep important elements in the center 80% of the icon

## Maskable Icons

For better Android 12+ support, ensure your 192x192 and 512x512 icons work as maskable:
- Place all important content within the center 80% (safe zone)
- The outer 20% may be cropped on some devices
- Use https://maskable.app to test your maskable icons

## Current Status

⚠️ **ACTION REQUIRED**: Please generate and add all required icon files to this folder.

Until then, the PWA will work but may show default browser icons.
