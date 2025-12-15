const axios = require('axios');
const { Script, User, sequelize } = require('./src/models');

async function runTest() {
    // Wait for server to start
    await new Promise(r => setTimeout(r, 2000));

    const baseURL = 'http://localhost:3000';
    let cookie = '';

    console.log('--- TEST START ---');

    // 1. Register
    try {
        await axios.post(`${baseURL}/auth/register`, {
            email: 'admin@test.com',
            password: 'password123'
        });
        console.log('1. Register: OK');
    } catch (e) {
        // Might already exist if run twice
        console.log('1. Register: Skipped (or failed)');
    }

    // 2. Login
    try {
        const res = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@test.com',
            password: 'password123'
        }, { maxRedirects: 0, validateStatus: s => s >= 200 && s < 400 });
        
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
            cookie = setCookie[0].split(';')[0];
            console.log('2. Login: OK');
        } else {
            console.error('2. Login: FAILED (No cookie)');
        }
    } catch (e) {
        console.error('2. Login: ERROR', e.message);
    }

    // 3. Create Script
    try {
        await axios.post(`${baseURL}/dashboard/create`, {
            name: 'Test Script',
            description: 'Testing',
            content: 'print("Hello from Secure Server")'
        }, {
            headers: { Cookie: cookie }
        });
        console.log('3. Create Script: OK');
    } catch (e) {
        console.error('3. Create Script: ERROR', e.message);
    }

    // 4. Get Script Info from DB directly (since we can't parse HTML easily here)
    const script = await Script.findOne({ where: { name: 'Test Script' } });
    if (!script) {
        console.error('Script not found in DB');
        return;
    }
    console.log(`4. Script Info: UUID=${script.uuid}, Key=${script.secretKey}`);

    // 5. Test Raw Endpoint - NO HEADERS (Browser behavior)
    try {
        await axios.get(`${baseURL}/raw/${script.uuid}`, {
            maxRedirects: 0,
            validateStatus: status => status === 403
        });
        console.log('5. Browser Access: OK (Got 403 Forbidden Text Page)');
    } catch (e) {
        if (e.response && (e.response.status === 302 || e.response.status === 301)) {
            console.error('5. Browser Access: FAILED (Got Redirect, expected 403 Text)');
        } else {
            console.error('5. Browser Access: Unexpected Status', e.response ? e.response.status : e.message);
        }
    }

    // 6. Test Raw Endpoint - WITH HEADERS (GG behavior)
    try {
        const res = await axios.get(`${baseURL}/raw/${script.uuid}`, {
            headers: {
                'X-GG-KEY': script.secretKey
            }
        });
        
        console.log('6. Secure Access: OK');
        console.log('   Encrypted Content:', res.data);
        
        // Decrypt verification
        // Node version of the XOR decrypt
        const { encryptScript } = require('./src/utils/encryption');
        // Encrypt 'print("Hello from Secure Server")' to see if it matches
        // Actually, encryptScript does XOR + Base64.
        // So the response should match exactly what we get if we encrypt locally.
        
        const expected = encryptScript('print("Hello from Secure Server")', script.secretKey);
        if (res.data === expected) {
            console.log('7. Encryption Verification: MATCH');
        } else {
            console.log('7. Encryption Verification: MISMATCH');
            console.log('Expected:', expected);
            console.log('Got:', res.data);
        }

    } catch (e) {
        console.error('6. Secure Access: ERROR', e.message);
    }

    console.log('--- TEST END ---');
    process.exit(0);
}

runTest();
