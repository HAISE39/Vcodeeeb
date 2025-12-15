const express = require('express');
const router = express.Router();
const { Script, ScriptVersion } = require('../models');
const { encryptScript } = require('../utils/encryption');

router.get('/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params;
        const script = await Script.findOne({ where: { uuid } });

        // 1. Check if script exists and is active
        if (!script || !script.isActive) {
            // Fake 404 behavior or redirect
            return res.redirect('https://google.com');
        }

        // 2. Validate Headers (Anti-Browser / Anti-Leech)
        const ggKey = req.headers['x-gg-key'];
        // const userAgent = req.headers['user-agent'];

        // Strict Check: Key must match script's secret key
        if (ggKey !== script.secretKey) {
            // Log attempt?
            return res.redirect('https://google.com'); // Redirect browser to innocent site
        }

        // Optional: Check User-Agent (GG usually sets one, but can be spoofed)
        // if (userAgent && !userAgent.includes('GameGuardian')) { ... }

        // 3. Get Content
        const latestVersion = await ScriptVersion.findOne({
            where: { scriptId: script.id },
            order: [['version', 'DESC']]
        });

        if (!latestVersion) {
            return res.status(500).send('No script content');
        }

        // 4. Encrypt
        // Use the same key for encryption as the one passed? 
        // Or use the script.secretKey as the encryption key?
        // The loader uses the secret passed in header to decrypt.
        // So we must encrypt with script.secretKey.
        
        const encrypted = encryptScript(latestVersion.content, script.secretKey);

        // 5. Send Response
        res.setHeader('Content-Type', 'text/plain');
        res.send(encrypted);

    } catch (error) {
        console.error(error);
        res.redirect('https://google.com');
    }
});

module.exports = router;
