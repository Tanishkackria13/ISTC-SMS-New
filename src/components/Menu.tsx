import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "registrar", "theoryIncharge"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher", "registrar","theoryIncharge"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "registrar","theoryIncharge"],
      },
      {
        icon: "/teacher.png",
        label: "Theory Incharges",
        href: "/list/theoryIncharges",
        visible: ["registrar"],
      },
      {
        icon: "/registrar.png",
        label: "Registrars",
        href: "/list/registrars",
        visible: ["admin"],
      },
      {
        icon: "/registrar.png",
        label: "Teacher Incharges",
        href: "/list/theoryIncharges",
        visible: ["admin"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["registrar","theoryIncharge"],
      },
      {
        icon: "/subject.png",
        label: "Alloted Subjects",
        href: "/list/allotedSubjects",
        visible: ["teacher"],
      },
      {
        icon: "/class.png",
        label: "Branches",
        href: "/list/branches",
        visible: ["registrar", "teacher","theoryIncharge"],
      },
      // {
      //   icon: "/lesson.png",
      //   label: "Lectures",
      //   href: "/list/lectures",
      //   visible: ["teacher", "registrar"],
      // },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["teacher", "registrar", "theoryIncharge"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results/registrar",
        visible: ["registrar"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results/teacher",
        visible: ["teacher"],
      },
      // {
      //   icon: "/attendance.png",
      //   label: "Attendance",
      //   href: "/list/attendance",
      //   visible: ["teacher"],
      // },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "registrar", "theoryIncharge"],
      },
      {
        icon: "/upload.png",
        label: "Upload Excel Files",
        href: "/upload",
        visible: ["admin", "registrar"],
      },
      {
        icon: "/upload.png",
        label: "Upload Results",
        href: "/uploadResult",
        visible: ["teacher"],
      },
    ],
  },
  // {
  //   title: "OTHER",
  //   visible: ["teacher", "student", "registrar"],
  //   items: [
  //     {
  //       icon: "/profile.png",
  //       label: "Profile",
  //       href: "/profile",
  //       visible: ["teacher", "student", "registrar"],
  //     },
  //     // {
  //     //   icon: "/setting.png",
  //     //   label: "Settings",
  //     //   href: "/settings",
  //     //   visible: ["admin", "teacher", "student", "registrar"],
  //     // },
  //     {
  //       icon: "/logout.png",
  //       label: "Logout",
  //       href: "/logout",
  //       visible: ["admin", "teacher", "student", "registrar"],
  //     },
  //   ],
  // },
];

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;
  
  return (
    <div className="mt-6 text-sm ">
      {menuItems.map((i) => (
        <div className="flex flex-col mb-8" key={i.title}>
          {i.title && (
            <div className="hidden lg:block px-4 mb-3">
              <span className="text-gray-500 font-semibold text-xs tracking-widest uppercase inline-block after:content-[''] after:block after:w-8 after:h-0.5 after:bg-blue-900 after:mt-1">
                {i.title}
              </span>
            </div>
          )}
          <div className="space-y-1">
            {i.items.map((item) => {
              if (item.visible.includes(role)) {
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    className="flex items-center justify-center lg:justify-start gap-3 text-gray-600 hover:text-blue-900 py-3 px-4 rounded-lg hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200 transition-all duration-200 border-l-2 border-transparent hover:border-l-2 hover:border-blue-900"
                  >
                    <div className="w-6 h-6 relative flex-shrink-0 p-1 bg-gray-100 rounded-md group-hover:bg-blue-100">
                      <Image
                        src={item.icon}
                        alt=""
                        fill
                        className="object-contain opacity-80"
                      />
                    </div>
                    <span className="hidden lg:block font-medium text-sm relative after:absolute after:content-[''] after:bg-blue-500 after:h-0.5 after:w-0 after:left-0 after:-bottom-0.5 after:transition-all hover:after:w-full">
                      {item.label}
                    </span>
                  </Link>
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;