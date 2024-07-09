import { FaFilter } from "react-icons/fa6";
import { dummyData } from "./components/data/dummyData";
import OverviewCard from "./components/OverviewCard";

function OverviewPage() {

  return (
    <>
      <div className="flex flex-col gap-6">
        <h2 className="text-[24px] text-gray-900">Operational Overview</h2>
        <div className=" flex items-center justify-between">
        <div className=" flex gap-4 items-center">
          <form className="w-[380px] ">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input type="search" id="default-search" className="block w-full p-4 px-4 ps-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="Search building, floor, room" required />
              {/* <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button> */}
            </div>
          </form>
          <div className=" flex items-center justify-center gap-1.5 text-[#6B7280] cursor-pointer">
            <FaFilter />
            <p className=" text-sm">Filter</p>
          </div>
        </div>
      </div>
      <OverviewCard formData={dummyData} />
      </div>
    </>
  );
}

export default OverviewPage;
