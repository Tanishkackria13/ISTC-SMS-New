import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "registrar"
    | "subject"
    | "branch"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true,  },
        });
        const subjectSemesters = await prisma.semester.findMany({
          select: { id: true, level: true },
        });
        const subjectBranches = await prisma.branch.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { teachers: subjectTeachers, branches: subjectBranches, semesters: subjectSemesters };
        break;
      case "branch":
        const branchSemesters = await prisma.semester.findMany({
          select: { id: true, level: true },
        });
        const branchTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, },
        });
        relatedData = { teachers: branchTeachers, semesters: branchSemesters };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const teacherBranches = await prisma.branch.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects, branches: teacherBranches };
        break;
      case "student":
        const studentSemesters = await prisma.semester.findMany({
          select: { id: true, level: true },
        });
        const studentBranches = await prisma.branch.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { branches: studentBranches, semesters: studentSemesters };
        break;
      case "exam":
        const examLectures = await prisma.lectures.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lectures: examLectures };
        break;
      
        case "announcement":
          
          const announcementBranches = await prisma.branch.findMany({
            include: { _count: { select: { students: true } } },
          });
          relatedData = { branches: announcementBranches};
        break;

        case "result":
          
        const resultStudents = await prisma.student.findMany({
          select: { id: true, name: true,  },
        });
        const resultExams = await prisma.exam.findMany({
          select: { id: true,  },
        });
          relatedData = { students: resultStudents, exams: resultExams};
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
