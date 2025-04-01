import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Announcement, Teacher, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

type AnnouncementList = Announcement & {
  teachers: {
    teacher: Teacher;
  }[];
};

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const userId = sessionClaims?.sub;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Content",
      accessor: "content",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Teachers",
      accessor: "teachers",
      className: "hidden md:table-cell",
    },
    {
      header: "File",
      accessor: "file",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "registrar"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td className="hidden md:table-cell">{item.content}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
      </td>
      <td className="hidden md:table-cell">
        {item.teachers.map(({ teacher }) => teacher.name).join(", ")}
      </td>
      <td className="hidden md:table-cell">
        {item.fileUrl && (
          <a
            href={`/api/files/${item.fileUrl}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View File
          </a>
        )}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "registrar") && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page,itemsPerPage, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const itemsPerPageValue = itemsPerPage ? parseInt(itemsPerPage) : 10;

  // URL PARAMS CONDITION
  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    query.OR = [
      { teachers: { some: { teacherId: userId } } },
      { teachers: { none: {} } }, 
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        teachers: {
          include: {
            teacher: true,
          },
        },
      },
      take: itemsPerPageValue,
      skip: itemsPerPageValue * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="bg-teal-50 p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-blue-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="bg-red-500 w-2 h-6 rounded mr-2 hidden md:block"></span>
            All Announcements
          </h1>
          <p className="text-sm text-red-500 mt-1 hidden md:block">
            View and manage system announcements
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full bg-white md:w-auto mb-3 md:mb-0">
            <TableSearch />
          </div>
          <div className="flex items-center gap-3 self-end">
            {(role === "admin" || role === "registrar") && (
              <FormContainer table="announcement" type="create" />
            )}
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-md border border-blue-300">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      <div className=" mt-6 flex justify-center md:justify-end ">
      <Pagination page={p} count={count} itemsPerPage={itemsPerPageValue}  />
      </div>
    </div>
  );
};

export default AnnouncementListPage;