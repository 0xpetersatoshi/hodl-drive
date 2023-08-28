import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/app/utils/query";
import { getTxByAddress } from "@/app/graphql";
import { config } from "@/app/config";

const DEFAULT_LIMIT = 100;

type AddressUploadParams = {
  address: string;
};

export const GET = async (
  _: NextRequest,
  { params }: { params: AddressUploadParams }
) => {
  const { address } = params;
  console.log(`address: ${address}`);
  const { errors, data } = await fetchGraphQL(
    getTxByAddress,
    "getTxByAddress",
    {
      owners: config.UPLOADER_ADDRESS,
      tags: [
        {
          name: "address",
          values: address,
        },
        {
          name: "schemaVersion",
          values: config.SCHEMA_VERSION,
        },
      ],
      limit: DEFAULT_LIMIT,
      order: "DESC",
    }
  );

  if (errors) {
    console.error(errors);
    return NextResponse.json({ error: errors }, { status: 500 });
  }

  return NextResponse.json({ status: 200, data });
};
