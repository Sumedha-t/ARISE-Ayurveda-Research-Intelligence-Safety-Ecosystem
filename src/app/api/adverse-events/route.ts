import { NextResponse } from "next/server";

import {
  createAdverseEvent,
  type CreateAdverseEventInput,
} from "@/lib/safety/adverse-events";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAdverseEventInput;

    if (!body.study_id || !body.subject_id) {
      return NextResponse.json(
        {
          error: "study_id and subject_id are required",
        },
        { status: 400 },
      );
    }

    if (!body.event_term?.trim()) {
      return NextResponse.json(
        {
          error: "event_term is required",
        },
        { status: 400 },
      );
    }

    if (!body.severity) {
      return NextResponse.json(
        {
          error: "severity is required",
        },
        { status: 400 },
      );
    }

    const adverseEvent = await createAdverseEvent(body);

    return NextResponse.json(
      {
        data: adverseEvent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create adverse event:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create adverse event",
      },
      { status: 500 },
    );
  }
}