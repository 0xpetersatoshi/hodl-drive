import { NextResponse } from "next/server";
import { NextApiRequest } from "next";
import { fetchGraphQL } from "@/app/utils/query";
import { getTxByAddress } from "@/app/graphql";

const DEFAULT_LIMIT = 100;

type AddressUploadParams = {
  address: string;
};

export const GET = async (
  _: NextApiRequest,
  { params }: { params: AddressUploadParams }
) => {
  const { address } = params;
  console.log(`address: ${address}`);
  const { errors, data } = await fetchGraphQL(
    getTxByAddress,
    "getTxByAddress",
    {
      owners: process.env.UPLOADER_ADDRESS,
      tags: [
        {
          name: "address",
          values: address,
        },
      ],
      limit: DEFAULT_LIMIT,
    }
  );

  if (errors) {
    console.error(errors);
    return NextResponse.json({ status: 500, errors });
  }

  return NextResponse.json({ status: 200, data });
};