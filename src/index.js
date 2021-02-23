import MetaMaskOnboarding from '@metamask/onboarding'
// eslint-disable-next-line camelcase
import { recoverTypedSignature, recoverPublicKey, TypedDataUtils} from 'eth-sig-util'
import { ethers } from 'ethers'
import { toChecksumAddress } from 'ethereumjs-util'
import { hstBytecode, hstAbi, piggybankBytecode, piggybankAbi } from './constants.json'
import { address } from '@waves/ts-lib-crypto'
const {broadcast, data} = require('@waves/waves-transactions');

let instance

let ethersProvider
let hstFactory
let piggybankFactory

/*                 Importing waves libraries and neccessary functions           */ 
const {makeTxn, createWavesAccount, setupMirror} = require('./waves');


const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost'
  ? 'http://localhost:9010'
  : undefined

const { isMetaMaskInstalled } = MetaMaskOnboarding

// Dapp Status Section
const networkDiv = document.getElementById('network')
const chainIdDiv = document.getElementById('chainId')
const accountsDiv = document.getElementById('accounts')

// Basic Actions Section
const onboardButton = document.getElementById('connectButton')
const getAccountsButton = document.getElementById('getAccounts')
const getAccountsResults = document.getElementById('getAccountsResult')

// Ethereum Signature Section
const getPublicKey = document.getElementById('getPublicKey')
const signTypedDataV3 = document.getElementById('signTypedDataV3')
const signTypedDataV3Result = document.getElementById('signTypedDataV3Result')
const signTypedDataV3Verify = document.getElementById('signTypedDataV3Verify')
const signTypedDataV3VerifyResult = document.getElementById('signTypedDataV3VerifyResult')

const initialize = async () => {
  try {
    // We must specify the network as 'any' for ethers to allow network changes
    ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any')
    hstFactory = new ethers.ContractFactory(
      hstAbi,
      hstBytecode,
      ethersProvider.getSigner(),
    )
    piggybankFactory = new ethers.ContractFactory(
      piggybankAbi,
      piggybankBytecode,
      ethersProvider.getSigner(),
    )
  } catch (error) {
    console.error(error)
  }

  let onboarding
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin })
  } catch (error) {
    console.error(error)
  }

  let accounts
  let accountButtonsInitialized = false

  const accountButtons = [
    getPublicKey,
    signTypedDataV3,
    signTypedDataV3Verify,
  ]

  const isMetaMaskConnected = () => accounts && accounts.length > 0

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    onboarding.startOnboarding()
  }

  const onClickConnect = async () => {
    try {
      const newAccounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      handleNewAccounts(newAccounts)
    } catch (error) {
      console.error(error)
    }
  }


  const updateButtons = () => {
    const accountButtonsDisabled = !isMetaMaskInstalled() || !isMetaMaskConnected()
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true
      }
    } else {
      signTypedDataV3.disabled = false
      getPublicKey.disabled = false

    }

    if (!isMetaMaskInstalled()) {
      onboardButton.innerText = 'Click here to install MetaMask!'
      onboardButton.onclick = onClickInstall
      onboardButton.disabled = false
    } else if (isMetaMaskConnected()) {
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
      if (onboarding) {
        onboarding.stopOnboarding()
      }
    } else {
      onboardButton.innerText = 'Connect'
      onboardButton.onclick = onClickConnect
      onboardButton.disabled = false
    }
  }

  const initializeAccountButtons = () => {

    if (accountButtonsInitialized) {
      return
    }
    accountButtonsInitialized = true

    getAccountsButton.onclick = async () => {
      try {
        const _accounts = await ethereum.request({
          method: 'eth_accounts',
        })
        getAccountsResults.innerHTML = _accounts[0] || 'Not able to get accounts'
      } catch (err) {
        console.error(err)
        getAccountsResults.innerHTML = `Error: ${err.message}`
      }
    }
  
  }

  getPublicKey.onclick = async () => {
    const Web3 = require('web3');
  var web3 = new Web3(Web3.givenProvider);
  var privateKey = '0x48250bd971c206df96654f5fb4b34f87e8a20a7783e972771a3296a1ee42195d'
  // var public = 'MAy6HywubTu9gb4oWPcwH0VCpjKv2H35NBbM7Oz0n04='
  var msg = '{"type":12,"chainId":84,"sender":"3N8EUkLahvhWx7Nk3rcgxLDi7CyZT2S5rfQ","data":[{"type":"string","value":"value","key":"key"}],"fee":1400000,"senderPublicKey":"GM9Jf76Y6QkXGoVDTWsQx7VKnDY4UFMwcVYxhdqu1NJ1","timestamp":1614057261189}'
  var sign = '0x7acfad37588f249a32d6f839831a45dad2e3d90e6e3228bd7a52b8ce35e89b202d7b6e8d18f7cb5c93e7c51e1cde181200ec8fbe4a6d7e872583a5991b2ebd611c'
  var account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log(account);
  var address = await web3.eth.personal.ecRecover(msg, sign)
  console.log(address);
    instance = createWavesAccount();
    console.log(instance);
    try {
      var sign = await ethereum.request({
        method: 'personal_sign',
        params: [msg, accounts[0]],
      })
      var message = TypedDataUtils.sign(msg, false);
      var publicKey = recoverPublicKey(message, sign);
      console.log(publicKey);
      getPublicKeyResult.innerText = publicKey;
      var result = await setupMirror(publicKey, instance.phrase, instance.address);
    } catch (error) {
      getPublicKeyResult.innerText = `Error: ${error.message}`
    }
  }

  /**
   * Sign Typed Data Version 3 Test
   */
  signTypedDataV3.onclick = async () => {
    const msgParams = {
      type: 12,
      chainId: 84,
      sender: instance.address,
      data: [
          {
              type: 'string',
              value: "value", 
              key: "key"
          }
      ],
      fee: 1400000,
      senderPublicKey: instance.keyPair.publicKey,
      timestamp: Date.now(),
      domain: 'sfasfafs'
  }
  
  console.log(msgParams);
    try {
      const from = accounts[0]
      const sign = await ethereum.request({
        method: 'personal_sign',
        params: [JSON.stringify(msgParams), from],
      })
      console.log(sign);
      console.log(JSON.stringify(msgParams))
      var result = await makeTxn(sign, msgParams, instance.phrase);
      signTypedDataV3Result.innerHTML = sign
      signTypedDataV3Verify.disabled = false
    } catch (err) {
      console.error(err)
      signTypedDataV3Result.innerHTML = `Error: ${err.message}`
    }
  }

  /**
   * Sign Typed Data V3 Verification
   */
  signTypedDataV3Verify.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10)
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId

    const msgParams = {
      type: 12,
      chainId: 84,
      sender: instance.address,
      data: [
          {
              type: 'string',
              value: "value", 
              key: "key"
          }
      ],
      fee: 1400000,
      senderPublicKey: instance.keyPair.publicKey,
      timestamp: Date.now(),
      domain: 'asdsad'
  }
    try {
      const from = accounts[0]
      const sign = signTypedDataV3Result.innerHTML
      const recoveredAddr = await recoverTypedSignature({
        'data': msgParams,
        'sig': sign,
      })
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`)
        signTypedDataV3VerifyResult.innerHTML = recoveredAddr
      } else {
        console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`)
      }
    } catch (err) {
      console.error(err)
      signTypedDataV3VerifyResult.innerHTML = `Error: ${err.message}`
    }
  }


  
  function handleNewAccounts (newAccounts) {
    accounts = newAccounts
    accountsDiv.innerHTML = accounts
    if (isMetaMaskConnected()) {
      initializeAccountButtons()
    }
    updateButtons()
  }

  function handleNewChain (chainId) {
    chainIdDiv.innerHTML = chainId
  }

  function handleNewNetwork (networkId) {
    networkDiv.innerHTML = networkId
  }

  async function getNetworkAndChainId () {
    try {
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      })
      handleNewChain(chainId)

      const networkId = await ethereum.request({
        method: 'net_version',
      })
      handleNewNetwork(networkId)
    } catch (err) {
      console.error(err)
    }
  }

  updateButtons()

  if (isMetaMaskInstalled()) {

    ethereum.autoRefreshOnNetworkChange = false
    getNetworkAndChainId()

    ethereum.on('chainChanged', handleNewChain)
    ethereum.on('networkChanged', handleNewNetwork)
    ethereum.on('accountsChanged', handleNewAccounts)

    try {
      const newAccounts = await ethereum.request({
        method: 'eth_accounts',
      })
      handleNewAccounts(newAccounts)
    } catch (err) {
      console.error('Error on init when getting accounts', err)
    }
  }
}

window.addEventListener('DOMContentLoaded', initialize)

// utils

function getPermissionsDisplayString (permissionsArray) {
  if (permissionsArray.length === 0) {
    return 'No permissions found.'
  }
  const permissionNames = permissionsArray.map((perm) => perm.parentCapability)
  return permissionNames.reduce((acc, name) => `${acc}${name}, `, '').replace(/, $/u, '')
}

function stringifiableToHex (value) {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)))
}
