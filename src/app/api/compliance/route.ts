import { NextResponse } from "next/server";

import {
  evaluateCompliance,
  type ComplianceEvaluationInput,
} from "@/lib/compliance/evaluate";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ComplianceEvaluationInput;

    const evaluation = evaluateCompliance(body);

    return NextResponse.json(
      {
        data: evaluation,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to evaluate compliance:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to evaluate compliance",
      },
      { status: 500 },
    );
  }
}