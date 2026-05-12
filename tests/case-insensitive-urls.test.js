const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('case-insensitive url map includes generated pages and static apps', () => {
  const mapPath = path.join(root, 'case-insensitive-urls.json');
  const source = fs.readFileSync(mapPath, 'utf8');

  assert.match(source, /site\.html_pages/);
  assert.match(source, /site\.posts/);
  assert.match(source, /site\.static_files/);
  assert.match(source, /downcase/);
  assert.match(source, /jsonify/);
});

test('404 page redirects case-insensitive matches to canonical urls', () => {
  const page404 = fs.readFileSync(path.join(root, '404.html'), 'utf8');

  assert.match(page404, /case-insensitive-urls\.json/);
  assert.match(page404, /location\.pathname/);
  assert.match(page404, /toLowerCase\(\)/);
  assert.match(page404, /location\.replace/);
});
