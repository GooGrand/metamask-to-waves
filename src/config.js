const headers = {
        'Accept': 'application/json',
        'X-API-Key': 'superb',
        'Content-Type': 'application/json'
    };
const nodeUrl  = "http://127.0.0.1:6869"
const nodeTestnetUrl = 'https://nodes-testnet.wavesnodes.com';
const distributorSeed = 'light vicious wild scrub silent poem bachelor gas entire actual artwork season bracket range ozone';
const distributorPrivateKey = '7UfmpFuiWfbEizr2JN3trWhmoBPfwx5WfEXxGD2XkNpT';
module.exports = {
    distributorSeed,
    distributorPrivateKey,
    headers,
    nodeTestnetUrl,
    nodeUrl
}
