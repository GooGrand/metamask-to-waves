const {data, broadcast} = require('@waves/waves-transactions')

// use testnet node without trailing slash
const nodeUrl = 'https://nodes-testnet.wavesnodes.com';

function saveEthToWaves(account, seed) {
    const signedTranferViaPrivateKey = data({
        "data": [
        {
            "type": "string",
            "value": account,
            "key": "wavesAccount"
        }
        ],
    }, seed);
    // send tx to the node
    broadcast(signedTranferViaPrivateKey, nodeUrl).then(res => {
        console.log(res);
        return res}).catch(err => console.log(err));
}

async function getSeed(wAccount) {
    let response = await fetch(nodeUrl + '/seed/' + wAccount, {
        method: "GET",
        headers: headers
    });

    if (response.ok) { 
        let json = await response.json();
        return json.seed;
    } else {
        alert("Error HTTP: " + response.status);
        // we need some kind of handler here
    }
}

async function createWavesAccount() {
    let response = await fetch(nodeUrl + '/addresses', {
        method: "POST",
        headers: headers
    });

    if (response.ok) { 
        let json = await response.json();
        return json.address;
    } else {
        alert("Error HTTP: " + response.status);
        // we need some kind of handler here
    }
}

function handleWavesIntegration(account){
    const wavesAccount = createWavesAccount();
    const seed = getSeed(wavesAccount);
    const jsonResult = saveEthToWaves(account, seed);
    return jsonResult.id;
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

