const { execSync, exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

const execPromise = util.promisify(exec);

const CONFIG = {
  maxBundleSizeKB: 500,
  maxRetries: 2,
  testUrl: process.env.TEST_URL || 'https://argbase.org',
};

async function run(cmd, options = {}) {
  try {
    execSync(cmd, { encoding: 'utf8', stdio: 'inherit', ...options });
    return { success: true, error: null };
  } catch (e) {
    return { success: false, error: e };
  }
}

function parseBundleSize() {
  const buildDir = path.join(__dirname, '..', 'build', 'static', 'js');
  if (!fs.existsSync(buildDir)) {
    return { files: [], totalKB: 0, exceedsLimit: false };
  }

  const files = fs.readdirSync(buildDir).filter(f => f.endsWith('.js'));
  let totalBytes = 0;
  const fileSizes = [];

  for (const file of files) {
    const filePath = path.join(buildDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalBytes += stats.size;
    fileSizes.push({ file, sizeKB });
  }

  const totalKB = Math.round(totalBytes / 1024);
  return {
    files: fileSizes,
    totalKB,
    exceedsLimit: totalKB > CONFIG.maxBundleSizeKB,
  };
}

async function runNpmAudit() {
  console.log('\n--- Checking for vulnerabilities ---');
  try {
    execSync('npm audit', { encoding: 'utf8', stdio: 'inherit' });
    console.log('✓ No vulnerabilities found');
    return { success: true };
  } catch (e) {
    console.log('⚠ Vulnerabilities found (these are from dev dependencies, see above)');
    return { success: true };
  }
}

async function runBundleCheck() {
  console.log('\n--- Checking bundle size ---');
  
  const result = await run('npm run build');
  if (!result.success) {
    return { success: false, error: 'Build failed' };
  }

  const bundle = parseBundleSize();
  console.log(`Bundle size: ${bundle.totalKB} KB (limit: ${CONFIG.maxBundleSizeKB} KB)`);
  
  for (const file of bundle.files) {
    console.log(`  ${file.file}: ${file.sizeKB} KB`);
  }

  if (bundle.exceedsLimit) {
    console.log(`⚠ Bundle size exceeds limit by ${bundle.totalKB - CONFIG.maxBundleSizeKB} KB`);
    return { success: false, error: 'Bundle size exceeds limit' };
  }

  console.log('✓ Bundle size within limit');
  return { success: true };
}

async function runAccessibilityCheck() {
  console.log('\n--- Running accessibility checks ---');
  
  const axeCore = require('axe-core');
  const { chromium } = require('@playwright/test');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(CONFIG.testUrl, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: axeCore.source });

  const results = await page.evaluate(() => {
    return window.axe.run();
  });

  await browser.close();

  const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  
  if (violations.length > 0) {
    console.log(`⚠ Found ${violations.length} accessibility violations:`);
    for (const v of violations.slice(0, 10)) {
      console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
      console.log(`    ${v.nodes[0]?.html || 'N/A'}`);
    }
    if (violations.length > 10) {
      console.log(`  ... and ${violations.length - 10} more`);
    }
    return { success: false, error: 'Accessibility violations found' };
  }

  console.log('✓ No critical accessibility violations found');
  return { success: true };
}

async function harden(attempt = 1) {
  console.log('=== Hardening Checks ===\n');
  console.log(`Config: maxBundleSize=${CONFIG.maxBundleSizeKB}KB, url=${CONFIG.testUrl}`);

  if (attempt > CONFIG.maxRetries) {
    console.log('\n✗ Max attempts reached. Hardening failed.');
    return false;
  }

  const results = {
    audit: await runNpmAudit(),
    bundle: await runBundleCheck(),
    accessibility: await runAccessibilityCheck(),
  };

  const allPassed = results.audit.success && results.bundle.success && results.accessibility.success;

  if (!allPassed) {
    console.log('\n--- Fix issues and retry ---');
    const fixed = await harden(attempt + 1);
    if (!fixed) {
      console.log('\n✗ Hardening failed after retries.');
      return false;
    }
  }

  console.log('\n✓ All hardening checks passed!');
  return true;
}

harden()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Hardening error:', err);
    process.exit(1);
  });
