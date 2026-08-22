const { spawnSync } = require('child_process');

// Define the main script logic inline to avoid a build step
const script = `
/* eslint-disable */
const fs = require('fs');

async function run() {
  try {
    const sinkafUrl = process.env.INPUT_SINKAF_URL || '';
    const sinkafToken = process.env.INPUT_SINKAF_TOKEN || '';
    const previewUrl = process.env.INPUT_PREVIEW_URL || '';
    const baselineUrl = process.env.INPUT_BASELINE_URL || '';
    const goal = process.env.INPUT_GOAL || '';
    const githubToken = process.env.INPUT_GITHUB_TOKEN || '';
    const repo = process.env.GITHUB_REPOSITORY;
    const commitSha = process.env.GITHUB_SHA;

    // Parse PR number from GITHUB_REF if it's a pull request
    let prNumber;
    const ref = process.env.GITHUB_REF || '';
    if (ref.startsWith('refs/pull/')) {
      prNumber = parseInt(ref.split('/')[2], 10);
    }

    console.log(\`Starting Sinkaf QA for \${previewUrl}\`);

    // 1. Dispatch Run
    const dispatchRes = await fetch(\`\${sinkafUrl}/api/integrations/github/runs\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${sinkafToken}\`
      },
      body: JSON.stringify({
        repository: repo,
        pullRequestNumber: prNumber,
        commitSha,
        previewUrl,
        baselineUrl: baselineUrl || undefined,
        goal: goal || undefined
      })
    });

    if (!dispatchRes.ok) {
      throw new Error(\`Failed to dispatch run: \${await dispatchRes.text()}\`);
    }

    const { runId } = await dispatchRes.json();
    console.log(\`Run dispatched with ID: \${runId}\`);

    // 2. Poll for completion
    let status = 'pending';
    let result = null;
    while (['pending', 'queued', 'running'].includes(status)) {
      await new Promise(r => setTimeout(r, 10000));
      
      const pollRes = await fetch(\`\${sinkafUrl}/api/integrations/github/runs/\${runId}\`, {
        headers: { 'Authorization': \`Bearer \${sinkafToken}\` }
      });
      
      if (!pollRes.ok) continue;
      
      const data = await pollRes.json();
      status = data.status;
      
      if (['passed', 'issues_found', 'infra_error', 'cancelled'].includes(status)) {
        result = data;
        break;
      }
      console.log(\`Run status: \${status}...\`);
    }

    console.log(\`Run finished with conclusion: \${result.conclusion}\`);

    // 3. Post PR Comment (if PR)
    if (prNumber) {
      console.log('Posting PR comment...');
      const apiUrl = \`\${process.env.GITHUB_API_URL}/repos/\${repo}/issues/\${prNumber}/comments\`;
      
      // Look for existing comment
      const listRes = await fetch(apiUrl, {
        headers: {
          'Authorization': \`Bearer \${githubToken}\`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const comments = await listRes.json();
      const existing = comments.find(c => c.body.includes('<!-- sinkaf-qa-report -->'));

      if (existing) {
        await fetch(\`\${process.env.GITHUB_API_URL}/repos/\${repo}/issues/comments/\${existing.id}\`, {
          method: 'PATCH',
          headers: {
            'Authorization': \`Bearer \${githubToken}\`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({ body: result.reportMarkdown })
        });
      } else {
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${githubToken}\`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({ body: result.reportMarkdown })
        });
      }
    }

    // 4. Update Commit Status
    console.log('Updating commit status...');
    let state = 'success';
    if (result.conclusion === 'fail') state = 'failure';
    else if (result.conclusion === 'infra_error') state = 'error';

    await fetch(\`\${process.env.GITHUB_API_URL}/repos/\${repo}/statuses/\${commitSha}\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${githubToken}\`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        state,
        target_url: \`\${sinkafUrl}/runs/\${runId}\`,
        description: \`Sinkaf QA: \${result.conclusion}\`,
        context: 'Sinkaf QA'
      })
    });

    if (result.conclusion === 'fail') {
      process.exit(1);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
`;

// Save the script and run it
const fs = require('fs');
fs.writeFileSync('/tmp/sinkaf-run.js', script);
const res = spawnSync(process.execPath, ['/tmp/sinkaf-run.js'], { stdio: 'inherit', env: process.env });
process.exit(res.status || 0);
