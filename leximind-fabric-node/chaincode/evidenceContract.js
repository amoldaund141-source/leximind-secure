const { generateSHA256, signTransaction } = require('../utils/crypto');

const ledger = new Map();

class EvidenceContract {
    
    async registerEvidence(ctx, id, caseId, type, description, uploaderRole) {
        if (!['System Administrator', 'Forensic Analyst', 'Investigation Officer'].includes(uploaderRole)) {
            throw new Error(`Unauthorized: Role ${uploaderRole} cannot register evidence on the blockchain.`);
        }

        if (ledger.has(id)) {
            throw new Error(`Asset ${id} already exists on the ledger.`);
        }

        const evidenceAsset = {
            id,
            caseId,
            type,
            description,
            custodian: uploaderRole,
            timestamp: new Date().toISOString(),
            stateHash: ''
        };

        evidenceAsset.stateHash = generateSHA256(evidenceAsset);
        const signature = signTransaction(uploaderRole, evidenceAsset.stateHash);

        const block = {
            txId: generateSHA256(signature + Date.now()),
            asset: evidenceAsset,
            signature,
            status: 'AUTHENTIC'
        };

        ledger.set(id, block);
        return block;
    }

    async transferCustody(ctx, id, fromRole, toRole) {
        const block = ledger.get(id);
        if (!block) throw new Error(`Asset ${id} does not exist.`);

        if (block.asset.custodian !== fromRole) {
            throw new Error(`Custody transfer rejected. ${fromRole} does not currently hold this asset.`);
        }

        block.asset.custodian = toRole;
        block.asset.timestamp = new Date().toISOString();
        block.asset.stateHash = generateSHA256(block.asset);

        block.txId = generateSHA256(signTransaction(fromRole, block.asset.stateHash) + Date.now());
        
        ledger.set(id, block);
        return block;
    }

    async verifyIntegrity(ctx, id, expectedHash) {
        const block = ledger.get(id);
        if (!block) throw new Error(`Asset ${id} not found on ledger.`);
        
        const currentHash = generateSHA256(block.asset);
        if (currentHash !== expectedHash && expectedHash) {
            return { verified: false, reason: 'Hash mismatch! Data tampered.' };
        }
        return { verified: true, currentHash };
    }
}

module.exports = new EvidenceContract();
