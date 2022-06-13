const Block = require("./block");
const BlockChain = require("./blockchain");
const Transaction = require("./transaction");
const BlockchainNode = require("./blockchainNode");
const fetch = require("node-fetch");
const express = require("express");

const app = express();
app.use(express.json);

const arguments = process.argv;
let PORT = 8080;
if (arguments.length > 2) {
  PORT = arguments[2];
}

let transactions = [];
let allTransactions = [];
let nodes = [];
let genesisBlock = new Block();
let blockchain = new BlockChain(genesisBlock);

app.get("/resolve", (req, res) => {
  nodes.forEach((node) => {
    fetch(`${node.url}/blockchain`)
      .then((response) => response.json())
      .then((otherBlockchain) => {
        if (blockchain.blocks.length < otherBlockchain.blocks.length) {
          allTransactions.forEach((transactions) => {
            fetch(`${node.url}/transactions`, {
              method: "POST",
              headers: {
                "Content-type": "application-json",
              },
              body: JSON.stringify(transaction),
            })
              .then((response) => response.json())
              .then((result) => {
                fetch(`${node.url}/mine`)
                  .then((response) => response.json())
                  .then((_) => {
                    fetch(`${node.url}/blockchain`)
                      .then((response) => response.json())
                      .then((updatedBlockchain) => {
                        console.log(updatedBlockchain);
                        blockchain = updatedBlockchain;
                        res.json(blockchain);
                      });
                  });
              });
          });
        } else {
          res.json(blockchain);
        }
      });
  });
});

app.post("/nodex/register", (req, res) => {
  const urls = req.body;

  urls.forEach((url) => {
    const node = new BlockchainNode(url);
    nodes.push(node);
  });

  res.json(nodes);
});

app.post("/transactions", (req, res) => {
  const to = req.body.to;
  const from = req.body.from;
  const amount = req.body.amount;
  let transaction = new Transaction(from, to, amount);
  transactions.push(transaction);
  res.json(transactions);
});

app.get("/mine", (req, res) => {
  let block = blockchain.getNextBlock(transactions);
  blockchain.addBlock(block);
  transactions.forEach((transaction) => {
    allTransactions.push(transaction);
  });
  transactions = [];
  res.json(block);
});

app.get("/blockchain", (req, res) => {
  res.json(blockchain);
});

app.listen(PORT, () => {
  console.log("Server is running on PORT " + PORT);
});
