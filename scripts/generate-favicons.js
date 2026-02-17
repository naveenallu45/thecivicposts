/**
 * Script to generate favicon files from SVG
 * Run with: node scripts/generate-favicons.js
 * 
 * Note: Requires sharp package: npm install sharp
 */

const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.log('⚠️  Sharp package not found. Installing...');
      console.log('📦 Please run: npm install sharp');
      console.log('📝 Or use online tools: https://realfavicongenerator.net/');
      return;
    }

    const publicDir = path.join(__dirname, '../public');
    const svgPath = path.join(publicDir, 'favicon.svg');

    if (!fs.existsSync(svgPath)) {
      console.log('❌ favicon.svg not found in public folder');
      return;
    }

    const svgBuffer = fs.readFileSync(svgPath);

    // Generate favicon.ico (multi-size ICO)
    console.log('🔄 Generating favicon.ico...');
    const faviconSizes = [16, 32, 48];
    const faviconImages = await Promise.all(
      faviconSizes.map(size =>
        sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toBuffer()
      )
    );
    // Note: Creating a simple ICO is complex, so we'll create PNGs instead
    // For production, use online tools or ico-convert package

    // Generate PNG icons
    const sizes = [
      { size: 192, name: 'icon-192.png' },
      { size: 512, name: 'icon-512.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 16, name: 'favicon-16x16.png' },
    ];

    for (const { size, name } of sizes) {
      console.log(`🔄 Generating ${name} (${size}x${size})...`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
    }

    // Create favicon.ico placeholder (32x32 PNG renamed)
    console.log('🔄 Creating favicon.ico placeholder...');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('✅ Favicon generation complete!');
    console.log('📁 Files created in /public folder:');
    sizes.forEach(({ name }) => console.log(`   - ${name}`));
    console.log('   - favicon.ico');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    console.log('\n💡 Alternative: Use online tools:');
    console.log('   - https://realfavicongenerator.net/');
    console.log('   - https://www.favicon-generator.org/');
  }
}

generateFavicons();
