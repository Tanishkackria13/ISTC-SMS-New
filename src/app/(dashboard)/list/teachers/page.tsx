import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Branch, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { TeacherFilter } from "@/components/Filter";

type TeacherList = Teacher & { subjects: Subject[] } & { branches: Branch[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Branches",
      accessor: "branches",
      className: "hidden md:table-cell",
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
  const branches = await prisma.branch.findMany();
  const semesters = await prisma.semester.findMany();

  const renderRow = (item: TeacherList) => (
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
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.branches.map((branchItem) => branchItem.name).join(",")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="flex items-center justify-center p-2 m-2 bg-blue-400 ">
              {/* <Image src="/view.png" alt="" width={16} height={16} /> */}
              <>View</>
            </button>
          </Link>
          {(role === "registrar" || role === "admin" || role === "theoryIncharge") && (
            <>
              <FormContainer table="teacher" type="update" data={item} />
              
            </>
          )}
          {( role === "admin" || role === "theoryIncharge") && (
            <>
              
              <FormContainer table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, search, branchId, itemsPerPage } = searchParams;

  const p = page ? parseInt(page) : 1;
  const itemsPerPageValue = itemsPerPage ? parseInt(itemsPerPage) : 10;

  const query: Prisma.TeacherWhereInput = {};

  if (search) {
    query.OR = [
      { name: { contains: search.toLowerCase() } },
      { email: { contains: search.toLowerCase() } },
      { username: { contains: search.toLowerCase() } },
    ];
  }

  if (branchId) {
    query.branches = {
      some: {
        id: parseInt(branchId),
      },
    };
  }

  const orderBy: Prisma.TeacherOrderByWithRelationInput = {};

  // if (sort === "name") {
  //   orderBy.name = "asc";
  // } else if (sort === "branch") {
  //   orderBy.branches = { _count: "asc" };
  // }

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        branches: true,
      },
      take: itemsPerPageValue,
      skip: itemsPerPageValue * (p - 1),
      orderBy,
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-teal-50 p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-blue-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="bg-red-500 w-2 h-6 rounded mr-2 hidden md:block"></span>
            All Teachers
          </h1>
          <p className="text-sm text-red-500 mt-1 hidden md:block">
            View and manage faculty information
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full bg-white md:w-auto mb-3 md:mb-0">
            <TableSearch placeholder="Search teachers..." />
          </div>
          <div className="flex items-center gap-3 self-end">
            {/* <Link href={`/list/teachers?branchId=${branchId || ""}&sort=name`}>
              <button className="flex items-center justify-center p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                <Image src="/sort.png" alt="Sort" width={16} height={16} />
                <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">
                  Sort by Name
                </span>
              </button>
            </Link>
            <Link
              href={`/list/teachers?branchId=${branchId || ""}&sort=branch`}
            >
              <button className="flex items-center justify-center p-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors">
                <Image src="/sort.png" alt="Sort" width={16} height={16} />
                <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">
                  Sort by Branch
                </span>
              </button>
            </Link> */}
            <TeacherFilter
              branches={branches}
              // semesters={semesters}
              branchId={searchParams.branchId}
              // semester={searchParams.semester}
            />

            {(role === "admin" || role === "theoryIncharge") && (
              <FormContainer table="teacher" type="create" />
            )}
            
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-md border border-blue-300">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      <div className="mt-6 flex justify-between items-center">
      <Pagination page={p} count={count} itemsPerPage={itemsPerPageValue} />
      </div>
    </div>
  );
};

export default TeacherListPage;
