// @ts-nocheck
import { IncomingForm, File } from "formidable";
import multer from "multer";
import fs, { writeFile } from "fs";
import pinataSDK, { PinataClient, PinataPinResponse } from "@pinata/sdk";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const pinata: PinataClient = new pinataSDK({
  pinataJWTKey: process.env.PINATA_JWT,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadedFile extends File {
  originalFilename: string;
}

const saveFile = async (
  _filepath,
  _name: string
): Promise<PinataPinResponse> => {
  try {
    const stream = fs.createReadStream(_filepath);
    const options = {
      pinataMetadata: {
        name: _name,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };
    const response: PinataPinResponse = await pinata.pinFileToIPFS(
      stream,
      options
    );
    await fs.unlinkSync(_filepath);

    return response;
  } catch (error) {
    throw error;
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.formData();

    if (!data) return NextResponse.json("No data");
    const meta: string = data.get("file");
    const encoder = new TextEncoder();
    const metaBuffer = encoder.encode(meta);
    const name = data.get("name");

    await writeFile(`./public/temp/${name}.json`, metaBuffer, () => {});

    let res;
    try {
      res = await saveFile(`./public/temp/${name}.json`, `${name}`);
    } catch (error) {
      console.log("Pinata error");
    }

    if (res) return new NextResponse(res.IpfsHash);
    else return NextResponse.json("MetaDataUploadError: Couldn't pin json");
  } catch (e) {
    console.error(e);
  }
};

export const GET = async () => {
  return NextResponse.json({
    "All coz of": "Mere daata ji",
  });
};
