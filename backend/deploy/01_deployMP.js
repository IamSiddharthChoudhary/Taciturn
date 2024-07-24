const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  args = [
    "0x643bB72abD9ebA42339D70e3a72Cb5911d2a4a9b",
    "0x93e89142Fc3bDEd1a47405ef226D1298FB0BfFE5",
  ];

  await deploy("NftMarketplace", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};

module.exports.tags = ["all", "Groth16Verifier"];
