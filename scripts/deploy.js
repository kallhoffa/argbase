const { execSync, exec } = require('child_process');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);

const MAX_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 30000;

async function checkGhInstalled() {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

async function run(cmd, options = {}) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...options });
    return { stdout, error: null };
  } catch (e) {
    return { stdout: e.stdout, stderr: e.stderr, error: e };
  }
}

async function getLatestRunId(commitSha) {
  try {
    const { stdout } = await run('gh run list --workflow=firebase-deploy.yml --limit=10 --json databaseId,headSha');
    const data = JSON.parse(stdout);
    
    if (commitSha) {
      const run = data.find(r => r.headSha === commitSha);
      return run ? run.databaseId : null;
    }
    
    return data[0]?.databaseId || null;
  } catch (e) {
    console.error('Failed to get run ID:', e.message);
    return null;
  }
}

async function getRunStatus(runId) {
  try {
    const { stdout } = await run(`gh run view ${runId} --json status,conclusion`);
    return JSON.parse(stdout);
  } catch (e) {
    console.error('Failed to get run status:', e.message);
    return null;
  }
}

async function getRunLogs(runId) {
  try {
    const { stdout } = await run(`gh run view ${runId} --log`);
    return stdout;
  } catch (e) {
    console.error('Failed to get run logs:', e.message);
    return '';
  }
}

function parseErrors(logs) {
  const errors = [];

  const eslintPattern = /\[eslint\].*?Line \d+:\d+/gi;
  const eslintMatches = logs.match(eslintPattern);
  if (eslintMatches) {
    errors.push({ type: 'eslint', matches: eslintMatches });
  }

  const buildPattern = /Failed to compile/gi;
  const buildMatches = logs.match(buildPattern);
  if (buildMatches) {
    errors.push({ type: 'build', matches: buildMatches });
  }

  const depPattern = /Cannot find module ['"](\@?[^'"]+)['"]/gi;
  let depMatch;
  const depMatches = [];
  while ((depMatch = depPattern.exec(logs)) !== null) {
    depMatches.push(depMatch[1]);
  }
  if (depMatches.length > 0) {
    errors.push({ type: 'dependency', matches: [...new Set(depMatches)] });
  }

  return errors;
}

async function autoFix(errors) {
  let fixed = false;

  for (const error of errors) {
    if (error.type === 'eslint') {
      console.log('Running eslint --fix...');
      const result = await run('npx eslint src/ --fix');
      if (!result.error) {
        fixed = true;
        console.log('ESLint fixes applied.');
      }
    }

    if (error.type === 'dependency') {
      for (const pkg of error.matches) {
        console.log(`Installing missing package: ${pkg}`);
        const result = await run(`npm install --save-dev ${pkg}`);
        if (!result.error) {
          fixed = true;
          console.log(`Installed ${pkg}`);
        }
      }
    }
  }

  if (fixed) {
    const { stdout } = await run('git status --porcelain');
    if (stdout.trim()) {
      await run('git add -A');
      await run('git commit -m "deploy: auto-fix errors"');
      await run('git push');
      console.log('Fixes committed and pushed.');
      return true;
    }
  }

  return false;
}

async function deploy(attempt = 1) {
  console.log(`\n--- Deployment attempt ${attempt}/${MAX_ATTEMPTS} ---`);

  const ghInstalled = await checkGhInstalled();
  if (!ghInstalled) {
    console.error('GitHub CLI (gh) is not installed.');
    console.error('Install it from: https://cli.github.com/');
    return false;
  }

  if (attempt > MAX_ATTEMPTS) {
    console.log('Max attempts reached. Deployment failed.');
    return false;
  }

  const beforeRunId = await getLatestRunId();

  const { stdout: status } = await run('git status --porcelain');
  let pushedCommitSha = null;
  if (status.trim()) {
    console.log('Unstaged changes found, committing...');
    await run('git add -A');
    await run('git commit -m "deploy: prepare for deployment"');
    await run('git push');
    console.log('Changes pushed.');
  }

  const { stdout: currentCommit } = await run('git rev-parse HEAD');
  pushedCommitSha = currentCommit.trim();

  await new Promise(r => setTimeout(r, 5000));

  let runId = await getLatestRunId(pushedCommitSha);
  let waitCount = 0;
  while (!runId && waitCount < 12) {
    console.log(`Waiting for workflow to start for commit ${pushedCommitSha.substring(0, 7)}...`);
    await new Promise(r => setTimeout(r, 5000));
    runId = await getLatestRunId(pushedCommitSha);
    waitCount++;
  }

  if (!runId) {
    console.log('Could not get workflow run ID. Deployment failed.');
    return false;
  }

  console.log(`Polling workflow run ${runId}...`);

  let statusResult;
  while (true) {
    statusResult = await getRunStatus(runId);
    if (!statusResult) {
      console.log('Failed to get run status, retrying...');
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }
    if (statusResult.status === 'completed') break;
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  console.log(`Workflow completed with conclusion: ${statusResult.conclusion}`);

  if (statusResult.conclusion === 'success') {
    console.log('Deployment successful!');
    return true;
  }

  console.log(`Deployment failed. Fetching logs...`);
  const logs = await getRunLogs(runId);
  const errors = parseErrors(logs);

  if (errors.length === 0) {
    console.log('Could not parse errors from logs. Manual intervention required.');
    console.log('\n--- Last 50 lines of logs ---');
    const lines = logs.split('\n');
    console.log(lines.slice(-50).join('\n'));
    return false;
  }

  console.log('Detected error types:', errors.map(e => e.type).join(', '));

  console.log('Attempting auto-fix...');
  const fixed = await autoFix(errors);

  if (fixed) {
    console.log('Fix applied, retrying deployment...');
    return deploy(attempt + 1);
  } else {
    console.log('Could not auto-fix. Manual intervention required.');
    return false;
  }
}

deploy()
  .then(success => {
    if (success) {
      console.log('\n✓ Deployment completed successfully!');
    } else {
      console.log('\n✗ Deployment failed after maximum attempts.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Deployment error:', err);
    process.exit(1);
  });
