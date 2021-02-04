const {invokeScript, data, transfer, broadcast} = require('@waves/waves-transactions');

// import Signer from '@waves/signer';
// import Provider from '@waves.exchange/provider-web';

const nodeTestnetUrl = 'https://nodes-testnet.wavesnodes.com';
const nodeUrl = "http://127.0.0.1:6869";
const headers = {
    'Accept': 'application/json',
    'X-API-Key': 'superb',
    'Content-Type': 'application/json'
}
const sleep = m => new Promise(r => setTimeout(r, m));
const distributorSeed = 'action shy collect wave flip trust elegant awesome cancel minute salmon vanish airport inside isolate';

async function saveEthToWaves(account, seed, wavesAcc) {
    // const txn = {
    //     type: 12,
    //     sender: wavesAcc,
    //     data: [
    //         {
    //             type: "string",
    //             value: account,
    //             key: "wavesAccount"
    //         }
    //         ],
    // }
    const signedTransfer = await data({
        chainId: 84,
        sender: wavesAcc,
        dApp: 'Eev6kfSV8P8MmzX16uRUSeFQzkEoM8cUS6hELdsSkkFu',
        data: [
        {
            type: "string",
            value: account,
            key: "wavesAccount"
        }
        ],
        seed
    });

    // var signedTxn = await fetch(nodeUrl+'/transactions/sign', {
    //     method: "POST",
    //     headers,
    //     body: JSON.stringify(txn)
    // })
    // console.log(signedTxn);
    console.log('signed data');
    console.log(signedTranfer);
    // send tx to the node
    try {
        var result = await broadcast(signedTransfer, nodeUrl, {
            headers,
            credentials: 'omit'
        });
        // var result = await fetch(nodeUrl +'/transactions/broadcast', {
        //     method: "POST",
        //     headers,
        //     body: signedTxn
        // })
        return result;
    } catch(e) {
        console.log('Saving data acc error: ' + e);
    }
}

async function feedWavesAcc(fromAcc, toAcc) {
    // const txn = {
    //     type: 4,
    //     sender: fromAcc,
    //     amount: 100000,
    //     recipient: toAcc
    // }
    const signedTransfer = await transfer({
        chainId: 84,
        recipient: toAcc,
        amount: 100000
    }, fromAcc);
    // var signedTxn = await fetch(nodeUrl+'/transactions/sign', {
    //     method: "POST",
    //     headers,
    //     body: JSON.stringify(txn)
    // })
    // console.log(signedTxn);
    try {
        var result = await broadcast(signedTransfer, nodeUrl);
        // var result = await fetch(nodeUrl +'/transactions/broadcast', {
        //     method: "POST",
        //     headers,
        //     body: signedTxn
        // })
        return result;
    } catch(e) {
        console.log('Feeding waves acc error: ' + e);
    }
}

async function getSeed(wAccount) {
    try {
        const response = await fetch(nodeUrl + '/addresses/seed/' + wAccount, {
            headers
        });
        var data = await response.json();
        var seed = await data.seed;
        return seed
    } catch (error) {
        console.log('Seeding error' + error);
    }
}

async function checkTransaction(txnId){
    try{
        var status = await fetch(nodeUrl + '/transactions/status?ids='+txnId, {
            // method: "POST",
            headers,
            // body: {
            //     ids: [
            //         txnId
            //     ]
            // }
        })
        var result = await status.json();
        return result;
    } catch(e) {
        console.log('Checking txn error - ' + e);
    }
}

async function createWavesAccount() {
    try{
        var result = await fetch(nodeUrl + '/addresses', {
            method: "POST",
            headers
        });
        var result = await result.json();
        var address = await result.address;
        return address;
    } catch(e) {
        console.log('Creating account error: ' + e);
    }
}

async function checkBalance(wAccount) {
    try{
        var result = await fetch(nodeTestnetUrl + '/addresses/balance/'+wAccount, {
            // headers
        });
        var result = await result.json();
        return result;
    } catch(e) {
        console.log('Checking balance error: ');
        console.log(e);
    }
}

async function handleWavesIntegration(account){
    if(!account) return;
    var wavesAccount = await createWavesAccount();
    console.log('waves address: ' + wavesAccount);
    const seed = await getSeed(wavesAccount);
    console.log('seed: ' + seed);
    console.log('sending form seed - '+distributorSeed + '- to waves acc - ' + wavesAccount);
    const feed = await feedWavesAcc(distributorSeed, wavesAccount)
    console.log('feed: ');
    console.log(feed);
    var succeedTxn;
    // console.log(await checkTransaction(feed.id));
    // while(!succeedTxn) {
    //     succeedTxn = await checkTransaction(feed.id);
    //     console.log('Txn status - ' + succeedTxn);
    //     await sleep(2000);
    // }
    var balance = await checkBalance(wavesAccount);
    console.log(balance);
    console.log('Saving data - '+account+' - to account seed - '+seed);
    // we gotta wait for 10 sec to transaction result
    await sleep(20000);
    balance = await checkBalance(wavesAccount);
    console.log(balance);
    const jsonResult = await saveEthToWaves(account, seed, wavesAccount);
    console.log('result of the creation: ');
    console.log(jsonResult);
    // return jsonResult.id;
}

function checkWavesAccount(account) {

}

module.exports = {
    createWavesAccount,
    saveEthToWaves,
    checkWavesAccount,
    getSeed,
    handleWavesIntegration
}

