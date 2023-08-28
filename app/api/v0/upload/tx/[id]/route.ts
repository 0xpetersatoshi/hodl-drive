import { NextRequest, NextResponse } from "next/server";
import { fetchGraphQL } from "@/app/utils/query";
import { getTxById } from "@/app/graphql";

type TxUploadParams = {
  id: string;
};

export const GET = async (
  _: NextRequest,
  { params }: { params: TxUploadParams }
) => {
  const { id } = params;

  console.log(`Getting transaction for tx id: ${id}`);
  const { errors, data } = await fetchGraphQL(getTxById, "getTxById", {
    txIds: id,
  });

  if (errors) {
    console.error(errors);
    return NextResponse.json({ error: errors }, { status: 500 });
  }

  return NextResponse.json({ status: 200, data });
};
