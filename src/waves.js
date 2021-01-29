const {data, broadcast} = require('@waves/waves-transactions')

// Работаем в тестовой сети 
const nodeUrl = 'https://nodes-testnet.wavesnodes.com';

function saveWavesAccount(account) {
    const signedTranferViaPrivateKey = data({
        "chainId": 84,
        "data": [
        {
            "type": "string",
            "value": account,
            "key": "str"
        }
        ],
    }, {privateKey: 'A9zWLxY1hAa1sbkVM9PjWa77gXL5vDnDCVGggcv261hN'}
    )
    // console.log(signedTranferViaPrivateKey);

    // send tx to the node
    broadcast(signedTranferViaPrivateKey, nodeUrl).then(resp => console.log(resp)).catch(err => console.log(err));
}

async function getSeed(wAccount) {
    let response = await fetch(nodeUrl + '/seed/' + wAccount, {
        method: "GET",
        headers: headers
    });

    if (response.ok) { 
        let json = await response.json();
        return json.address;
    } else {
        alert("Ошибка HTTP: " + response.status);
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
        alert("Ошибка HTTP: " + response.status);
        // we need some kind of handler here
    }
}

function checkWavesAccount(account) {

}

module.exports = {
    createWavesAccount,
    saveWavesAccount,
    checkWavesAccount,
    getSeed
}

