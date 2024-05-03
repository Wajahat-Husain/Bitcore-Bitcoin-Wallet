// sending bitcoin
const axios = require("axios");
const bitcore = require("bitcore-lib");
const TESTNET = true;

const sendBitcoin = async (recieverAddress, amountToSend) => {
  try {
    const privateKey =
      "sender private key";
    const sourceAddress = "sender public key";
    const satoshiToSend = amountToSend * 100000000;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;

    const recommendedFee = await axios.get(
      "https://mempool.space/api/v1/fees/recommended"
    );
    console.log(recommendedFee.data);

    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;

    let inputs = [];
    let resp;
    try {
      resp = await axios({
        method: "GET",
        url: `https://blockstream.info/testnet/api/address/${sourceAddress}/utxo`,
      });
    } catch (error) {
      console.log(`err: ${err?.response?.data}`)
      return
    }
    const utxos = resp.data;

    console.log(utxos)
    for (const utxo of utxos) {
      let input = {};
      input.satoshis = utxo.value;
      input.script =
        bitcore.Script.buildPublicKeyHashOut(sourceAddress).toHex();
      input.address = sourceAddress;
      input.txId = utxo.txid;
      input.outputIndex = utxo.vout;
      totalAmountAvailable += utxo.value;
      inputCount += 1;
      inputs.push(input);
    }

    /**
     * In a bitcoin transaction, the inputs contribute 180 bytes each to the transaction,
     * while the output contributes 34 bytes each to the transaction. Then there is an extra 10 bytes you add or subtract
     * from the transaction as well.
     * */

    const transactionSize =
      inputCount * 180 + outputCount * 34 + 10 - inputCount;

    //   fee = 50000; // satoshi per byte
    fee = (transactionSize * recommendedFee.data.hourFee) / 3; // satoshi per byte
    if (TESTNET) {
      fee = transactionSize * 1; // 1 sat/byte is fine for testnet
    }
    if (totalAmountAvailable - satoshiToSend - fee < 0) {
      throw new Error("Balance is too low for this transaction");
    }

    console.log('inputs:', inputs)
    //Set transaction input
    transaction.from(inputs);

    // Set a minimum output amount to avoid dust
    const MIN_OUTPUT_AMOUNT = 546; // Minimum output amount in satoshis (typically 546 satoshis)

    // Add the recipient's address and amount as an output to the transaction
    // Ensure that the amount is above the dust threshold
    const amountToSendAdjusted = Math.max(satoshiToSend, MIN_OUTPUT_AMOUNT);
    console.log(satoshiToSend, amountToSendAdjusted)

    // set the recieving address and the amount to send
    transaction.to(recieverAddress, satoshiToSend);
    // transaction.to(recieverAddress, amountToSendAdjusted);

    // Set change address - Address to receive the left over funds after transfer
    transaction.change(sourceAddress);

    //manually set transaction fees: 20 satoshis per byte
    //transaction.fee(Math.round(fee));
    transaction.fee(fee);

    // Sign transaction with your private key
    transaction.sign(privateKey);

    console.log('transaction', transaction)
    // serialize Transactions
    const serializedTransaction = transaction.serialize();
    console.log('serializedTransaction:', serializedTransaction)

    // Send transaction
    const result = await axios({
      method: "POST",
      url: `https://blockstream.info/testnet/api/tx`,
      data: serializedTransaction,
    });
    return result.data;
  } catch (error) {
    console.log("err", error);
  }
};

async function sendTransaction() {
  const result = await sendBitcoin(
    "receiver public key",
    0.0001
  );
  console.log("Transaction details:", result);
}

sendTransaction();

