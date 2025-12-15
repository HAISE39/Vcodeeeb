const express = require('express');
const router = express.Router();
const { Script, ScriptVersion, User } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const { generateLoader } = require('../utils/loaderGenerator');
const { v4: uuidv4 } = require('uuid');

router.use(authenticate);

// Handle accidental POST to /dashboard by redirecting to GET
router.post('/', (req, res) => {
    res.redirect(303, '/dashboard');
});

// List Scripts
router.get('/', async (req, res) => {
  const scripts = await Script.findAll({ 
      where: req.user.role === 'admin' ? {} : { createdBy: req.user.id },
      include: [{ model: User, attributes: ['email'] }]
  });
  res.render('dashboard/index', { scripts, user: req.user });
});

// Create Script Page
router.get('/create', (req, res) => {
  res.render('dashboard/create', { user: req.user });
});

// Create Script Action
router.post('/create', async (req, res) => {
  try {
      console.log('[Dashboard] Create Script Request:', req.body);
      const { name, description, content } = req.body;
      
      if (!name || !content) {
          return res.status(400).send('Name and Content are required');
      }

      const script = await Script.create({
          uuid: uuidv4(),
          secretKey: uuidv4(),
          name,
          description,
          createdBy: req.user.id
      });
      
      await ScriptVersion.create({
          scriptId: script.id,
          content: content,
          version: 1
      });
      
      res.redirect(303, '/dashboard');
  } catch (error) {
      console.error('[Dashboard] Create Error:', error);
      res.status(500).send('Error creating script: ' + error.message);
  }
});

// Edit Script Page
router.get('/edit/:id', async (req, res) => {
    const script = await Script.findByPk(req.params.id, {
        include: [ScriptVersion]
    });
    
    if (!script) return res.status(404).send('Not Found');
    if (req.user.role !== 'admin' && script.createdBy !== req.user.id) return res.status(403).send('Unauthorized');
    
    // Get latest version content
    const latestVersion = await ScriptVersion.findOne({
        where: { scriptId: script.id },
        order: [['version', 'DESC']]
    });

    // Generate Loader Code
    const domain = `${req.protocol}://${req.get('host')}`;
    const loaderCode = generateLoader(domain, script.uuid, script.secretKey);

    res.render('dashboard/edit', { script, content: latestVersion ? latestVersion.content : '', loaderCode, user: req.user });
});

// Update Script Action
router.post('/edit/:id', async (req, res) => {
    const { name, description, content, isActive } = req.body;
    const script = await Script.findByPk(req.params.id);
    
    if (!script) return res.status(404).send('Not Found');
    if (req.user.role !== 'admin' && script.createdBy !== req.user.id) return res.status(403).send('Unauthorized');

    await script.update({ name, description, isActive: isActive === 'on' });
    
    // Check if content changed
    const latestVersion = await ScriptVersion.findOne({
        where: { scriptId: script.id },
        order: [['version', 'DESC']]
    });
    
    if (!latestVersion || latestVersion.content !== content) {
        const nextVersion = latestVersion ? latestVersion.version + 1 : 1;
        await ScriptVersion.create({
            scriptId: script.id,
            content,
            version: nextVersion
        });
    }

    res.redirect(303, '/dashboard');
});

// Delete Script
router.post('/delete/:id', async (req, res) => {
    const script = await Script.findByPk(req.params.id);
    if (!script) return res.status(404).send('Not Found');
    if (req.user.role !== 'admin' && script.createdBy !== req.user.id) return res.status(403).send('Unauthorized');
    
    await script.destroy();
    res.redirect(303, '/dashboard');
});

module.exports = router;
