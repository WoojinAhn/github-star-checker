const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const workflow = readFileSync(join(__dirname, '../workflows/check-stars.yml'), 'utf8');
const alertStep = workflow.match(/      - name: Append monthly GitHub Issue comment \(alert\)\n([\s\S]*?)(?=\n      - name:)/)[1];
const script = alertStep.split('          script: |\n')[1].replace(/^            /gm, '');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const runAlert = new AsyncFunction('github', 'context', 'process', script);
const marker = month => `<!-- star-notification-month:${month} -->`;

function fixture(initialIssues = []) {
  const issues = structuredClone(initialIssues);
  const comments = [];
  const created = [];
  const github = {
    rest: {
      issues: {
        listForRepo() {},
        async create(params) {
          const issue = { ...params, number: 1000 + created.length };
          issues.push(issue);
          created.push(issue);
          return { data: issue };
        },
        async createComment(params) {
          comments.push(params);
        },
      },
    },
    async paginate(endpoint, params) {
      assert.equal(endpoint, github.rest.issues.listForRepo);
      assert.deepEqual(params, {
        owner: 'test-owner', repo: 'test-repo', state: 'all',
        labels: 'star-notification', per_page: 100,
      });
      return issues;
    },
  };
  const env = {
    CHECKED_AT: '2026-09-30T23:59:59.999Z',
    ISSUE_TITLE: '⭐ GitHub Star Alert: 2 repo(s) changed!',
    ISSUE_BODY: '⬆️ Gained:\n- owner/one: 1 → 2 (+1)\n\n⬇️ Lost:\n- owner/two: 3 → 2 (-1)\n\nTotal stars: 4\nChecked at: 2026-09-30T23:59:59.999Z',
  };
  return {
    github, issues, comments, created, env,
    run: (overrides = {}) => runAlert(github, { repo: { owner: 'test-owner', repo: 'test-repo' } }, { env: { ...env, ...overrides } }),
  };
}

test('first alert creates a monthly thread and preserves the complete alert in a comment', async () => {
  const f = fixture();
  await f.run();
  assert.equal(f.created.length, 1);
  assert.equal(f.created[0].title, '⭐ Star Alerts (2026-09)');
  assert.ok(f.created[0].body.includes(marker('2026-09')));
  assert.deepEqual(f.created[0].labels, ['star-notification']);
  assert.deepEqual(f.comments, [{
    owner: 'test-owner', repo: 'test-repo', issue_number: 1000,
    body: `## ${f.env.ISSUE_TITLE}\n\n${f.env.ISSUE_BODY}`,
  }]);
});

test('later alerts append to the same monthly thread', async () => {
  const f = fixture();
  await f.run();
  await f.run({ ISSUE_BODY: 'A later star change' });
  assert.equal(f.created.length, 1);
  assert.equal(f.comments.length, 2);
  assert.equal(f.comments[0].issue_number, f.comments[1].issue_number);
  assert.ok(f.comments[1].body.endsWith('A later star change'));
});

test('UTC check time determines the month, including year rollover', async () => {
  const f = fixture();
  await f.run({ CHECKED_AT: '2026-12-31T23:59:59.999Z' });
  await f.run({ CHECKED_AT: '2027-01-01T00:00:00.000Z' });
  assert.deepEqual(f.created.map(issue => issue.title), ['⭐ Star Alerts (2026-12)', '⭐ Star Alerts (2027-01)']);
  assert.notEqual(f.comments[0].issue_number, f.comments[1].issue_number);
});

test('reuses a closed, renamed monthly thread from paginated results', async () => {
  const historical = Array.from({ length: 100 }, (_, number) => ({ number, body: null }));
  const monthly = { number: 101, state: 'closed', title: 'Renamed', body: marker('2026-09') };
  const f = fixture([...historical, monthly]);
  await f.run();
  assert.equal(f.created.length, 0);
  assert.equal(f.comments[0].issue_number, 101);
  assert.deepEqual(f.issues.at(-1), monthly);
});

test('does not reuse historical alerts, reports, previous months, or pull requests', async () => {
  const existing = [
    { number: 1, title: '⭐ Star Alerts (2026-09)', body: 'Historical alert' },
    { number: 2, title: '⭐ Monthly Star Report', body: 'Monthly summary' },
    { number: 3, body: marker('2026-08') },
    { number: 4, body: marker('2026-09'), pull_request: {} },
  ];
  const f = fixture(existing);
  await f.run();
  assert.equal(f.created.length, 1);
  assert.equal(f.comments[0].issue_number, 1000);
  assert.deepEqual(f.issues.slice(0, 4), existing);
});

test('lookup failure is surfaced without creating a duplicate thread', async () => {
  const f = fixture();
  f.github.paginate = async () => { throw new Error('API unavailable'); };
  await assert.rejects(f.run(), /API unavailable/);
  assert.equal(f.created.length, 0);
  assert.equal(f.comments.length, 0);
});

test('comment failure is surfaced and a retry reuses the created thread', async () => {
  const f = fixture();
  const createComment = f.github.rest.issues.createComment;
  f.github.rest.issues.createComment = async () => { throw new Error('Comment rejected'); };
  await assert.rejects(f.run(), /Comment rejected/);
  f.github.rest.issues.createComment = createComment;
  await f.run();
  assert.equal(f.created.length, 1);
  assert.equal(f.comments.length, 1);
});
