// PAckage imports
const {setScript, transfer, broadcast, invokeScript, data} = require('@waves/waves-transactions');
const libCrypto = require('@waves/waves-transactions').libs.crypto
const {Seed} = require('@waves/waves-transactions/dist/seedUtils/index')
const base58 = require('base58-encode');
const { binary, json } = require('@waves/marshall');
// Local imports
const {distributorSeed, headers, nodeUrl, nodeTestnetUrl, distributorPrivateKey, dappAddress} = require('./config');
const {generateSignature} = require('./utils')

const sleep = m => new Promise(r => setTimeout(r, m));

/**
 * Sends static amount of the waves token to the account
 * 
 * @param {string} fromAcc seed value of the Sender account
 * @param {string} toAcc   address of the reciever account
 * @returns JSON of handled transaction
 */
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

/**
 * Generates account script that will verify every transaction with the public key
 * 
 * @param {string} pub Ethereum public key
 * @returns {string} Encoded to base64 format script (via waves node)
 */
async function generateScript(pub){
    var script = `{-# STDLIB_VERSION 4 #-}
    {-# CONTENT_TYPE DAPP #-}
    {-# SCRIPT_TYPE ACCOUNT #-}
    
    @Verifier(tx)
    func verify() = {
        let publicKeyEth = base64'${pub}'
        ecrecover(keccak256(toBytes(toBase64String(base64'GQ') + toBase64String(base64'RXRoZXJldW0gU2lnbmVkIE1lc3NhZ2U6Cg==') + toString(size(tx.bodyBytes)) + toBase64String(tx.bodyBytes))), tx.proofs[0]) == publicKeyEth
    }`;
    var res = await fetch(nodeTestnetUrl+'/utils/script/compileCode', {
        method: 'POST',
        body: script
    });
    var json = await res.json();
    var encoded = await json.script;
    return encoded;
}


/**
 * Generates script and sends setScriptTransaction to the waves node
 * 
 * @param {string} pub Ethereum public key
 * @param {string} wavesAddress  Waves Address set script to
 * @param {string} seed seed of generated waves account
 */
async function setScriptWaves(pub, wavesAddress, seed) {
    var script = await generateScript(pub);
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
/**
 * Example of the transaction to check the Virifier
 * 
 * @param {string} sign Signature of ethereum account
 * @param {Object} msg  JSON data of waves transaction, that will be executed
 */
async function addData(sign, msg) {
    var encoded = base58(sign);
    msg.proofs = [encoded]; 
    try {
        var result = await broadcast(msg, nodeTestnetUrl);
        return result;
    } catch(e) {
        console.log('Saving data acc error: ');
        console.log(e);
    }
}

/**
 * Creates new waves account instance with address, seed and keypair
 * 
 */
function createWavesAccount(){
    const instance = new Seed(Seed.create().phrase, 'T'.charCodeAt(0));
    // let { address, phrase: seed, keyPair } = instance;
    // const { publicKey, privateKey } = keyPair;
    return instance;
}

/**
 * Executes feeding new account and setting script with correct pKey to it
 * 
 * @param {string} pub Ethereum public key
 * @param {string} seed Waves account seed to sign transaction
 * @param {string} address Waves address to feed it with token
 */
async function setupMirror(pub, seed, address){
    var feed = await feedWavesAcc(distributorSeed, address);
    console.log(feed);
    await sleep(10000);
    var setScript = await setScriptWaves(pub, address, seed);
    console.log(`https://testnet.wavesexplorer.com/address/${address}/script`);
    console.log(setScript);
}

/**
 * Makes example transaction
 * 
 * @param {string} sign signature of the given transaction
 * @param {Object} txn transaction object
 */
async function makeTxn(sign, txn){
    sign = generateSignature(sign);
    var data = await addData(sign, txn)
    console.log(data);
}

/**
 * Function to add address pair(waves\ethereum) to the centrilized account 
 * 
 * @param {string} ethAddress Ethereum address
 * @param {string} wavesAddress Waves address
 * @param {string} seed Waves account seed to sign transaction
 */
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
    setupMirror,
    generateSignature
}

