import { NextRequest, NextResponse } from "next/server";
import { bundlr } from "@/app/config/bundlr";

export const POST = async (req: NextRequest) => {
  const { address, data } = await req.json();
  console.log(`address: ${address}`);
  console.log(`data: ${data}`);

  if (!address || !data) {
    const error = "No address or data provided with request!";
    console.error(error);
    return NextResponse.json({ status: 400, error });
  }

  const tags = [
    { name: "Content-Type", value: "text/plain" },
    { name: "address", value: address },
  ];

  // Upload data
  try {
    const balance = bundlr.utils.fromAtomic(await bundlr.getLoadedBalance());
    const byteSize = Buffer.from(data, "utf-8").length;
    const uploadPrice = bundlr.utils.fromAtomic(
      await bundlr.getPrice(byteSize)
    );

    console.log(`Upload price = ${uploadPrice}`);
    console.log(`Current node balance: ${balance}`);

    if (uploadPrice > balance) {
      console.log(
        `Upload price is more than wallet balance (balance=${balance} uploadPrice=${uploadPrice})`
      );

      const diff = uploadPrice.toNumber() - balance.toNumber();
      console.log(`Price difference = ${diff}`);

      console.log("Adding funds to wallet...");
      await bundlr.fund(bundlr.utils.toAtomic(diff));
    }

    const response = await bundlr.upload(data, {
      tags: tags,
    });

    const uploadUrl = `https://arweave.net/${response.id}`;
    console.log(`Data uploaded ==> ${uploadUrl}`);

    return NextResponse.json({ status: 200, message: uploadUrl });
  } catch (error) {
    console.log("Error uploading file ", error);
    return NextResponse.json({ status: 500, error });
  }
};
