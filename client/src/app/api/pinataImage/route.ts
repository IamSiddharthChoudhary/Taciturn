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

    if (!data) return NextResponse.json("Sorry");
    const image: File | null = data.get("file");

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const name = data.get("name");

    await writeFile(`./public/temp/army.jpg`, buffer, "utf-8", () => {});

    let res;
    try {
      res = await saveFile("./public/temp/army.jpg", "Army");
    } catch (error) {
      console.log("Pinata error");
    }

    const { IpfsHash } = res;
    return new NextResponse(IpfsHash);
  } catch (e) {
    console.error(e);
  }
};

export const GET = async () => {
  return NextResponse.json({
    "All coz of": "Mere daata ji",
  });
};
