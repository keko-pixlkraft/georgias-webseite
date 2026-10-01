const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const decode = s => s.replaceAll('&amp;', '&');
const options = [...html.matchAll(/<option(?: [^>]*)?>(.*?)<\/option>/g)].map(m => decode(m[1]));

test('all nine bookable choices use the new prices', () => {
  const expected = [
    'Energy Healing — 60 minutes — €333', 'Energy Healing — 90 minutes — €444',
    'Mindset Strategy — 60 minutes — €333', 'The Alignment Session — 90 minutes — €444',
    'Manifestation & Self-Concept — 75 minutes — €444', 'Intuitive Tarot — 60 minutes — €333',
    'The Alignment Journey — 4 sessions — €1,333', 'The Georgia Edit — 8 sessions — €2,222',
    'Private 1:1 Mentorship — 12 weeks — €3,333'
  ];
  assert.deepEqual(options.filter(s => s.includes('€')), expected);
  assert.doesNotMatch(html, /€(?:330|450|335|490|410|225|1,200|2,400|3,750)\b/);
  for (const m of html.matchAll(/data-(?:session|preset|choice)="([^"]+)"/g)) {
    assert.ok(options.includes(decode(m[1])), `Unmatched selection: ${m[1]}`);
  }
});

test('focus tiles contain only the numbered four labels', () => {
  const gallery = html.split('<section class="focus-gallery"')[1].split('</section>')[0];
  assert.equal((gallery.match(/class="focus-card reveal"/g) || []).length, 4);
  assert.doesNotMatch(gallery, /<p\b/);
  assert.deepEqual([...gallery.matchAll(/<h3>(.*?)<\/h3>/g)].map(m => m[1]), ['Energy', 'Mindset', 'Alignment', 'Intuition']);
});

test('every local image and stylesheet reference resolves', () => {
  for (const m of html.matchAll(/(?:src|href)="((?:assets\/|styles\.css|script\.js|logo-)[^"]*)"/g)) {
    assert.ok(fs.existsSync(path.join(root, m[1])), `Missing asset: ${m[1]}`);
  }
});

test('all specified support inclusions remain on the page', () => {
  for (const term of ['Full energy scan', 'chakra clearing', 'cord cutting', 'nervous system reset',
    'journaling prompts', 'voice note recap', '3 days', 'scripting bundle', 'recording',
    'Monday–Friday', '24-hour response', 'EFT taps', 'SOS calls', 'Business / life strategy']) {
    assert.ok(html.includes(term), `Missing inclusion: ${term}`);
  }
});
