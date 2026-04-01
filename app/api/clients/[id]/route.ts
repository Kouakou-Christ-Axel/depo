import { NextRequest, NextResponse } from "next/server";
import { getClientDetail } from "@/features/clients/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await getClientDetail(id);
  if (!client) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }
  return NextResponse.json(client);
}
