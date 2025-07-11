require('dotenv').config();
const { aiClient } = require('./dist/utils/ai-client.js');

async function testOpenAI() {
  console.log('Testing OpenAI API...');
  
  try {
    const result = await aiClient.complete({
      prompt: 'Say "Hello, I am working!" in JSON format with a field called "message"',
      temperature: 0.7,
      maxTokens: 100,
      responseFormat: { type: 'json_object' }
    });
    
    console.log('Result:', result);
    
    if (result.success && result.data) {
      console.log('✅ OpenAI API is working!');
      console.log('Response:', result.data.content);
    } else {
      console.log('❌ OpenAI API failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error calling OpenAI:', error.message);
  }
}

testOpenAI();