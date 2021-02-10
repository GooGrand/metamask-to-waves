const {setScript, data, transfer, broadcast} = require('@waves/waves-transactions');

/*                 Importing waves libraries and neccessary functions           */ 
const libCrypto = require('@waves/waves-transactions').libs.crypto
const {Seed} = require('@waves/waves-transactions/dist/seedUtils/index')
const {distributorSeed, headers, nodeUrl, nodeTestnetUrl, distributorPrivateKey} = require('./config');

const sleep = m => new Promise(r => setTimeout(r, m));

async function feedWavesAcc(fromAcc, toAcc) {
    const signedTransfer = transfer({
        chainId: 84,
        recipient: toAcc,
        amount: 1800000,
        fee: 5000000
    }, fromAcc);
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
    const signedTransfer = setScript({
        chainId: 84,
        sender: wavesAddress,
        script: script,
        fee: 1400000,
    }, seed);
    try {
        var result = await broadcast(signedTransfer, nodeTestnetUrl);
        return result;
    } catch(e) {
        console.log('Saving data acc error: ');
        console.log(e);
    }
}
async function setupWavesAccount(sign){
    const instance = new Seed(Seed.create().phrase, 'T'.charCodeAt(0));
    let { address, phrase: seed, keyPair } = instance;
    console.log('Generated seed - '+seed);
    console.log('Generated address - '+address);
    const { publicKey, privateKey } = keyPair
    console.log('Generated public key - '+publicKey);
    var feed = await feedWavesAcc(distributorSeed, address);
    console.log('Result of feeding waves account');
    console.log(feed);
    console.log('Waiting for txn to complete');
    await sleep(30000);
    var setScript = await setScriptWaves(sign, address, seed);
    console.log('Check the result here');
    console.log(`https://testnet.wavesexplorer.com/address/${address}/script`);
}

module.exports = {
    feedWavesAcc,
    setScriptWaves,
    sleep,
    setupWavesAccount
}

