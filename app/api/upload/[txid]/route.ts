import { NextResponse } from "next/server";
import { NextApiRequest } from "next";
import { fetchGraphQL } from "@/app/utils/query";
import { getTxById } from "@/app/graphql";

type TxUploadParams = {
  txid: string;
};

export const GET = async (
  _: NextApiRequest,
  { params }: { params: TxUploadParams }
) => {
  const { txid } = params;
  const { errors, data } = await fetchGraphQL(getTxById, "getTxById", {
    txIds: txid,
  });

  if (errors) {
    console.error(errors);
    return NextResponse.json({ status: 500, errors });
  }

  return NextResponse.json({ status: 200, data });
};
