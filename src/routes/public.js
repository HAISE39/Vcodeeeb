const express = require('express');
const router = express.Router();
const { Script, ScriptVersion, User } = require('../models');
const { encryptScript } = require('../utils/encryption');

router.get('/:username/:scriptName', async (req, res) => {
    try {
        const { username, scriptName } = req.params;

        // 1. Find User
        const user = await User.findOne({ where: { username } });
        if (!user) {
            res.setHeader('Content-Type', 'text/plain');
            return res.status(404).send('User not found');
        }

        // 2. Find Script
        // We assume script name is URL safe. 
        // We need to match case-insensitive or exact? Exact for now.
        const script = await Script.findOne({ 
            where: { 
                name: scriptName, 
                createdBy: user.id 
            } 
        });

        if (!script || !script.isActive) {
            res.setHeader('Content-Type', 'text/plain');
            return res.status(404).send('Script not found or disabled');
        }

        if (!script.secretKey) {
            res.setHeader('Content-Type', 'text/plain');
            return res.status(500).send('Script Error: Missing Secret Key');
        }

        // 3. Get Content
        const latestVersion = await ScriptVersion.findOne({
            where: { scriptId: script.id },
            order: [['version', 'DESC']]
        });

        if (!latestVersion) {
            res.setHeader('Content-Type', 'text/plain');
            return res.status(500).send('No script content found');
        }

        // 4. Return Encrypted Content (Publicly visible but encrypted)
        // This satisfies "Raw View" requirement.
        const encrypted = encryptScript(latestVersion.content, script.secretKey);

        res.setHeader('Content-Type', 'text/plain');
        res.send(encrypted);

    } catch (error) {
        console.error('[Public Endpoint Error]', error);
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

module.exports = router;
