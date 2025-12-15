const crypto = require('crypto');

function xorEncrypt(text, key) {
  let result = [];
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(result);
}

function encryptScript(scriptContent, key) {
  // 1. Custom XOR
  const xorBuffer = xorEncrypt(scriptContent, key);
  // 2. Base64 Encode
  return xorBuffer.toString('base64');
}

module.exports = {
  encryptScript
};
