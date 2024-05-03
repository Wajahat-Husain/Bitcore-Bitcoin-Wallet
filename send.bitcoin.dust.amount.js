// testing bitcoin dust amount
const axios = require("axios");
const bitcore = require("bitcore-lib");
const TESTNET = true;

// Function to create and broadcast a transaction that consolidates dust
async function consolidateDust() {
  try {
    const privateKey = new bitcore.PrivateKey(
      "Sender private key"
    );
      let fee = 0;
      let inputCount = 0;
      let outputCount = 2;

    const recommendedFee = await axios.get(
      "https://mempool.space/api/v1/fees/recommended"
    );

    // Add a single output to the transaction, sending all funds to an address you control
    const sourceAddress = "Public key";
      let totalAmountAvailable = 0;
    let utxos;
    try {
      //   let input = bitcore.Script.buildPublicKeyHashOut(sourceAddress).toHex();
      //   console.log(input)
      utxos = await axios({
        method: "GET",
        url: `https://blockstream.info/testnet/api/address/${sourceAddress}/utxo`,
      });
    } catch (err) {
      console.log(`err: ${err}`);
      return;
    }

    // Create a new transaction
    const tx = new bitcore.Transaction();
    utxos.data.forEach((utxo) => {
      tx.from({
        txId: utxo.txid,
        outputIndex: utxo.vout,
        script: bitcore.Script.buildPublicKeyHashOut(sourceAddress).toHex(),
        satoshis: utxo.value,
        address: sourceAddress,
      });
        totalAmountAvailable += utxo.value;
        inputCount += 1;
    });

    // Calculate the total value of dust UTXOs
    const totalDustValue = utxos.data.reduce(
      (total, utxo) => total + utxo.value,
      0
    );

    const transactionSize =
      inputCount * 180 + outputCount * 34 + 10 - inputCount;

    //   fee = 50000; // satoshi per byte
    fee = (transactionSize * recommendedFee.data.hourFee) / 3; // satoshi per byte
    if (TESTNET) {
      fee = transactionSize * 1; // 1 sat/byte is fine for testnet
    }
      if (totalAmountAvailable - totalDustValue - fee < 0) {
      throw new Error("Balance is too low for this transaction");
    }

    // Add a single output to the transaction, sending all funds to an address you control
    tx.to(sourceAddress, totalDustValue);

    transaction.fee(fee);

    // Sign the transaction
    tx.sign(privateKey);

    // Build the transaction
    const result = await axios({
      method: "POST",
      url: `https://blockstream.info/testnet/api/tx`,
      data: tx.toString(),
    });
    return result.data;
  } catch (error) {
    console.error("Error consolidating dust:", error);
  }
}

async function sendTransaction() {
  const result = await consolidateDust();
  console.log("Transaction details:", result);
}

sendTransaction();

// try {
//   let network = "BTCTEST";
//   let balance = await axios({
//     method: "GET",
//     url: `https://chain.so/api/v3/balance/${network}/${sourceAddress}`,
//   });
//   console.log(balance);
// } catch (error) {
//   console.log(error.response.data);
// }
