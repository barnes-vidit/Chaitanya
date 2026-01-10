import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

console.log('--- ENV DEBUG INFO ---');
console.log('Checking path:', envPath);

try {
    if (fs.existsSync(envPath)) {
        console.log('✅ File exists.');
        const stats = fs.statSync(envPath);
        console.log('Size:', stats.size, 'bytes');

        const rawContent = fs.readFileSync(envPath, 'utf8');
        console.log('Raw content length:', rawContent.length);

        // Check for BOM
        if (rawContent.charCodeAt(0) === 0xFEFF) {
            console.log('⚠️ WARNING: BOM (Byte Order Mark) detected! This may block parsing.');
        } else {
            console.log('No BOM detected at start.');
        }

        const parsed = dotenv.parse(rawContent);
        console.log('Parsed Keys:', Object.keys(parsed));

        if (Object.keys(parsed).length === 0) {
            console.log('❌ Error: dotenv parsed 0 keys. Content might be invalid format.');
            console.log('First 50 chars of raw content (safe view):');
            console.log(JSON.stringify(rawContent.substring(0, 50)));
        } else {
            console.log('✅ Successfully parsed keys.');
        }

    } else {
        console.log('❌ Error: .env file NOT found at expected path.');
    }
} catch (error) {
    console.error('Error reading .env:', error);
}
console.log('----------------------');
