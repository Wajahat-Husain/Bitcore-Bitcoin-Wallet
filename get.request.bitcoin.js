const axios = require('axios');
const baseUrl = "https://blockstream.info/testnet/api/"
// Bitcoin: https://blockstream.info/api/
// Bitcoin Testnet: https://blockstream.info/testnet/api/

async function checkBalance(address) {
    try {
        const response = await axios.get(`${baseUrl}/address/${address}/utxo`);
        const utxos = response.data;
        let balance = 0;
        utxos.forEach(utxo => {
            balance += utxo.value;
        });
        return balance / 100000000;
    } catch (err) {
        console.log("err:", err?.response?.data)
    }
}

async function getLatestBlockNumber() {
    try {
        const response = await axios.get(`${baseUrl}/blocks/tip/height`);
        return response.data;
    } catch (err) {
        console.log("err:", err?.response?.data)
    }
}

async function checkDetails(){
    let walletAddress = "Bitcoin wallet public key"
    let balance = await checkBalance(walletAddress)
    console.log(`Wallet address ${walletAddress} with balance: ${balance}`)
    console.log(`latest block number:  ${await getLatestBlockNumber()}`)
}

checkDetails()