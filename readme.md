# Taciturn - A Zero-Knowledge Decentralized NFT Marketplace

Taciturn is a decentralized marketplace that allows users to create, buy, and sell NFTs without revealing their account addresses, leveraging the power of zero-knowledge proofs. This innovative approach ensures privacy and anonymity in NFT transactions while maintaining the integrity and security of the marketplace.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
  - [zkNFT Creation](#zknft-creation)
  - [Buying and Selling NFTs](#buying-and-selling-nfts)
  - [Claiming the Sale Price](#claiming-the-sale-price)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contracts](#smart-contracts)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Taciturn enables a privacy-preserving way to engage in the world of NFTs. With the integration of zero-knowledge proofs, users can buy, sell, and create NFTs without revealing sensitive information like their account addresses.

## Features

- **Anonymity**: Zero-knowledge proofs ensure that users can transact without revealing their identity.
- **Decentralization**: The platform runs on blockchain technology, ensuring that there is no central authority.
- **NFT Marketplace**: Users can create, list, buy, and sell NFTs.
- **Claim Mechanism**: NFT creators can claim their sale proceeds using zero-knowledge proofs after their NFT is sold.

## Tech Stack

Taciturn is built using the following technologies:

- **Circom**: For generating zero-knowledge proofs.
- **snarkjs**: For proof generation and verification.
- **Solidity**: Smart contracts to manage NFTs and marketplace logic.
- **TypeScript**: Used for both frontend and backend development.
- **JavaScript**: Client-side scripting.
- **Express**: Backend framework for API management.
- **Next.js**: Frontend framework for the web app.
- **Hardhat**: Development environment for compiling and deploying smart contracts.
- **IPFS**: For decentralized storage of NFT metadata.
- **The Graph**: For indexing blockchain data and querying it efficiently.
- **Node.js**: Server-side environment.

## How It Works

### zkNFT Creation

When a user creates an NFT on Taciturn, a **commitment** is generated using zero-knowledge techniques. Instead of associating the NFT with the user's address, it is linked with this cryptographic commitment, preserving the user's anonymity.

### Buying and Selling NFTs

NFTs are listed for sale on the marketplace. Buyers can purchase NFTs without needing to know the creator’s identity. The transaction is recorded on-chain, and the NFT is transferred anonymously.

### Claiming the Sale Price

Once an NFT is sold, the creator can submit a zero-knowledge proof to claim their sale proceeds. This ensures that only the rightful creator, without revealing their identity, can withdraw the funds from the marketplace.

## Usage

After setting up the project, you can:

- **Create NFTs**: Upload your artwork, generate a zkNFT, and list it on the marketplace.
- **Buy NFTs**: Browse and purchase NFTs without revealing your identity.
- **Claim Sale Proceeds**: After your NFT is sold, use a zero-knowledge proof to claim your payment.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your changes. For significant changes, please open an issue first to discuss the proposed modifications.
