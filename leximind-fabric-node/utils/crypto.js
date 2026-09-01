const crypto = require('crypto');

function generateSHA256(data) {
    const stringifiedData = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(stringifiedData).digest('hex');
}

function signTransaction(actorId, payloadHash) {
    return crypto.createHash('sha256').update(actorId + ':' + payloadHash).digest('hex');
}

module.exports = { generateSHA256, signTransaction };
