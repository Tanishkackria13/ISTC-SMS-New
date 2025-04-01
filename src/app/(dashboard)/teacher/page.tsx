import Announcements from "@/components/Announcements";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const TeacherPage = async () => {
  const { userId } = auth();
  if (!userId) {
    return <div>User ID is not available</div>;
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          subjects: true,
          lectures: true,
          branches: true,
        },
      },
    },
  });

  if (!teacher) {
    return <div>Teacher not found</div>;
  }

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row bg-blue-50">
      {/* LEFT SECTION */}
      <div className="w-full xl:w-2/3">
        {/* PROFILE SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-mono">TEACHER DASHBOARD</h1>
          <div className="h-1 w-24 bg-blue-700"></div>
          <p className="text-sm text-gray-500 mt-1">Welcome to your personal dashboard</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* TEACHER PROFILE CARD */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex-1 flex gap-6 border border-gray-100">
            <div className="w-1/3">
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                <Image
                  src={ "/noAvatar.png"}
                  alt={`${teacher.name} profile`}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 mb-2">
                  {teacher.name}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-600">Username:</span> {teacher.username}<br/>
                  <span className="font-medium text-gray-600">Email:</span> {teacher.email}<br/>
                  <span className="font-medium text-gray-600">Phone number:</span> {teacher.phone || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
          
          {/* STATS CARDS */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SUBJECTS CARD */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg">
                <Image
                  src="/singleBranch.png"
                  alt="Subjects"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {teacher._count.subjects}
                </h2>
                <span className="text-sm text-gray-500">Subjects Taught</span>
              </div>
            </div>
            
            {/* BRANCHES CARD */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-yellow-50 rounded-lg">
                <Image
                  src="/singleClass.png"
                  alt="Branches"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {teacher._count.branches}
                </h2>
                <span className="text-sm text-gray-500">Assigned Branches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {/* SHORTCUTS PANEL */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-500 p-2 rounded-md">Quick Navigation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
            <Link
              className="p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-2 text-blue-700 font-medium"
              href={`/uploadResult`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full">
                <Image src="/singleBranch.png" alt="" width={14} height={14} />
              </div>
              Upload Result
            </Link>
            <Link
              className="p-3 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-2 text-purple-700 font-medium"
              href={`/list/students?teacherId=${teacher.id}`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-purple-100 rounded-full">
                <Image src="/singleBranch.png" alt="" width={14} height={14} />
              </div>
              My Students
            </Link>
            
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors flex items-center gap-2 text-pink-700 font-medium"
              href={`/list/allotedSubjects`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-pink-100 rounded-full">
                <Image src="/singleClass.png" alt="" width={14} height={14} />
              </div>
              My Subjects
            </Link>
          </div>
        </div>
        
        {/* ANNOUNCEMENTS PANEL */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-500 p-2 rounded-md">Announcements</h2>
            <Announcements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;