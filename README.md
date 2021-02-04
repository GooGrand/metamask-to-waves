# MetaMask-To-Waves
This is a version of metamask dapp test application, cloned from the official repo (https://github.com/BboyAkers/simple-dapp-tutorial/tree/master/finished) and updated with some methods to interact with waves node.
To check the methods - look closely to the /src/waves.js file.

 Original version hosted [right here](https://metamask.github.io/test-dapp/).

## Preparations
To use this dapp you need to run waves node. Look through tutorial to install node - https://docs.waves.tech/en/waves-node/how-to-install-a-node/how-to-install-a-node

To run node you will need config file (waves.conf in /waves_node directory)
You need to specify the password of your wallet, seed
and [generate rest api-key] (https://docs.waves.tech/en/waves-node/node-api/api-key#set-api-key)

## Usage

To run this application, you can use this shell command:

```shell
npm run start
```
You will be able to open website on your localhost and watch for actions in browser console.