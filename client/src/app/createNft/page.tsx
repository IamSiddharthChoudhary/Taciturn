"use client";
import * as React from "react";
import { useState, ChangeEvent, useEffect } from "react";
import Web3Modal from "web3modal";
import Script from "next/script";
import { ethers } from "ethers";
import $u from "@/utils/$u";
import { useWallet } from "@/components/ui/walletContext";
const wc = require("../../../circuit/witness_calculator");
require("dotenv").config();

const providerOptions = {};

interface MetaData {
  name: string;
  image: string;
  genre: string;
  desc: string;
}

export default function page() {
  let [isConnected, setConnection] = useState(false);
  let [signer, setSigner] = useState("");
  let [image, setImage] = useState<File | null>(null);
  let [name, setName] = useState("");
  let [desc, setDesc] = useState("");
  let [genre, setGenre] = useState("");
  let { walletAddress, setWalletAddress } = useWallet();

  async function connectWallet() {
    try {
      let web3modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
      });

      const web3ModalInstance = await web3modal.connect();
      const web3ModalProvider = new ethers.BrowserProvider(web3ModalInstance);
      const signer = await web3ModalProvider.getSigner();
      const balance = await web3ModalProvider.getBalance(signer.address);
      const network = await web3ModalProvider.getNetwork();

      if (signer) {
        setConnection(true);
        setSigner(signer.address);
      }

      await setWalletAddress(signer.address);
      console.log(walletAddress);
    } catch (error) {
      console.log(error);
    }
  }

  function toHexString(decString: string) {
    const bigInt = BigInt(decString);

    let hexString = bigInt.toString(16);
    const padding = 64 - hexString.length;

    for (let i = 0; i < padding; i++) {
      hexString = "0" + hexString;
    }
    return "0x" + hexString;
  }

  async function createNFT() {
    const imageHash = await uploadImageToPinata();
    if (!imageHash) throw new Error("Ipfs hash not generated");

    const nftData = {
      name: name,
      image: imageHash,
      genre: genre,
      desc: desc,
    };

    console.log(nftData);
    const nftMetaData = JSON.stringify(nftData);
    const r = await uploadMetaDataToPinata(JSON.parse(nftMetaData));
    console.log(r);

    console.log(atob(await proofGeneration()));
  }

  async function proofGeneration() {
    const data = {
      address: signer.toString(),
    };
    const response = await fetch("http://localhost:4000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const contractAdd: string | undefined =
      process.env.VERIFIER_CONTRACT_ADDRESS;
    const privateKey: string | undefined = process.env.PRIVATE_KEY;
    let cA = "0";
    let pk = "0";

    if (privateKey != undefined) {
      pk = privateKey;
    }
    if (contractAdd != undefined) {
      cA = contractAdd;
    }

    const val = await response.json();
    const commitment = val[0];
    const add = val[1];
    const proof = val[2];
    const pubSig = val[3].map(toHexString);

    const pA = proof.pi_a.slice(0, 2).map(toHexString);
    const pB = proof.pi_b
      .slice(0, 2)
      .map((i: string[]) => i.map(toHexString))
      .map((a: any) => ([a[0], a[1]] = [a[1], a[0]]));
    const pC = proof.pi_c.slice(0, 2).map(toHexString);

    const proofElements = {
      commitment: commitment,
      nullifier: val[6],
      secret: val[5],
      proof: proof,
      pA: pA,
      pB: pB,
      pC: pC,
    };

    const proofEl = btoa(JSON.stringify(proofElements));

    return proofEl;
  }

  async function withdraw(val: any) {
    const abiFile = await fetch("/Groth16Verifier.json");
    const parsedAbiFile = await abiFile.json();
    const abi = parsedAbiFile.abi;

    const commitment = val[0];
    const add = val[1];
    const proof = val[2];
    const pubSig = val[3].map(toHexString);

    const pA = proof.pi_a.slice(0, 2).map(toHexString);
    const pB = proof.pi_b
      .slice(0, 2)
      .map((i: string[]) => i.map(toHexString))
      .map((a: any) => ([a[0], a[1]] = [a[1], a[0]]));
    const pC = proof.pi_c.slice(0, 2).map(toHexString);

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

    if (!process.env.PRIVATE_KEY) {
      throw new Error("Private key not present");
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    if (!process.env.VERIFIER_CONTRACT_ADDRESS) {
      throw new Error("Verifier address not present");
    }

    const contract = new ethers.Contract(
      process.env.VERIFIER_CONTRACT_ADDRESS,
      abi,
      provider
    );

    const tx = await contract.verifyProof(pA, pB, pC, pubSig);
    console.log(tx);
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDescChange = (e: ChangeEvent<HTMLInputElement>) => {
    const desc = e.target.value;
    if (desc) {
      setDesc(desc);
    }
  };

  const handleGenreChange = (e: ChangeEvent<HTMLInputElement>) => {
    const genre = e.target.value;
    if (genre) {
      setDesc(genre);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (name) {
      setName(name);
    }
  };

  async function uploadImageToPinata() {
    try {
      const formData = new FormData();
      if (image) formData.set("file", image);
      else {
        console.log("Image not found");
      }
      formData.set("name", name);
      const res = await fetch("/api/pinataImage", {
        method: "POST",
        body: formData,
      });
      return res.text();
    } catch (e) {
      console.log(e);
      alert("Trouble uploading file");
    }
  }

  async function uploadMetaDataToPinata(metadata: MetaData) {
    try {
      const formData = new FormData();
      formData.set("file", JSON.stringify(metadata));
      formData.set("name", name);

      const res = await fetch("/api/pinataMetadata", {
        method: "POST",
        body: formData,
      });

      return res.text();
    } catch (e) {
      console.log(e);
      alert("Trouble uploading metadata");
    }
  }

  return (
    <div>
      <button
        className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full"
        onClick={connectWallet}
      >
        Connect
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={createNFT}
      >
        CreateNFT
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={withdraw}
      >
        Buy
      </button>
      <input
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        aria-describedby="file_input_help"
        id="file_input"
        type="file"
        onChange={handleImageChange}
      ></input>
      <input
        type="text"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onChange={handleNameChange}
      />
      <input
        type="number"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onChange={handleGenreChange}
      />
      <input
        type="text"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onChange={handleDescChange}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={uploadImageToPinata}
      >
        Upload
      </button>
    </div>
  );
}
