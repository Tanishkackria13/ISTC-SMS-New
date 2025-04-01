import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

const Navbar = async () => {
  const user = await currentUser();

  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      {/* <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search here..."
          className="w-[200px] p-3 bg-transparent outline-none"
        />
      </div> */}
      <div className="flex items-center gap-6 text-2xl justify-end w-full font-extrabold font-times text-blue-950">
        INDO SWISS TRIANING CENTRE,SECTOR 30C, CHANDIGARH 
        </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        {/* <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative" onClick={handleAnnouncementClick}>
          <Image src="/announcement.png" alt="" width={25} height={25} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div> */}
        <div className="flex flex-col mx-3">
          <span className="text-xs leading-3 uppercase font-bold ">{user?.username as string}</span>
          <span className="text-[10px] text-blue-700 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
