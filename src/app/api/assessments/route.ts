import { NextResponse } from "next/server";

import { getSubjectAssessments } from "@/lib/compliance/assessment-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const studyId = searchParams.get("study_id");
    const subjectId = searchParams.get("subject_id");

    if (!studyId || !subjectId) {
      return NextResponse.json(
        {
          error: "study_id and subject_id are required",
        },
        { status: 400 },
      );
    }

    const assessments = await getSubjectAssessments(
      studyId,
      subjectId,
    );

    return NextResponse.json(
      {
        data: assessments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to fetch assessments:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch assessments",
      },
      { status: 500 },
    );
  }
}