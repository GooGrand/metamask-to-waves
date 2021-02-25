const headers = {
        'Accept': 'application/json',
        'X-API-Key': 'superb',
        'Content-Type': 'application/json'
    };
// testnet https://nodes-testnet.wavesnodes.com --- chainId 84
// stagenet https://nodes-stagenet.wavesnodes.com
// mainnet https://nodes.wavesnodes.com
const nodeUrl = 'https://nodes-testnet.wavesnodes.com';
const distributorSeed = 'wire proof toe clerk convince mother anchor camera fish depend silk quick keen boil area';
const distributorPrivateKey = 'FZts9tBXLM7dybzcaTXsBtdzTgJLDiPpGi7Awuq2Jmei';
const dappAddress = '3NCUH4Z4WnFqmxZ27uSkiunPeupYQWU2iDT';
module.exports = {
    distributorSeed,
    distributorPrivateKey,
    headers,
    nodeUrl,
    dappAddress
}
