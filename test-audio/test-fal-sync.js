/**
 * Fal.ai TTS Test - Direct sync call
 * Run: node test-audio/test-fal-sync.js
 */

const fs = require('fs');
const path = require('path');

const FAL_KEY = '00c10bec-d5cf-4fd0-8cc7-7bd74ed652cb:55ad5ca184ab611adf4fa82fcd7824a3';

const phrase = "Hi, I'm Abby. I'm here to help you find someone truly compatible. Shall we begin?";

async function testOrpheus() {
  console.log('🎙️  Testing Orpheus TTS...');
  console.log(`   Text: "${phrase}"`);

  const startTime = Date.now();

  const res = await fetch('https://fal.run/fal-ai/orpheus-tts', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: phrase,
      voice: 'tara',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ API Error: ${res.status} - ${err}`);
    return;
  }

  const result = await res.json();
  const elapsed = Date.now() - startTime;

  console.log(`   ⏱️  Response time: ${elapsed}ms`);

  if (result.audio?.url) {
    console.log(`   📥 Downloading audio...`);
    const audioRes = await fetch(result.audio.url);
    const buffer = Buffer.from(await audioRes.arrayBuffer());
    const outputPath = path.join(__dirname, 'greeting-orpheus.wav');
    fs.writeFileSync(outputPath, buffer);
    console.log(`   ✅ Saved: ${outputPath}`);

    // Open it
    require('child_process').execSync(`open "${outputPath}"`);
  } else {
    console.log('   ⚠️  Response:', JSON.stringify(result, null, 2));
  }
}

testOrpheus().catch(console.error);
