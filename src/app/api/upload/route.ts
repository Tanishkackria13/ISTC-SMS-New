import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import prisma from "@/lib/prisma";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const branchId = parseInt(formData.get("branchId") as string);
    const gradeId = parseInt(formData.get("gradeId") as string);
    const file = formData.get("file") as Blob;

    if (!branchId || !gradeId || !file) {
      return NextResponse.json(
        { success: false, error: "Missing file, Branch ID, or Grade ID." },
        { status: 400 }
      );
    }

    // Convert Blob to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Ensure a writable temp directory
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, "uploaded.xlsx");

    // Write the file
    await writeFile(tempFilePath, uint8Array);

    // Confirm file exists before reading
    if (!existsSync(tempFilePath)) {
      return NextResponse.json(
        { success: false, error: "File save failed." },
        { status: 400 }
      );
    }

    // Read the Excel file using buffer
    const fileBuffer = await readFile(tempFilePath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    // const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Extract only headers
console.log("Extracted Headers:", rawData[0]);
    const studentData = xlsx.utils.sheet_to_json<{
      Name: string;
      RollNo: string;
      "Father Name": string;
      "Mother Name": string;
    }>(sheet);

    if (!studentData.every((row) => row.Name && row.RollNo && row["Father Name"] && row["Mother Name"])) {
      return NextResponse.json({ success: false, error: "Invalid Excel columns." }, { status: 400 });
    }

    const students = studentData.map((row) => ({
      name: row.Name,
      username: row.RollNo,
      fatherName: row["Father Name"],
      motherName: row["Mother Name"],
      branchId,
      gradeId,
    }));

    await prisma.student.createMany({ data: students, skipDuplicates: false });

    return NextResponse.json({ success: true, message: "Students imported successfully" });
  } catch (error) {
    console.error("Error importing students:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
