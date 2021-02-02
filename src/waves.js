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
function saveEthToWaves(account, seed) {
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
    broadcast(signedTranferViaPrivateKey, nodeTestnetUrl).then(res => {
        console.log(res);
        return res}).catch(err => console.log(err));
}

function feedWavesAcc(fromAcc, toAcc) {
    const signedTranferViaPrivateKey = transfer({
        chainId: 84,
        recipient: toAcc,
        amount: 100000
    }, fromAcc);

    broadcast(signedTranferViaPrivateKey, nodeTestnetUrl).then(res => {
        console.log(res);
        return res}).catch(err => console.log(err));
}

async function getSeed(wAccount) {
    let data;
    try {
        const response = await fetch(nodeUrl + '/addresses/seed/' + wAccount);
        data = await response.json();
    } catch (error) {
        console.log('Seeding error' + error);
    }
    return data;
}

// const generateSeed = async () => {
//     let data;
//     try {
//         const response = await fetch(nodeUrl + '/utils/seed');
//         data = await response.json();
//     } catch (error) {
//         console.log('Seeding error' + error);
//     }
//     return data;
// }


function generateSeed() {
    return fetch(nodeUrl + '/utils/seed')
      .then(response => response.json())
      .then(text => {
        return text.seed
      }).catch(err => {
        console.error('fetch failed', err);
      });
  }

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
    .then(result => result.status)
    .catch(e => console.log('Error when fetching transaction status - ' + e));
    return status == 'confirmed' // succeed
}

function createWavesAccount() {
    fetch(nodeUrl + '/addresses', {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'X-API-Key': 'superb',
            'Content-Type': 'application/json'
        }
    }).then(res => res.text())
      .then(response => {
          console.log('Response is ------ '+response);
          console.log(typeof(response));
          var json = JSON.parse(response);
          console.log('json ' + typeof(json));
          let res = json.address;
          console.log('res is --------- ' + res);
          return res;
        })
        .catch(err => {
        console.error('fetch failed', err);
      });
    }

// const test =  fetch(nodeUrl + '/addresses', {
//     method: 'POST',
//     headers: {
//         'Accept': 'application/json',
//         'X-API-Key': 'superb',
//         // 'Content-Type': 'application/json'
//     }
// });

// async function handleWavesIntegration(account){
//     // test.then(res => console.log(res))
//     var wavesAccount = await createWavesAccount();
//     window.setTimeout(console.log('waves address: ' + wavesAccount), 10000);
//     // console.log(nodeUrl + '/addresses');
//     const seed = await getSeed(wavesAccount);
//     // // const seed = await generateSeed();
//     window.setTimeout(console.log('seed: ' + seed), 10000);
//     // const feed = feedWavesAcc(distributorSeed, wavesAccount)
//     // console.log('feed: ' + feed);
//     // const jsonResult = saveEthToWaves(account, seed);
//     // console.log('result: ' + jsonResult);
//     // return jsonResult.id;
// }


function handleWavesIntegration(account){
    var wavesAddress;
    var wavesSeed;
    // quering new address
    fetch(nodeUrl + '/addresses', {
        method: "POST",
        headers
    }).then(response => response.json())
      .then(res => {
          //getting it's seed
          wavesAddress = res.address;
            fetch(nodeUrl + '/addresses/seed/'+ wavesAddress, {
                method: 'GET',
                headers
            }).then(result => result.json())
            .then(res => {
                wavesSeed = res.seed;
                var feed = feedWavesAcc(distributorSeed, wavesAddress);
                var result = saveEthToWaves(account, wavesSeed)
                console.log('feed status - ' + feed);
                console.log('saving status - ' + result);
            })
            .catch(e => console.log('Error in fetching seed: '+e))
        })
        .catch(err => {
        console.error('fetch failed', err);
      });
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

