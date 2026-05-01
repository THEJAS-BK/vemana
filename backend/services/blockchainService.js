const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

let provider, signer, contract;

function init() {
  const deployedPath = path.join(__dirname, "../deployed.json");
  if (!fs.existsSync(deployedPath)) {
    throw new Error("deployed.json not found. Run: npm run deploy");
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

  provider = new ethers.JsonRpcProvider(
    process.env.HARDHAT_NETWORK_URL || "http://127.0.0.1:8545"
  );

  // Hardhat default account #0 private key
  signer = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  contract = new ethers.Contract(deployed.address, deployed.abi, signer);
  console.log("[Blockchain] Contract loaded at", deployed.address);
}

async function writeTransaction(sender, receiver, amount, timestamp) {
  if (!contract) init();
  const tx = await contract.addTransaction(
    sender,
    receiver,
    BigInt(amount),
    BigInt(timestamp)
  );
  const receipt = await tx.wait();
  const count = await contract.transactionCount();
  const txId = Number(count) - 1;
  return {
    txId,
    blockchainHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

async function readTransaction(id) {
  if (!contract) init();
  const tx = await contract.getTransaction(BigInt(id));
  return formatTx(tx);
}

async function readAllTransactions() {
  if (!contract) init();
  const txs = await contract.getAllTransactions();
  return txs.map(formatTx);
}

async function readRecentTransactions(limit) {
  if (!contract) init();
  const txs = await contract.getRecentTransactions(BigInt(limit));
  return txs.map(formatTx);
}

async function getTransactionCount() {
  if (!contract) init();
  const count = await contract.transactionCount();
  return Number(count);
}

function formatTx(tx) {
  return {
    id: Number(tx.id),
    sender: tx.sender,
    receiver: tx.receiver,
    amount: Number(tx.amount),
    timestamp: Number(tx.timestamp),
    blockHash: tx.blockHash,
    isFlagged: tx.isFlagged,
    reason: tx.reason,
  };
}

module.exports = {
  init,
  writeTransaction,
  readTransaction,
  readAllTransactions,
  readRecentTransactions,
  getTransactionCount,
};
