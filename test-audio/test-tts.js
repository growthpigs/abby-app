/**
 * Quick TTS test using OpenAI
 * Run: node test-audio/test-tts.js
 */

const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment');
  process.exit(1);
}

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

// Available voices: alloy, echo, fable, onyx, nova, shimmer
const VOICE = 'nova'; // nova is warm and feminine

async function generateSpeech(phrase) {
  console.log(`\n🎙️  Generating: "${phrase.text.substring(0, 50)}..."`);

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: phrase.text,
      voice: VOICE,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const outputPath = path.join(__dirname, `${phrase.name}-${VOICE}.mp3`);
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ Saved: ${outputPath}`);
  return outputPath;
}

async function main() {
  console.log('🔊 OpenAI TTS Test for Abby');
  console.log(`📢 Voice: ${VOICE}`);
  console.log('─'.repeat(50));

  const startTime = Date.now();

  for (const phrase of testPhrases) {
    try {
      await generateSpeech(phrase);
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
    }
  }

  const elapsed = Date.now() - startTime;
  console.log('\n─'.repeat(50));
  console.log(`⏱️  Total time: ${elapsed}ms for ${testPhrases.length} phrases`);
  console.log(`📂 Files saved to: ${__dirname}`);
  console.log('\n▶️  Play with: open test-audio/*.mp3');
}

main();
