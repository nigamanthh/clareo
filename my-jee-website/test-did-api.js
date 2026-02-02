import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function testDID() {
    console.log('Testing D-ID API...');
    console.log('API Key from .env:', process.env.DID_API_KEY);

    const apiKey = process.env.DID_API_KEY;

    // Try with a publicly available image URL instead
    try {
        console.log('\n--- Test 1: Using public image URL ---');
        const response = await axios.post(
            'https://api.d-id.com/talks',
            {
                script: {
                    type: 'text',
                    input: 'Hello, this is a test.',
                    provider: {
                        type: 'microsoft',
                        voice_id: 'en-US-JennyNeural'
                    }
                },
                source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg'
            },
            {
                headers: {
                    'Authorization': `Basic ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Success! Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Response:', JSON.stringify(error.response?.data, null, 2));

        // Try without voice provider
        console.log('\n--- Test 2: Without voice provider ---');
        try {
            const response2 = await axios.post(
                'https://api.d-id.com/talks',
                {
                    script: {
                        type: 'text',
                        input: 'Hello, this is a test.'
                    },
                    source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg'
                },
                {
                    headers: {
                        'Authorization': `Basic ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Success with Test 2! Response:', JSON.stringify(response2.data, null, 2));
        } catch (error2) {
            console.error('Test 2 also failed:', error2.message);
            console.error('Response:', JSON.stringify(error2.response?.data, null, 2));
        }
    }
}

testDID();
