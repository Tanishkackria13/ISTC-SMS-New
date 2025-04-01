import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Branch, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Filters, { ResultFilters, SubjectFilters } from "@/components/Filter";

type StudentList = Student & { branch: Branch };

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = sessionClaims?.sub;
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Semester",
      accessor: "semester",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Gender",
      accessor: "gender",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin" || role === "registrar" || role === "theoryIncharge"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];
  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.branch.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.semester.level}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.sex}</td>

      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="flex items-center justify-center p-2 m-2 bg-blue-400 ">
              <>View</>
            </button>
          </Link>
          {(role === "admin" || role === "theoryIncharge") && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
          
          {(role === "teacher" ) && (
            <FormContainer table="result" type="create" data={{ student: item }} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, search, branchId, semester, itemsPerPage } = searchParams;

  const p = page ? parseInt(page) : 1;
  const itemsPerPageValue = itemsPerPage ? parseInt(itemsPerPage) : 10;

  const query: Prisma.StudentWhereInput = {};

  // If the user is a teacher, fetch their branches and filter students
  if (role === "teacher" && userId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      select: {
        branches: {
          select: {
            id: true, // Branch ID
            semesters: true, // Semesters associated with the branch
          },
        },
      },
    });

    if (teacher && teacher.branches.length > 0) {
      const branchIds = teacher.branches.map((branch) => branch.id);
      const semesterIds = teacher.branches
        .flatMap((branch) => branch.semesters.map((semester) => semester.id))
        .filter((id): id is number => id !== null);
      query.branchId = { in: branchIds };
      query.semesterId = { in: semesterIds };
    }
  }

  if (search) {
    query.OR = [
      { name: { contains: search.toLowerCase() } },
      { email: { contains: search.toLowerCase() } },
      { username: { contains: search.toLowerCase() } },
    ];
  }

  if (branchId && role !== "teacher") {
    query.branch = {
      id: parseInt(branchId),
    };
  }

  if (semester && role !== "teacher") {
    query.semester = {
      id: parseInt(semester),
    };
  }
  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        branch: true,
        semester: true,
      },
      take: itemsPerPageValue,
      skip: itemsPerPageValue * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);
  const branches = await prisma.branch.findMany().catch(() => []);
  const semesters = await prisma.semester.findMany().catch(() => []);
  const subjects = await prisma.subject.findMany().catch(() => []);

  return (
    <div className="bg-teal-50 p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-blue-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="bg-red-500 w-2 h-6 rounded mr-2 hidden md:block"></span>
              All Students
          </h1>
          <p className="text-sm text-red-500 mt-1 hidden md:block">
              View and manage student information
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full bg-white md:w-auto mb-3 md:mb-0">
            <TableSearch placeholder="Search students..." />
          </div>
          <div className="flex items-center gap-3 self-end">
            <SubjectFilters
              branches={branches}
              semesters={semesters}
              branchId={branchId}
              semester={semester}
            />
            {(
              role === "admin" || role === "theoryIncharge") && (
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-md border border-blue-300">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      <div className="mt-6 flex justify-center md:justify-end">
        <Pagination page={p} count={count} itemsPerPage={itemsPerPageValue} />
      </div>
    </div>
  );
};

export default StudentListPage;