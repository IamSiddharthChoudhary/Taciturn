const { ethers, run } = require("hardhat");

async function main() {
  const conFac = await ethers.getContractFactory("NftMarketplace");
  await run("verify:verify", {
    address: "0x4d88155F6cb0573D3D46d844366AB385252afae3",
    constructorArguments: [
      "0x643bB72abD9ebA42339D70e3a72Cb5911d2a4a9b",
      "0x93e89142Fc3bDEd1a47405ef226D1298FB0BfFE5",
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
