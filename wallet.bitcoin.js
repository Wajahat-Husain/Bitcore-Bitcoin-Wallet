// Creating bitcoin wallet
const { PrivateKey } = require("bitcore-lib");
const { mainnet, testnet } = require("bitcore-lib/lib/networks");
const Mnemonic = require("bitcore-mnemonic");

const createWallet = (network = mainnet) => {
  const privateKey = new PrivateKey();
  const address = privateKey.toAddress(network);
  return {
    privateKey: privateKey.toString(),
    address: address.toString(),
  };
};

/**
A Hierarchical Deterministic (HD) wallet is the term used to describe a wallet which uses a seed to derive public and private keys
**/
const createHDWallet = (network = testnet) => {
  let passPhrase = new Mnemonic(Mnemonic.Words.SPANISH);
  let xpriv = passPhrase.toHDPrivateKey(passPhrase.toString(), network);

  return {
    xpub: xpriv.xpubkey,
    privateKey: xpriv.privateKey.toString(),
    address: xpriv.publicKey.toAddress().toString(),
    mnemonic: passPhrase.toString(),
  };
};

function recoverBitcoinWalletFromPrivateKey(privateKey, network = mainnet) {
  const privateKeyObj = new PrivateKey(privateKey);
  const address = privateKeyObj.toAddress(network);

  return {
    address: address.toString(),
    privateKey: privateKey,
  };
}

const recoverHDWalletFromMnemonic = (mnemonic, network = mainnet) => {
  // Generate HD private key from mnemonic
  const passPhrase = new Mnemonic(mnemonic);
  const xpriv = passPhrase.toHDPrivateKey(passPhrase.toString(), network);

  // Derive the address from the public key
  const address = xpriv.publicKey.toAddress().toString();

  return {
    xpub: xpriv.xpubkey,
    privateKey: xpriv.privateKey.toString(),
    address: address,
    mnemonic: mnemonic,
  };
};

console
  .log
  // createHDWallet()
  // createWallet()
  // recoverBitcoinWalletFromPrivateKey("Private Key")
  // recoverHDWalletFromMnemonic('Memonic string')
  ();
