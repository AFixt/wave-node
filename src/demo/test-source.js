#!/usr/bin/env node

/**
 * Demo: Testing HTML Source with WAVE
 *
 * This example shows how to use the wave-node module to analyze
 * HTML source code using the WAVE API with ngrok tunneling.
 */

const { WaveClient } = require('../../dist/index');
const fs = require('fs');
const path = require('path');

async function testSource() {

  // Check if API key is provided
  const apiKey = process.env.WAVE_API_KEY;
  if (!apiKey) {
    console.error('Error: WAVE_API_KEY environment variable is required');
    console.log('Get your API key at: https://wave.webaim.org/api/');
    console.log('Then run: export WAVE_API_KEY=your_key_here');
    process.exit(1);
  }

  // Check if ngrok token is provided
  const ngrokToken = process.env.NGROK_AUTHTOKEN;
  if (!ngrokToken) {
    console.error('Error: NGROK_AUTHTOKEN environment variable is required');
    console.log('Get your token at: https://ngrok.com/');
    console.log('Then run: export NGROK_AUTHTOKEN=your_token_here');
    process.exit(1);
  }

  // Get HTML source - from file or use sample HTML
  let htmlSource;
  const filePath = process.argv[2];

  if (filePath) {
    try {
      htmlSource = fs.readFileSync(path.resolve(filePath), 'utf8');
      console.log(`Analyzing HTML from file: ${filePath}`);
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Sample HTML with various accessibility features and issues
    htmlSource = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page for WAVE Testing</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .low-contrast { color: #777; background: #999; }
        .good-contrast { color: #000; background: #fff; }
        nav ul { list-style: none; padding: 0; }
        nav li { display: inline; margin-right: 20px; }
    </style>
</head>
<body>
    <header>
        <nav role="navigation" aria-label="Main navigation">
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <h1>Welcome to Our Accessibility Test Page</h1>

        <section>
            <h2>Good Accessibility Examples</h2>
            <img src="example.jpg" alt="A descriptive alt text for the image">
            <p>This paragraph has good contrast and proper structure.</p>

            <form>
                <label for="email">Email Address:</label>
                <input type="email" id="email" name="email" required>
                <button type="submit">Subscribe</button>
            </form>
        </section>

        <section>
            <h2>Accessibility Issues to Detect</h2>

            <!-- Missing alt text -->
            <img src="problem.jpg">

            <!-- Poor contrast -->
            <p class="low-contrast">This text has poor contrast ratio.</p>

            <!-- Form without labels -->
            <form>
                <input type="text" placeholder="Name">
                <input type="email" placeholder="Email">
                <button>Submit</button>
            </form>

            <!-- Empty heading -->
            <h3></h3>

            <!-- Missing language attribute on nested content -->
            <p>This page contains <span>contenido en espa�ol</span> without proper language markup.</p>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 Test Company. All rights reserved.</p>
    </footer>
</body>
</html>
    `.trim();
    console.log('Analyzing sample HTML source...');
  }

  console.log('Please wait while ngrok tunnel is created...\n');

  try {
    // Initialize WAVE client
    const client = new WaveClient({ apiKey });

    // Analyze the HTML source
    const result = await client.analyzeSource(htmlSource);

    // Display results
    console.log('Analysis Complete!\n');

    // Basic information
    console.log('BASIC INFORMATION');
    console.log('-'.repeat(50));
    console.log(`Page Title: ${result.statistics.pagetitle}`);
    console.log(`Analysis Time: ${result.statistics.time}ms`);
    console.log(`Credits Remaining: ${result.statistics.creditsremaining}`);
    console.log(`Total Elements: ${result.statistics.totalelements}`);
    console.log(`WAVE Report: ${result.statistics.waveurl}\n`);

    // Error summary
    const errors = result.categories.error || {};
    const alerts = result.categories.alert || {};
    const features = result.categories.feature || {};
    const structure = result.categories.structure || {};
    const aria = result.categories.aria || {};
    const contrast = result.categories.contrast || {};

    console.log('ACCESSIBILITY SUMMARY');
    console.log('-'.repeat(50));
    console.log(`Errors: ${Object.keys(errors).length} types found`);
    console.log(`Alerts: ${Object.keys(alerts).length} types found`);
    console.log(`Features: ${Object.keys(features).length} types found`);
    console.log(`Structure: ${Object.keys(structure).length} types found`);
    console.log(`ARIA: ${Object.keys(aria).length} types found`);
    console.log(`Contrast: ${Object.keys(contrast).length} types found\n`);

    // Detailed errors
    if (Object.keys(errors).length > 0) {
      console.log('DETAILED ERRORS');
      console.log('-'.repeat(50));

      for (const [errorId, errorData] of Object.entries(errors)) {
        console.log(`\n* ${errorData.description}`);
        console.log(`  Type: ${errorId}`);
        console.log(`  Count: ${errorData.count}`);

        if (errorData.selectors && errorData.selectors.length > 0) {
          console.log(`  Examples: ${errorData.selectors.slice(0, 2).join(', ')}`);
        }

        if (errorData.wcag && errorData.wcag.length > 0) {
          console.log(`  WCAG: ${errorData.wcag[0].name}`);
        }
      }
      console.log('');
    }

    // Alerts
    if (Object.keys(alerts).length > 0) {
      console.log('ALERTS TO REVIEW');
      console.log('-'.repeat(50));

      for (const [alertId, alertData] of Object.entries(alerts)) {
        console.log(`\n* ${alertData.description}`);
        console.log(`  Type: ${alertId}`);
        console.log(`  Count: ${alertData.count}`);
      }
      console.log('');
    }

    // Positive features
    if (Object.keys(features).length > 0) {
      console.log('ACCESSIBILITY FEATURES FOUND');
      console.log('-'.repeat(50));

      for (const [, featureData] of Object.entries(features)) {
        console.log(`* ${featureData.description} (${featureData.count})`);
      }
      console.log('');
    }

    // Overall assessment
    const errorCount = Object.keys(errors).length;
    const totalIssues = Object.values(errors).reduce((sum, err) => sum + err.count, 0);

    if (errorCount === 0) {
      console.log('Great! No accessibility errors found.');
    } else {
      console.log(`Found ${errorCount} error types with ${totalIssues} total instances.`);
      console.log('These should be fixed to improve accessibility.');
    }

    console.log(`\nView full report: ${result.statistics.waveurl}`);

  } catch (error) {
    console.error('Error analyzing source:', error.message);

    if (error.statusCode === 401) {
      console.log('Check your API key is correct');
    } else if (error.statusCode === 402) {
      console.log('Insufficient credits - purchase more at https://wave.webaim.org/api/');
    } else if (error.message.includes('ngrok')) {
      console.log('ngrok tunnel creation failed - check your NGROK_AUTHTOKEN');
    }

    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  testSource().catch(console.error);
}

module.exports = { testSource };
