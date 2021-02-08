const {setScript, data, transfer, broadcast} = require('@waves/waves-transactions');

/*                 Importing waves libraries and neccessary functions           */ 
const libCrypto = require('@waves/waves-transactions').libs.crypto
const {Seed} = require('@waves/waves-transactions/dist/seedUtils/index')
const {distributorSeed, headers, nodeUrl, nodeTestnetUrl} = require('./config');

const sleep = m => new Promise(r => setTimeout(r, m));

async function feedWavesAcc(fromAcc, toAcc) {
    const signedTransfer = transfer({
        chainId: 84,
        recipient: toAcc,
        amount: 100000,
        fee: 5000000
    }, fromAcc);
    console.log(signedTransfer);
    try {
        var result = await broadcast(signedTransfer, nodeTestnetUrl);
        return result;
    } catch(e) {
        console.log('Feeding waves acc error: ');
        console.log(e);
    }
}

async function generateScript(sign){
    var script = `{-# STDLIB_VERSION 4 #-}
    {-# CONTENT_TYPE DAPP #-}
    {-# SCRIPT_TYPE ACCOUNT #-}
    
    
    @Verifier(tx)
    func verify() = {
        let publicKeyEth = base64'${sign}'
        ecrecover(keccak256(tx.bodyBytes), tx.proofs[0]) == publicKeyEth
    }`;
    var res = await fetch(nodeTestnetUrl+'/utils/script/compileCode', {
        method: 'POST',
        body: script
    });
    var json = await res.json();
    var encoded = await json.script;
    return encoded;
}

async function setScriptWaves(sign, wavesAddress, seed) {
    var script = await generateScript(sign);
    console.log(script);
    const signedTransfer = setScript({
        chainId: 84,
        sender: wavesAddress,
        script: script,
        fee: 1400000,
    }, seed);
    console.log(signedTransfer);
    try {
        var result = await broadcast(signedTransfer, nodeTestnetUrl);
        return result;
    } catch(e) {
        console.log('Saving data acc error: ');
        console.log(e);
    }
}

module.exports = {
    feedWavesAcc,
    setScriptWaves,
    sleep
}

