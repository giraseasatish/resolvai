// check_models.js
const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.error("❌ ERROR: No GEMINI_API_KEY found in .env file");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("🔍 Connecting to Google to check your access...");

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`\n❌ API ERROR (Status ${res.statusCode}):`);
      console.error(data);
    } else {
      const response = JSON.parse(data);
      console.log("\n✅ SUCCESS! Here are the models your key can access:\n");
      response.models.forEach(model => {
        // We only care about models that support 'generateContent'
        if (model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`Model Name: ${model.name.replace('models/', '')}`); // This is the string you need
        }
      });
    }
  });

}).on("error", (err) => {
  console.error("Network Error:", err.message);
});