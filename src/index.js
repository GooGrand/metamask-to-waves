import MetaMaskOnboarding from '@metamask/onboarding'
// eslint-disable-next-line camelcase
import { recoverTypedSignature, recoverPublicKey, extractPublicKey} from 'eth-sig-util'
import { ethers } from 'ethers'
import { toChecksumAddress, ecsign, ecrecover} from 'ethereumjs-util'
const base58 = require('base58-encode');
const keccak256 = require('keccak256')
import { hstBytecode, hstAbi, piggybankBytecode, piggybankAbi } from './constants.json'
const { binary, json } = require('@waves/marshall');
const {data} = require('@waves/waves-transactions');
const {generateLink} = require('./utils')

let instance

let ethersProvider
let hstFactory
let piggybankFactory



/*                 Importing waves libraries and neccessary functions           */
const {makeTxn, createWavesAccount, setupMirror, feedWavesAcc} = require('./waves');


const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost'
  ? 'http://localhost:9010'
  : undefined

const { isMetaMaskInstalled } = MetaMaskOnboarding

const accountsDiv = document.getElementById('accounts')

// Basic Actions Section
const onboardButton = document.getElementById('connectButton')

// Ethereum Signature Section
const getPublicKey = document.getElementById('getPublicKey')
const signTypedDataV3 = document.getElementById('signTypedDataV3')
const signTypedDataV3Result = document.getElementById('signTypedDataV3Result')

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

  }

  getPublicKey.onclick = async () => {
    if(!instance) {
      instance = createWavesAccount();
    }
    console.log(instance);
    var msg = {
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
      feeAssetId: null,
      senderPublicKey: instance.keyPair.publicKey,
      timestamp: 1614111284116,
    }

    try {
      var sign = await ethereum.request({
        method: 'personal_sign',
        params: [accounts[0], JSON.stringify(msg)],
      })
      var publicKey = extractPublicKey({"data":JSON.stringify(msg), "sig": sign});
      console.log(`Extracted key: ${publicKey}`);
      var result = await setupMirror(publicKey, instance.phrase, instance.address);
      while(getPublicKeyResult.firstChild)
        getPublicKeyResult.removeChild(getPublicKeyResult.firstChild);
      getPublicKeyResult.appendChild(generateLink(result, "Check new account"));
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
      chainId: 87,
      sender: instance.address,
      data: [
          {
              type: 'string',
              value: "value",
              key: "key"
          }
      ],
      fee: 1400000,
      version: 1,
      feeAssetId: null,
      senderPublicKey: instance.keyPair.publicKey,
      timestamp: Date.now(),
    }
  var bytes1 = binary.serializeTx(msgParams)
  console.log(bytes1);
  var msgBase64 = Buffer.from(bytes1).toString('base64')
  console.log("message    ");
  console.log(msgBase64);
    try {
      const from = accounts[0]
      const sign = await ethereum.request({
        method: 'personal_sign',
        params: [from, msgBase64],
      })
      console.log('signature when signed');
      console.log(sign);
      var result = await makeTxn(sign, msgParams);
      while(signTypedDataV3Result.firstChild)
        signTypedDataV3Result.removeChild(signTypedDataV3Result.firstChild);
      signTypedDataV3Result.appendChild(generateLink(result, "Check transaction"));
    } catch (err) {
      console.error(err)
      signTypedDataV3Result.innerHTML = `Error: ${err.message}`
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

  updateButtons()

  if (isMetaMaskInstalled()) {

    ethereum.autoRefreshOnNetworkChange = false

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
