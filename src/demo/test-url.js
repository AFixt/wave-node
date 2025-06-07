#!/usr/bin/env node

/**
 * Demo: Testing a URL with WAVE
 *
 * This example shows how to use the wave-node module to analyze
 * the accessibility of a website URL using the WAVE API.
 */

const { WaveClient } = require('../../dist/index');

async function testUrl() {

  // Check if API key is provided
  const apiKey = process.env.WAVE_API_KEY;
  if (!apiKey) {
    console.error('L Error: WAVE_API_KEY environment variable is required');
    console.log('=� Get your API key at: https://wave.webaim.org/api/');
    console.log('=� Then run: export WAVE_API_KEY=your_key_here');
    process.exit(1);
  }

  // Get URL from command line or use default
  const url = process.argv[2] || 'https://example.com';

  console.log(`=
 Analyzing URL: ${url}`);
  console.log('Please wait...\n');

  try {
    // Initialize WAVE client
    const client = new WaveClient({ apiKey });

    // Analyze the URL
    const result = await client.analyze(url);

    // Display results
    console.log('Analysis Complete!\n');

    // Basic information
    console.log('BASIC INFORMATION');
    console.log('-'.repeat(50));
    console.log(`Page Title: ${result.statistics.pagetitle}`);
    console.log(`URL: ${result.statistics.pageurl}`);
    console.log(`Analysis Time: ${result.statistics.time}ms`);
    console.log(`Credits Remaining: ${result.statistics.creditsremaining}`);
    console.log(`Total Elements: ${result.statistics.totalelements}`);
    console.log(`WAVE Report: ${result.statistics.waveurl}\n`);

    // Error summary
    const errorCount = Object.keys(result.categories.error || {}).length;
    const alertCount = Object.keys(result.categories.alert || {}).length;
    const featureCount = Object.keys(result.categories.feature || {}).length;
    const structureCount = Object.keys(result.categories.structure || {}).length;
    const ariaCount = Object.keys(result.categories.aria || {}).length;
    const contrastCount = Object.keys(result.categories.contrast || {}).length;

    console.log('ACCESSIBILITY SUMMARY');
    console.log('-'.repeat(50));
    console.log(`Errors: ${errorCount} issues found`);
    console.log(`Alerts: ${alertCount} items to review`);
    console.log(`Features: ${featureCount} accessibility features`);
    console.log(`Structure: ${structureCount} structural elements`);
    console.log(`ARIA: ${ariaCount} ARIA elements`);
    console.log(`Contrast: ${contrastCount} contrast issues\n`);

    // Detailed errors (if any)
    if (errorCount > 0) {
      console.log('DETAILED ERRORS');
      console.log('-'.repeat(50));

      for (const [errorId, errorData] of Object.entries(result.categories.error || {})) {
        console.log(`\n" ${errorData.description}`);
        console.log(`  Type: ${errorId}`);
        console.log(`  Count: ${errorData.count}`);

        if (errorData.selectors && errorData.selectors.length > 0) {
          console.log(`  Selectors: ${errorData.selectors.slice(0, 3).join(', ')}${errorData.selectors.length > 3 ? '...' : ''}`);
        }

        if (errorData.wcag && errorData.wcag.length > 0) {
          console.log(`  WCAG: ${errorData.wcag[0].name}`);
        }
      }
      console.log('');
    }

    // Contrast issues (if any)
    if (contrastCount > 0) {
      console.log('CONTRAST ISSUES');
      console.log('-'.repeat(50));

      for (const [, contrastData] of Object.entries(result.categories.contrast || {})) {
        console.log(`\n" ${contrastData.description}`);
        console.log(`  Count: ${contrastData.count}`);

        if (contrastData.contrastdata && contrastData.contrastdata.length > 0) {
          const contrast = contrastData.contrastdata[0];
          console.log(`  Colors: ${contrast.fcolor} on ${contrast.bcolor}`);
          console.log(`  Ratio: ${contrast.contrastratio}`);
          console.log(`  Font: ${contrast.fontsize}, ${contrast.fontweight}`);
        }
      }
      console.log('');
    }

    // Overall assessment
    if (errorCount === 0 && contrastCount === 0) {
      console.log('<� Great! No critical accessibility errors found.');
    } else if (errorCount > 0) {
      console.log(`Found ${errorCount} accessibility error${errorCount === 1 ? '' : 's'} that should be fixed.`);
    }

    if (alertCount > 0) {
      console.log(`${alertCount} alert${alertCount === 1 ? '' : 's'} found - these should be manually reviewed.`);
    }

    console.log(`\n View full report: ${result.statistics.waveurl}`);

  } catch (error) {
    console.error('Error analyzing URL:', error.message);

    if (error.statusCode === 401) {
      console.log('Check your API key is correct');
    } else if (error.statusCode === 402) {
      console.log('Insufficient credits - purchase more at https://wave.webaim.org/api/');
    } else if (error.statusCode === 400) {
      console.log('Check that the URL is valid and accessible');
    }

    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  testUrl().catch(console.error);
}

module.exports = { testUrl };
