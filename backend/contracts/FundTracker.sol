// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FundTracker {
    struct Transaction {
        uint256 id;
        string sender;
        string receiver;
        uint256 amount;
        uint256 timestamp;
        bytes32 blockHash;
        bool isFlagged;
        string reason;
    }

    Transaction[] private transactions;
    uint256 public transactionCount;

    event TransactionAdded(
        uint256 indexed id,
        string sender,
        string receiver,
        uint256 amount,
        uint256 timestamp
    );

    function addTransaction(
        string memory sender,
        string memory receiver,
        uint256 amount,
        uint256 timestamp
    ) public returns (uint256) {
        uint256 id = transactionCount;
        transactions.push(
            Transaction({
                id: id,
                sender: sender,
                receiver: receiver,
                amount: amount,
                timestamp: timestamp,
                blockHash: blockhash(block.number - 1),
                isFlagged: false,
                reason: ""
            })
        );
        transactionCount++;
        emit TransactionAdded(id, sender, receiver, amount, timestamp);
        return id;
    }

    function getTransaction(uint256 id) public view returns (Transaction memory) {
        require(id < transactionCount, "Transaction does not exist");
        return transactions[id];
    }

    function getAllTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }

    function getRecentTransactions(uint256 limit) public view returns (Transaction[] memory) {
        uint256 total = transactionCount;
        if (limit > total) limit = total;
        Transaction[] memory recent = new Transaction[](limit);
        for (uint256 i = 0; i < limit; i++) {
            recent[i] = transactions[total - limit + i];
        }
        return recent;
    }
}
