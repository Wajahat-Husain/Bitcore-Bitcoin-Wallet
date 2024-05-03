const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const fs = require('fs');
const axios = require('axios');

const ECPair = ECPairFactory(ecc);
const network = bitcoin.networks.testnet; // Otherwise, bitcoin = mainnet and regnet = local


const baseUrl = "https://blockstream.info/testnet/api/"
// Bitcoin: https://blockstream.info/api/
// Bitcoin Testnet: https://blockstream.info/testnet/api/

async function createP2PKHwallet() {
    try {
        const keyPair = ECPair.makeRandom({ network: network });
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: network,
        });
        const privateKey = keyPair.toWIF()

        console.log(`| Public Address | ${address} |`)
        console.log(`| Private Key | ${privateKey} |`)

        const wallet = {
            address: address,
            privateKey: privateKey
        };

        const walletJSON = JSON.stringify(wallet, null, 4);

        fs.writeFileSync('wallet.json', walletJSON);

        console.log(`Wallet created and saved to wallet.json`);

        // Check balance of the generated address
        let balance = await checkBalance(address)
        console.log("Balance:", balance)

        let BlockNumber = await getLatestBlockNumber()
        console.log("BlockNumber:", BlockNumber)

    } catch (error) {
        console.log(error)
    }
}

async function checkBalance(address) {
    try {      
        const response = await axios.get(`${baseUrl}/address/${address}/utxo`);
        const utxos = response.data;
        console.log(await Promise.all(utxos))
        let balance = 0;
        utxos.forEach(utxo => {
            balance += utxo.value;
        });
        return balance;
    } catch (err) {
        console.log("err:", err?.response?.data)
    }
}

async function getLatestBlockNumber() {
    try{
        const response = await axios.get(`${baseUrl}/blocks/tip/height`);
        return response.data;
    }catch(err){
        console.log("err:", err?.response?.data)
    }
}

async function broadcastTransaction(txHex) {
    try {
        const response = await axios.post(`${baseUrl}/tx`, txHex);
        return response.data;
    } catch (err) {
        console.log("err:", err?.response?.data)
    }
}

createP2PKHwallet();