import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  createAdverseEvent,
  type CreateAdverseEventInput,
} from "@/lib/safety/adverse-events";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const studyId = searchParams.get("studyId");
    const subjectId = searchParams.get("subjectId");

    if (!studyId) {
      return NextResponse.json(
        {
          error: "studyId is required",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from("adverse_events")
      .select("*")
      .eq("study_id", studyId)
      .order("reported_at", { ascending: false });

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Unable to fetch adverse events: ${error.message}`);
    }

    return NextResponse.json(
      {
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to fetch adverse events:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch adverse events",
      },
      { status: 500 },
    );
  }
}