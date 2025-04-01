import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import { ResultFilters } from "@/components/Filter";
import type { Result, Student, Subject, Branch, Teacher } from "@prisma/client";
import TableSearch from "@/components/TableSearch";

type ResultList = Result & { student: Student; subject: Subject; branch: Branch; teacher: Teacher };

const FailedResultListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const columns = [
    { header: "Student Name", accessor: "student.name", className: "hidden md:table-cell" },
    { header: "Marks", accessor: "overallMark", className: "hidden md:table-cell" },
    { header: "Subject", accessor: "subject.name", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item: ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="hidden md:table-cell">{item.student.name}</td>
      <td className="hidden md:table-cell">{item.overallMark}</td>
      <td className="hidden md:table-cell">{item.subject.name}</td>
      <td>
        <div className="flex items-center gap-2">
          {/* Add actions if necessary */}
        </div>
      </td>
    </tr>
  );

  const { page, branchId, semester, subjectId, ...queryParams } = searchParams;
  const p = page ? Number.parseInt(page) : 1;

  const query: Prisma.ResultWhereInput = {
    grade: { equals: 'E' }, 
  };

  if (queryParams.studentName) {
    query.student = { name: { contains: queryParams.studentName, mode: "insensitive" } };
  }

  if (branchId) {
    query.student = { ...query.student, branchId: Number.parseInt(branchId) };
  }

  if (semester) {
    query.student = { ...query.student, semesterId: Number.parseInt(semester) };
  }

  try {
    const [dataRes, count] = await prisma.$transaction([
      prisma.result.findMany({
        where: query,
        include: {
          student: {
            select: {
              name: true,
              branch: true,
              semester: true,
            },
          },
          subject: { select: { name: true } },
          teacher: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.result.count({ where: query }),
    ]);
  
    const data = dataRes.map((item) => ({ ...item }));
    console.log('Fetched data:', data); // Log data for inspection
  
    const branches = await prisma.branch.findMany().catch(() => []);
    const semesters = await prisma.semester.findMany().catch(() => []);
    const subjects = await prisma.subject.findMany().catch(() => []);
  
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h1 className="text-2xl font-bold mb-4">Failed Students</h1>
        <TableSearch />
        <ResultFilters
          branches={branches}
          semesters={semesters}
          subjects={subjects}
          branchId={branchId}
          semester={semester}
          subjectId={subjectId}
        />
        <Table columns={columns} data={data} renderRow={renderRow} />
        <Pagination page={p} count={count} itemsPerPage={ITEM_PER_PAGE} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching failed results:", error);
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h1 className="text-lg font-semibold">Failed Results</h1>
        <p className="text-gray-500">Error loading failed results. Please try again later.</p>
      </div>
    );
  }
}  

export default FailedResultListPage;
