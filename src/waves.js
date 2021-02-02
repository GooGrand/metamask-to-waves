const {data, transfer, broadcast} = require('@waves/waves-transactions')

// use testnet node without trailing slash
const nodeTestnetUrl = 'https://nodes-testnet.wavesnodes.com';
const nodeUrl = "http://127.0.0.1:6869";
// X-API-Key: 14ZCYEiyXyJbHdy4enTtGEpqssh6GLm891PDyZVqxaCB, 
const headers = {
    'Accept': 'application/json',
    'X-API-Key': 'superb',
    'Content-Type': 'application/json'
}
const distributorSeed = 'action shy collect wave flip trust elegant awesome cancel minute salmon vanish airport inside isolate';
async function saveEthToWaves(account, seed) {
    const signedTranferViaPrivateKey = data({
        chainId: 84,
        data: [
        {
            type: "string",
            value: account,
            key: "wavesAccount"
        }
        ],
    }, seed);
    // send tx to the node
    try {
        var sendTnx = await broadcast(signedTranferViaPrivateKey, nodeTestnetUrl);
        var result = await sendTnx.json();
        return result;
    } catch(e) {
        console.log('Feeding waves acc error: ' + e);
}

async function feedWavesAcc(fromAcc, toAcc) {
    const signedTranferViaPrivateKey = transfer({
        chainId: 84,
        recipient: toAcc,
        amount: 100000
    }, fromAcc);
    try {
        var sendTnx = await broadcast(signedTranferViaPrivateKey, nodeTestnetUrl);
        var result = await sendTnx.json();
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

// function generateSeed() {
//     return fetch(nodeUrl + '/utils/seed')
//       .then(response => response.json())
//       .then(text => {
//         return text.seed
//       }).catch(err => {
//         console.error('fetch failed', err);
//       });
//   }

// async function createWavesAccount() {
//     let res = fetch(nodeUrl + '/addresses', {
//         method: "POST",
//         headers: headers
//     }).then(res => res.json()).catch(e => console.log("Error of creation: " + e));
//     return res;
// }

function checkTransaction(txnId){
    var status = fetch(nodeUrl + '/transactions/status?id='+ txnId)
    .then(res => res.json())
    .then(result => result.applicationStatus)
    .catch(e => console.log('Error when fetching transaction status - ' + e));
    return status == 'succeed'
}

async function createWavesAccount() {
    try{
        var result = await fetch(nodeUrl + '/addresses', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'X-API-Key': 'superb',
                'Content-Type': 'application/json'
            }
        });
        var result = await result.json();
        var address = await result.address;
        return address;
    } catch(e) {
        console.log('Creating account error: ' + e);
    }
}

async function handleWavesIntegration(account){
    var wavesAccount = await createWavesAccount();
    console.log('waves address: ' + wavesAccount);
    const seed = await getSeed(wavesAccount);
    console.log('seed: ' + seed);
    const feed = await feedWavesAcc(distributorSeed, wavesAccount)
    console.log('feed: ' + feed);
    var succeedTxn;
    while(!succeedTxn) {
        succeedTxn = checkTransaction(feed.id);
        console.log('Txn status - ' + succeedTxn);
    }
    const jsonResult = await saveEthToWaves(account, seed);
    console.log('result of the creation: ' + jsonResult);
    // return jsonResult.id;
}


// async function handleWavesIntegration(account){
//     if(!account) return;
//     var wavesAddress;
//     var wavesSeed;
//     // quering new address
//     fetch(nodeUrl + '/addresses', {
//         method: "POST",
//         headers
//     }).then(response => response.json())
//       .then(res => {
//           //getting it's seed
//           wavesAddress = res.address;
//             fetch(nodeUrl + '/addresses/seed/'+ wavesAddress, {
//                 method: 'GET',
//                 headers
//             }).then(result => result.json())
//             .then(res => {
//                 wavesSeed = res.seed;
//                 var feed = feedWavesAcc(distributorSeed, wavesAddress);
//                 var feedSucceed;
//                 if(feed.id) {
//                 while(!feedSucceed){
//                     feedSucceed = checkTransaction(feed.id);
//                     console.log('Txn status - '+feedSucceed);
//                 }
//                 var result = saveEthToWaves(account, wavesSeed)
//                 console.log('feed status - ' + feed);
//                 console.log('saving status - ' + result);
//             }
//             })
//             .catch(e => console.log('Error in fetching seed: '+e))
//         })
//         .catch(err => {
//         console.error('fetch failed', err);
//       });
// }


function checkWavesAccount(account) {

}

module.exports = {
    createWavesAccount,
    saveEthToWaves,
    checkWavesAccount,
    getSeed,
    handleWavesIntegration
}

