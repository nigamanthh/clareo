import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function checkCredits() {
    console.log('Checking D-ID account credits...');
    const apiKey = process.env.DID_API_KEY;

    try {
        const response = await axios.get(
            'https://api.d-id.com/credits',
            {
                headers: {
                    'Authorization': `Basic ${apiKey}`
                }
            }
        );

        console.log('Credits Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Response:', JSON.stringify(error.response?.data, null, 2));
    }
}

checkCredits();
