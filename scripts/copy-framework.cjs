const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMEWORK_DIR = process.env.FRAMEWORK_DIR || '../SecureAgentBase';

const frameworkFiles = [
  'src/framework',
  'scripts/framework',
  '.github/framework',
  'tests/framework',
];

const frameworkRootFiles = [
  'vitest.config.js',
  'eslint.config.js',
  'tailwind.config.js',
  'vite.config.js',
  'postcss.config.js',
  'playwright.config.js',
  'package.json',
  '.env.example',
  'framework.config.js',
  'LIFECYCLE.md',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠️  Skipping (not found): ${src}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`  ✓ ${src}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠️  Skipping (not found): ${src}`);
    return;
  }
  
  ensureDir(dest);
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
  console.log(`  ✓ ${src}/`);
}

function copyPackageJson() {
  const src = 'package.json';
  const dest = path.join(FRAMEWORK_DIR, 'package.json');
  
  if (!fs.existsSync(src)) {
    console.log('  ⚠️  package.json not found');
    return;
  }
  
  const pkg = JSON.parse(fs.readFileSync(src, 'utf8'));
  
  const frameworkPkg = {
    name: pkg.name,
    version: pkg.version,
    private: pkg.private,
    type: pkg.type,
    scripts: {
      dev: pkg.scripts.dev,
      build: pkg.scripts.build,
      preview: pkg.scripts.preview,
      test: pkg.scripts.test,
      'test:ci': pkg.scripts['test:ci'],
      lint: pkg.scripts.lint,
      'lint:fix': pkg.scripts['lint:fix'],
      check: pkg.scripts.check,
      e2e: pkg.scripts.e2e,
      'e2e:ci': pkg.scripts['e2e:ci'],
      'e2e:smoke': pkg.scripts['e2e:smoke'],
      'e2e:smoke:ci': pkg.scripts['e2e:smoke:ci'],
    },
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
  };
  
  fs.writeFileSync(dest, JSON.stringify(frameworkPkg, null, 2) + '\n');
  console.log(`  ✓ package.json (framework subset)`);
}

console.log('===========================================');
console.log('  Copying framework files to:');
console.log(`  ${FRAMEWORK_DIR}`);
console.log('===========================================');
console.log('');

console.log('Copying directories...');
for (const dir of frameworkFiles) {
  const dest = path.join(FRAMEWORK_DIR, dir);
  copyDir(dir, dest);
}

console.log('');
console.log('Copying root files...');
for (const file of frameworkRootFiles) {
  if (file === 'package.json') {
    copyPackageJson();
  } else {
    copyFile(file, path.join(FRAMEWORK_DIR, file));
  }
}

console.log('');
console.log('===========================================');
console.log('  Framework extraction complete!');
console.log('===========================================');
console.log('');
console.log('Next steps:');
console.log(`  1. Review files in ${FRAMEWORK_DIR}`);
console.log('  2. Commit to SecureAgentBase repo');
console.log('  3. Push: git push origin main');
