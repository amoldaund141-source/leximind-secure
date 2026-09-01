const express = require('express');
const cors = require('cors');
const evidenceContract = require('./chaincode/evidenceContract');

const app = express();
app.use(cors());
app.use(express.json());

const mockCtx = { clientIdentity: 'DjangoBackend' };

app.post('/api/fabric/evidence/register', async (req, res) => {
    try {
        const { id, caseId, type, description, role } = req.body;
        console.log(`[FABRIC PEER] Executing Chaincode registerEvidence for ${id}`);
        const result = await evidenceContract.registerEvidence(mockCtx, id, caseId, type, description, role);
        res.status(201).json({ success: true, transaction: result });
    } catch (error) {
        console.error(`[CHAINCODE ERROR] ${error.message}`);
        res.status(403).json({ success: false, error: error.message });
    }
});

app.post('/api/fabric/evidence/transfer', async (req, res) => {
    try {
        const { id, fromRole, toRole } = req.body;
        console.log(`[FABRIC PEER] Executing Chaincode transferCustody for ${id}`);
        const result = await evidenceContract.transferCustody(mockCtx, id, fromRole, toRole);
        res.status(200).json({ success: true, transaction: result });
    } catch (error) {
        console.error(`[CHAINCODE ERROR] ${error.message}`);
        res.status(403).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[Hyperledger Fabric Simulated Node] Gateway active on port ${PORT}`);
    console.log(`Loaded Chaincode: EvidenceContract (v1.0)`);
});
