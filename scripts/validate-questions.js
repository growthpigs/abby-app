/**
 * Validate questions schema
 */

// Import the TypeScript file (requires ts-node or compilation)
// For now, we'll manually check the file

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../docs/data/questions-schema.ts');
const source = fs.readFileSync(schemaPath, 'utf8');

// Extract question data manually
const questions = [];
const questionMatches = source.matchAll(/\{[\s\S]*?id: '([^']+)'[\s\S]*?question: '([^']+)'[\s\S]*?vibe_shift: (null|'[^']+')[\s\S]*?\}/g);

for (const match of questionMatches) {
  questions.push({
    id: match[1],
    question: match[2],
    vibe_shift: match[3] === 'null' ? null : match[3].replace(/'/g, '')
  });
}

console.log('Total questions found:', questions.length);
console.log('Questions with vibe_shift:', questions.filter(q => q.vibe_shift).length);
console.log('Questions without vibe_shift:', questions.filter(q => !q.vibe_shift).length);

// Check for duplicate IDs
const ids = questions.map(q => q.id);
const uniqueIds = new Set(ids);
if (ids.length !== uniqueIds.size) {
  console.error('ERROR: Duplicate IDs found!');
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  console.error('Duplicates:', [...new Set(duplicates)]);
} else {
  console.log('✓ No duplicate IDs');
}

// Verify all vibe_shift values are valid
const validVibes = ['TRUST', 'PASSION', 'CAUTION', 'GROWTH', 'DEEP', 'ALERT'];
const invalidVibes = questions.filter(q => q.vibe_shift && !validVibes.includes(q.vibe_shift));
if (invalidVibes.length > 0) {
  console.error('ERROR: Invalid vibe_shift values found!');
  console.error('Invalid:', invalidVibes.map(q => ({ id: q.id, vibe: q.vibe_shift })));
} else {
  console.log('✓ All vibe_shift values are valid');
}

// Count vibe distribution
const vibeDistribution = {};
questions.forEach(q => {
  const vibe = q.vibe_shift || 'null';
  vibeDistribution[vibe] = (vibeDistribution[vibe] || 0) + 1;
});
console.log('\nVibe distribution:');
Object.entries(vibeDistribution).sort((a, b) => b[1] - a[1]).forEach(([vibe, count]) => {
  console.log(`  ${vibe}: ${count}`);
});

// Check question lengths
const longQuestions = questions.filter(q => q.question.length > 200);
if (longQuestions.length > 0) {
  console.warn(`\n⚠ ${longQuestions.length} questions are over 200 characters (may be slow to speak)`);
}

const veryLongQuestions = questions.filter(q => q.question.length > 300);
if (veryLongQuestions.length > 0) {
  console.error(`\n❌ ${veryLongQuestions.length} questions are over 300 characters (likely too long for TTS)`);
  veryLongQuestions.forEach(q => {
    console.error(`  ${q.id}: ${q.question.length} chars`);
  });
}
