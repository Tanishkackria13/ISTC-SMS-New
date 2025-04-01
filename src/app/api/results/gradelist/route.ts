import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { sessionClaims } = auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    console.log("User Role:", role);

    let whereCondition: any = {};

    if (role === "registrar") {
      whereCondition.grade = "E";  
    }

    console.log("Fetching results with filter:", JSON.stringify(whereCondition, null, 2));

    const results = await prisma.result.findMany({
      where: whereCondition,
      include: {
        student: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    });

    console.log("Fetched results:", results);

    if (!results.length) {
      return NextResponse.json({ message: "No results found." }, { status: 404 });
    }

    const formattedResults = results.map((res) => ({
      teacherId: res.teacherId || "Unknown",
      teacherName: res.teacher?.name || "Unknown",
      subjectId: res.subjectId || 0,
      subjectName: res.subject?.name || "Unknown",
      studentCount: 1, 
      verified: res.verified,
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
