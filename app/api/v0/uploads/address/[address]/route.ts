import { NextResponse } from "next/server";
import { NextApiRequest } from "next";
import { fetchGraphQL } from "@/app/utils/query";
import { getTxByAddress } from "@/app/graphql";

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
      owners: address,
    }
  );

  if (errors) {
    console.error(errors);
    return NextResponse.json({ status: 500, errors });
  }

  return NextResponse.json({ status: 200, data });
};
