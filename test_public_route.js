const axios = require('axios');
const { Script, User, sequelize } = require('./src/models');

async function runTest() {
    await new Promise(r => setTimeout(r, 2000));
    const baseURL = 'http://localhost:3000';
    let cookie = '';

    console.log('--- PUBLIC ROUTE TEST START ---');

    // 1. Register with Username
    const username = 'testuser_' + Date.now();
    try {
        await axios.post(`${baseURL}/auth/register`, {
            username: username,
            password: 'password123'
        });
        console.log('1. Register: OK');
    } catch (e) {
        console.error('1. Register: FAILED', e.message);
    }

    // 2. Login
    try {
        const res = await axios.post(`${baseURL}/auth/login`, {
            username: username,
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
    const scriptName = 'MyScript';
    try {
        await axios.post(`${baseURL}/dashboard/create`, {
            name: scriptName,
            description: 'Testing Public Route',
            content: 'print("Public Hello")'
        }, {
            headers: { Cookie: cookie },
            maxRedirects: 0,
            validateStatus: s => s >= 200 && s < 400 
        });
        console.log('3. Create Script: OK');
    } catch (e) {
        console.error('3. Create Script: ERROR', e.message);
    }

    // 4. Access Public Route /:username/:scriptName
    try {
        const url = `${baseURL}/${username}/${scriptName}`;
        console.log(`4. Accessing: ${url}`);
        const res = await axios.get(url);
        
        console.log('4. Public Access: OK');
        console.log('   Content (Encrypted):', res.data);
        
        if (typeof res.data === 'string' && res.data.length > 0) {
             console.log('5. Verification: Content Received');
        } else {
             console.error('5. Verification: Empty Content');
        }

    } catch (e) {
        console.error('4. Public Access: ERROR', e.message);
        if (e.response) console.error('   Status:', e.response.status, e.response.data);
    }

    console.log('--- TEST END ---');
    process.exit(0);
}

runTest();
