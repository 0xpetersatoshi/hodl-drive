import { NextRequest, NextResponse } from "next/server";
import { bundlr, fundNode } from "@/app/config/bundlr";

export const POST = async (req: NextRequest) => {
  console.log(req.body);

  // Upload data
  const dataToUpload = "GM, wagmi!";
  try {
    await fundNode();
    const response = await bundlr.upload(dataToUpload, {
      tags: [{ name: "Content-Type", value: "text/plain" }],
    });
    const uploadUrl = `https://arweave.net/${response.id}`;
    console.log(`Data uploaded ==> ${uploadUrl}`);
    return NextResponse.json({ status: 200, message: uploadUrl });
  } catch (error) {
    console.log("Error uploading file ", error);
    return NextResponse.json({ status: 500, error });
  }
};
