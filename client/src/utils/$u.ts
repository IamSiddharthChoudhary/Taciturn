import { ethers } from "ethers";

const utils = {
  getShortAddress: (add: String) => {
    const frst3 = add.slice(0, 3);
    const lst3 = add.slice(-3);
    const shtAdd = frst3 + "..." + lst3;
    return shtAdd;
  },

  getBalanceInEth: (bal: number) => {
    const ethBal = bal / 10 ** 18;
    return ethBal;
  },

  fromBN256toBin: (bytes: Uint8Array) => {
    let binaryString = "";
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      binaryString += byte.toString(2).padStart(8, "0");
    }
    return binaryString;
  },

  uint8ArrayToBigInt: (uint8Array: Uint8Array) => {
    const buffer = uint8Array.buffer;
    const view = new DataView(buffer);
    let result = BigInt(0);

    for (let i = 0; i < uint8Array.byteLength; i++) {
      result = (result << BigInt(8)) + BigInt(view.getUint8(i));
    }

    return result;
  },
  hexToDecimal: (hexString: string) => {
    // Remove any leading '0x' prefix if present
    hexString = hexString.replace(/^0x/, "");

    // Parse the hexadecimal string to decimal
    return parseInt(hexString, 16);
  },
};

export default utils;
