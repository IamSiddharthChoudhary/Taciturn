const express = require("express");
const app = express();
const snarkjs = require("snarkjs");
const ethers = require("ethers");
const fs = require("fs");
const wc = require("./circuit/witness_calculator");
const cors = require("cors");
const axios = require("axios");
const { gql, request } = require("graphql-request");

const port = process.env.PORT || 4000;

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "",
//   password: "",
//   database: "",
// });

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`Server running at 'http://localhost:${port}'`);
});

app.post("/", async (req, res) => {
  const secret = await ethers.randomBytes(32);
  const nullifier = await ethers.randomBytes(32);

  const input = {
    secret: fromBN256toBin(secret).split(""),
    nullifier: fromBN256toBin(nullifier).split(""),
  };

  const result = fs.readFileSync("./circuit/mint.wasm");
  const mintWC = await wc(result);
  const r = await mintWC.calculateWitness(input);

  const commitment = r[1];
  const nullifierHash = r[2];

  let add = req.body.address;

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      commitment: commitment,
      recipient: add,
      secret: input.secret,
      nullifier: input.nullifier,
    },
    "./circuit/check.wasm",
    "./circuit/circuit_final.zkey"
  );

  // const vKey = JSON.parse(fs.readFileSync("./verification_key.json"));
  // const check = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  // const query = `insert into commitmentRec values(${commitment})`;

  res
    .status(200)
    .send([
      commitment.toString(),
      add,
      proof,
      publicSignals,
      secret.toString(),
      nullifier.toString(),
      nullifierHash.toString(),
    ]);
});

app.get("/graph", async (req, res) => {});

function fromBN256toBin(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join("");
}
