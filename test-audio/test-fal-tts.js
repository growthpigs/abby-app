/**
 * Fal.ai TTS Test - Orpheus & Dia models
 * Run: node test-audio/test-fal-tts.js
 */

const fs = require('fs');
const path = require('path');

const FAL_KEY = '00c10bec-d5cf-4fd0-8cc7-7bd74ed652cb:55ad5ca184ab611adf4fa82fcd7824a3';

// Abby's test phrases
const testPhrases = [
  {
    name: 'greeting',
    text: "Hi, I'm Abby. I'm here to help you find someone truly compatible. Shall we begin?",
  },
  {
    name: 'thinking',
    text: "Hmm, that's interesting. Tell me more about what matters most to you in a relationship.",
  },
  {
    name: 'excited',
    text: "Oh! I think I've found someone special for you. Would you like to hear about them?",
  },
];

// Test both Orpheus and Dia
const models = [
  { id: 'fal-ai/orpheus-tts', name: 'orpheus', voice: 'tara' },  // tara is female
  { id: 'fal-ai/dia-tts', name: 'dia', voice: null },  // dia uses different format
];

async function callFal(modelId, payload) {
  // Submit to queue
  const submitRes = await fetch(`https://queue.fal.run/${modelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Submit failed: ${submitRes.status} - ${err}`);
  }

  const { request_id } = await submitRes.json();
  console.log(`   Queued: ${request_id}`);

  // Poll for result
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(r => setTimeout(r, 1000));

    const statusRes = await fetch(`https://queue.fal.run/${modelId}/requests/${request_id}/status`, {
      headers: { 'Authorization': `Key ${FAL_KEY}` },
    });

    const status = await statusRes.json();

    if (status.status === 'COMPLETED') {
      // Get result
      const resultRes = await fetch(`https://queue.fal.run/${modelId}/requests/${request_id}`, {
        headers: { 'Authorization': `Key ${FAL_KEY}` },
      });
      return await resultRes.json();
    }

    if (status.status === 'FAILED') {
      throw new Error(`Job failed: ${JSON.stringify(status)}`);
    }

    attempts++;
    process.stdout.write('.');
  }

  throw new Error('Timeout waiting for result');
}

async function testOrpheus(phrase) {
  console.log(`\n🎙️  [Orpheus] "${phrase.text.substring(0, 40)}..."`);

  const result = await callFal('fal-ai/orpheus-tts', {
    prompt: phrase.text,
    voice: 'tara',  // Female voices: tara, leah, jess, leo, dan, mia, zac, zoe
  });

  if (result.audio?.url) {
    const audioRes = await fetch(result.audio.url);
    const buffer = Buffer.from(await audioRes.arrayBuffer());
    const outputPath = path.join(__dirname, `${phrase.name}-orpheus.wav`);
    fs.writeFileSync(outputPath, buffer);
    console.log(`\n   ✅ Saved: ${outputPath}`);
    return outputPath;
  }

  throw new Error('No audio URL in response');
}

async function testDia(phrase) {
  console.log(`\n🎙️  [Dia] "${phrase.text.substring(0, 40)}..."`);

  // Dia uses a transcript format with speaker tags
  const result = await callFal('fal-ai/dia-tts', {
    text: `[S1] ${phrase.text}`,  // S1 = speaker 1
  });

  if (result.audio?.url) {
    const audioRes = await fetch(result.audio.url);
    const buffer = Buffer.from(await audioRes.arrayBuffer());
    const outputPath = path.join(__dirname, `${phrase.name}-dia.wav`);
    fs.writeFileSync(outputPath, buffer);
    console.log(`\n   ✅ Saved: ${outputPath}`);
    return outputPath;
  }

  throw new Error('No audio URL in response');
}

async function main() {
  console.log('🔊 Fal.ai TTS Test for Abby');
  console.log('   Models: Orpheus (empathetic) & Dia (natural nonverbals)');
  console.log('─'.repeat(60));

  const startTime = Date.now();

  // Test Orpheus
  console.log('\n📢 Testing ORPHEUS (Llama-based, empathetic):');
  for (const phrase of testPhrases) {
    try {
      await testOrpheus(phrase);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  // Test Dia
  console.log('\n📢 Testing DIA (natural nonverbals):');
  for (const phrase of testPhrases) {
    try {
      await testDia(phrase);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  const elapsed = Date.now() - startTime;
  console.log('\n' + '─'.repeat(60));
  console.log(`⏱️  Total time: ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`📂 Files saved to: ${__dirname}`);
  console.log('\n▶️  Compare with: open test-audio/*.wav test-audio/*.mp3');
}

main().catch(console.error);
