import { NextResponse } from "next/server";

import {
  createProtocolDeviation,
  type CreateProtocolDeviationInput,
} from "@/lib/compliance/protocol-deviations";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProtocolDeviationInput;

    if (!body.study_id) {
      return NextResponse.json(
        { error: "study_id is required" },
        { status: 400 },
      );
    }

    if (!body.deviation_type?.trim()) {
      return NextResponse.json(
        { error: "deviation_type is required" },
        { status: 400 },
      );
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 },
      );
    }

    if (!body.severity) {
      return NextResponse.json(
        { error: "severity is required" },
        { status: 400 },
      );
    }

    const protocolDeviation = await createProtocolDeviation(body);

    return NextResponse.json(
      {
        data: protocolDeviation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create protocol deviation:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create protocol deviation",
      },
      { status: 500 },
    );
  }
}