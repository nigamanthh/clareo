import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function listModels() {
  try {
    console.log('Fetching available Gemini models...\n');

    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    const models = response.data.models;

    console.log('Available models:');
    console.log('='.repeat(80));

    for (const model of models) {
      console.log(`\nModel: ${model.name}`);
      console.log(`Display Name: ${model.displayName}`);
      console.log(`Description: ${model.description || 'N/A'}`);
      console.log(`Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('-'.repeat(80));
    }

    console.log('\n\nModel names to use in code (only generateContent):');
    console.log('='.repeat(80));
    for (const model of models) {
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`"${model.name}",  // ${model.displayName}`);
      }
    }

  } catch (error) {
    console.error('Error fetching models:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

listModels();
