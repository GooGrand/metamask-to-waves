const {setScript, transfer, broadcast, invokeScript, data} = require('@waves/waves-transactions');

/*                 Importing waves libraries and neccessary functions           */ 
const libCrypto = require('@waves/waves-transactions').libs.crypto
const {Seed} = require('@waves/waves-transactions/dist/seedUtils/index')
const {distributorSeed, headers, nodeUrl, nodeTestnetUrl, distributorPrivateKey, dappAddress} = require('./config');
const base58 = require('base58-encode');
const eutil = require('ethereumjs-util')


const sleep = m => new Promise(r => setTimeout(r, m));

async function feedWavesAcc(fromAcc, toAcc) {
    const signedTransfer = transfer({
        chainId: 84,
        recipient: toAcc,
        amount: 2800000,
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

async function addData(seed, sign, msg) {
    encoded = base58(new Buffer.from(sign));
    const signedTransfer = data(msg); // we need to make proofs array
    signedTransfer.proofs.unshift(encoded); 
    console.log(signedTransfer);
    try {
        var result = await broadcast(signedTransfer, nodeTestnetUrl);
        return result;
    } catch(e) {
        console.log('Saving data acc error: ');
        console.log(e);
    }
}

function createWavesAccount(){
    const instance = new Seed(Seed.create().phrase, 'T'.charCodeAt(0));
    // let { address, phrase: seed, keyPair } = instance;
    // const { publicKey, privateKey } = keyPair;
    return instance;
}

function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}
async function setupMirror(pub, seed, address){
    var feed = await feedWavesAcc(distributorSeed, address);
    console.log('Result of feeding waves account');
    console.log(feed);
    console.log('Waiting for txn to complete');
    await sleep(10000);
    var setScript = await setScriptWaves(pub, address, seed);
    console.log(setScript);
    console.log('Check the result here');
    console.log(`https://testnet.wavesexplorer.com/address/${address}/script`);
    await sleep(6000)
}
function generateSignature(sign){
    sign = eutil.fromRpcSig(sign);
    var newArray = new Uint8Array(1);
    sign2arrays = concatTypedArrays(sign.r, sign.s)
    newArray[0] = sign.v;
    sign = concatTypedArrays(sign2arrays,newArray)
    console.log(base58(new Buffer.from(sign)));
    return sign;
}

async function makeTxn(sign, txn, seed){
    sign = generateSignature(sign);
    var data = await addData(seed, sign, txn)
    console.log(data);

}

async function addToAddresses(ethAddress, wavesAddress, seed) {
    const signedTransfer = invokeScript({
        chainId: 84,
        sender: wavesAddress,
        dApp: dappAddress,
        call: {
            function: "login",
            args: [
                {
                    type: "string",
                    value: ethAddress
                },
                {
                    type: "string",
                    value: wavesAddress
                }
            ]
        }
    }, seed);
    try {
        var result = await broadcast(signedTransfer, nodeTestnetUrl);
        return result;
    } catch(e) {
        console.log('saving addresses error: ');
        console.log(e);
    }
}

module.exports = {
    makeTxn,
    addToAddresses,
    createWavesAccount,
    setupMirror
}

