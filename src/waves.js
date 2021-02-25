// PAckage imports
const {setScript, transfer, broadcast, invokeScript, waitForTx} = require('@waves/waves-transactions');
const {Seed} = require('@waves/waves-transactions/dist/seedUtils/index')
// Local imports
const {distributorSeed, distributorPrivateKey, nodeUrl, dappAddress} = require('./config');
const {generateSignature} = require('./utils')


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
        fee: 1000000
    }, fromAcc);
    console.log(signedTransfer)
    try {
        var result = await broadcast(signedTransfer, nodeUrl);
        console.log(result)
        await waitForTx(signedTransfer.id, {
            apiBase: nodeUrl
        });
        return result;
    } catch(e) {
        console.log(e);
        return e;
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
        let bodyBase64 = tx.bodyBytes.toBase64String()
        let signedMessage = ("\x19Ethereum Signed Message:\\n" + bodyBase64.size().toString() + bodyBase64).toBytes()
        let signature = tx.proofs[0] + tx.proofs[1]
        let proofSize = signature.size()

        if proofSize != 65 then
            throw("Wrong proof size. Actual: " + proofSize.toString() + ". Expected: 65.")
        else {
            let pbk = ecrecover(signedMessage.keccak256(), signature)
            pbk == base16'${pub.replace('0x', '')}'
        }
    }`;
    var res = await fetch(nodeUrl+'/utils/script/compileCode', {
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
        var result = await broadcast(signedTransfer, nodeUrl);
        return result;
    } catch(e) {
        console.log(e);
        return e;
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
    if(feed.error) {
        return feed
    }
    var setScript = await setScriptWaves(pub, address, seed);
    if(setScript.error){
        return setScript
    }
    console.log(`https://wavesexplorer.com/address/${address}`);
    console.log(setScript);
    return `https://testnet.wavesexplorer.com/address/${address}`
}

/**
 * Example of the transaction to check the Virifier
 *
 * @param {string} sign Signature of ethereum account
 * @param {Object} msg JSON data of waves transaction, that will be executed
 */
async function addData(sign, msg) {
    msg.proofs = sign;
    console.log(msg)
    try {
        var result = await broadcast(msg, nodeUrl);
        return result;
    } catch(e) {
        console.log(e);
        return e;
    }
}

/**
 * Makes example transaction
 *
 * @param {string} sign signature of the given transaction
 * @param {Object} txn transaction object
 */
async function makeTxn(sign, txn){
    console.log(sign)
    sign = generateSignature(sign);
    console.log(sign)
    var data = await addData(sign, txn)
    if(data.error){
        return data
    }
    console.log(data)
    console.log(`https://wavesexplorer.com/tx/${data.id}`);
    return `https://testnet.wavesexplorer.com/tx/${data.id}`;
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
        var result = await broadcast(signedTransfer, nodeUrl);
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
    generateSignature,
    feedWavesAcc
}

