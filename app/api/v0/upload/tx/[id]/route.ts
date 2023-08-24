import { NextResponse } from "next/server";
import { NextApiRequest } from "next";
import { fetchGraphQL } from "@/app/utils/query";
import { getTxById } from "@/app/graphql";

type TxUploadParams = {
  id: string;
};

export const GET = async (
  _: NextApiRequest,
  { params }: { params: TxUploadParams }
) => {
  const { id } = params;

  console.log(`Getting transaction for tx id: ${id}`);
  const { errors, data } = await fetchGraphQL(getTxById, "getTxById", {
    txIds: id,
  });

  console.log(`data: ${data}`);

  if (errors) {
    console.error(errors);
    return NextResponse.json({ status: 500, errors });
  }

  return NextResponse.json({ status: 200, data });
};
