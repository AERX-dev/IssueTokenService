require('dotenv').config();
console.log(process.env);
const nearAPI = require("near-api-js");
const express = require('express');
const app = express();
const signerAccountId = "innazhtest.testnet"; //acc with all the tokens
const contractName = "aerx-token.innazh.testnet";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const keyStore = new nearAPI.keyStores.InMemoryKeyStore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    express.json()
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/token', function (req, res) {
    console.log(req.body);
    console.log(req.body.accountId);
    // creates a public / private key pair using the provided private key
    const keyPair = nearAPI.KeyPair.fromString(PRIVATE_KEY);
    // adds the keyPair you created to keyStore
    keyStore.setKey("default", signerAccountId, keyPair);

    let f = async () => {
        let result = await runMethod(req);
        if (result) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({result:result}));
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({result:result}));
        }
        res.end();
    }
    f();
});

app.listen(process.env.PORT); //6 - listen for any incoming requests

console.log(`Node.js web server at port ${process.env.PORT} is running..`)

async function runMethod(req) {
    // Initializing connection to the NEAR node.
    const near = await nearAPI.connect({
        deps: {
            keyStore,
        },
        contractName: contractName,
        nodeUrl: "https://rpc.testnet.near.org",
        networkId: "default"
    });

    const account = await near.account(signerAccountId);

    //Depricated but works, gotta add yocto
    const functionCallResponse = await account.functionCall(
        methodName = 'ft_transfer',
        args = { receiver_id: req.body.accountId, amount: '111' },
        gas = nearAPI.DEFAULT_FUNCTION_CALL_GAS,
        attachedDeposit = 1,
    );

    nearAPI.providers.getTransactionLastResult(
        functionCallResponse
    );
    let result = false;
    if (functionCallResponse.transaction_outcome.outcome.status.SuccessReceiptId) {
        result = true;
    }
    else console.log(functionCallResponse.transaction_outcome.outcome.logs);
    return result;
}