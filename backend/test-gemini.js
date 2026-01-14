// Enhanced test script to diagnose Gemini API issues
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function diagnoseGeminiAPI() {
  console.log('=== Gemini API Diagnostic Tool ===\n');
  
  // Check if API key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === '' || apiKey === 'your_gemini_api_key_here') {
    console.error('❌ GEMINI_API_KEY is not configured in .env file');
    console.log('\nPlease:');
    console.log('1. Get your free API key from: https://makersuite.google.com/app/apikey');
    console.log('2. Add it to backend/.env file: GEMINI_API_KEY=your_actual_key');
    console.log('3. Restart the backend server\n');
    return;
  }
  
  console.log(`✓ API Key found (length: ${apiKey.length} characters)`);
  console.log(`  Preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`  (Showing first 10 and last 5 characters for verification)\n`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try the current free tier models (2024-2026)
    const modelsToTry = [
      'gemini-3-flash-preview',    // Gemini 3 preview (if available)
      'gemini-2.0-flash-exp',      // Experimental 2.0 model
      'gemini-1.5-flash-latest',   // Primary free tier model
      'gemini-1.5-flash',          // Alternative naming
      'gemini-1.5-pro-latest',     // Pro version (may have limits)
      'gemini-1.5-pro'             // Alternative pro naming
    ];
    
    console.log('Testing available models...\n');
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Respond with just the word "success"');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✓ SUCCESS! Model "${modelName}" is working!`);
        console.log(`  Response: ${text.trim()}\n`);
        console.log(`\n🎉 Use this model in your config: "${modelName}"\n`);
        return modelName;
      } catch (error) {
        console.log(`✗ Failed: ${error.message}`);
        if (error.status) console.log(`  Status: ${error.status}`);
        if (error.statusText) console.log(`  Status Text: ${error.statusText}`);
        console.log(''); // Empty line for readability
      }
    }
    
    console.error('\n❌ None of the standard models worked.');
    console.log('\nPossible issues:');
    console.log('1. Invalid API key - verify at https://makersuite.google.com/app/apikey');
    console.log('2. API key not activated - may take a few minutes after creation');
    console.log('3. Regional restrictions - Gemini API may not be available in your region');
    console.log('4. Quota exceeded - check your API usage\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

diagnoseGeminiAPI();
