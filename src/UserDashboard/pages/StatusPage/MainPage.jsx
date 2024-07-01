import EventLogsTable from "../../components/EventLogsTable"
import { tableData } from "../../components/data/tableData"
import celeAnimation from "../../../assets/icons/celeb.gif"
import { useState } from "react";
import { AiFillExclamationCircle } from "react-icons/ai";
import { FaTablet } from "react-icons/fa6";
import { FaBuilding } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Tooltip } from "flowbite-react";

function MainPage() {
  const [generalError, setgeneralError] = useState(false);
  const [unassignedError, setunassignedError] = useState(false);
  const [offlineError, setofflineError] = useState(false);
  const [error, setError] = useState(true);
  
  

  return (
    <>
      <div className="flex flex-col gap-6">
        <h2 className=" text-[24px] text-gray-900">Status Page</h2>
        {!error ? (
          <div className="w-full flex flex-row justify-start items-center">
            <Card />
          </div>
        ):(
          <div className=" w-full flex flex-col gap-4">
            <div className=" felx flex-col">
              <h2 className=" text-[18px] text-gray-900">Reports Summary</h2>
              <p className=" text-sm text-gray-500">Click on card to view details</p>
            </div>
            <Tooltip className='min-w-[130px]' content="Back to event Logs" style="light" animation="duration-500">
              <h3 className="text-[16px] text-primary font-normal flex items-center gap-2 cursor-pointer hover:scale-95">
                  <IoMdArrowRoundBack className=' text-2xl text-primary' />
                Back to event Logs
              </h3>
            </Tooltip>
            <div className=" flex gap-4">
              {/* generalError */}
              <div className=" w-1/3 bg-white flex p-6 gap-4 rounded-lg shadow-sm items-center justify-start cursor-pointer hover:ring-primary-200 hover:ring-2">
                <div className=" bg-red-100 text-red-700 p-3 text-2xl rounded-lg"><AiFillExclamationCircle/></div>
                <div className=" flex flex-col">
                  <p className=" text-gray-900 font-bold">123</p>
                  <p className=" text-base text-gray-500 font-normal">Errors occured</p>
                </div>
              </div>
              {/* unassignedError */}
              <div className=" w-1/3 bg-white flex p-6 gap-4 rounded-lg shadow-sm items-center justify-start cursor-pointer hover:ring-primary-200 hover:ring-2">
                <div className=" bg-green-100 text-green-700 p-3 text-2xl rounded-lg"><FaBuilding/></div>
                <div className=" flex flex-col">
                  <p className=" text-gray-900 font-bold">123/1234</p>
                  <p className=" text-base text-gray-500 font-normal">Rooms unassigned</p>
                </div>
              </div>
              {/* offlineError */}
              <div className=" w-1/3 bg-white flex p-6 gap-4 rounded-lg shadow-sm items-center justify-start cursor-pointer hover:ring-primary-200 hover:ring-2">
                <div className=" bg-yellow-100 text-yellow-700 p-3 text-2xl rounded-lg"><FaTablet/></div>
                <div className=" flex flex-col">
                  <p className=" text-gray-900 font-bold">100/1234</p>
                  <p className=" text-base text-gray-500 font-normal">Devices Offline</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {tableData && (<EventLogsTable tableData={tableData} />)}
      </div>
    </>
  )
}

const Card = () => {
  return (
    <>
      <div className="max-w-md px-6 pb-6 pt-4 bg-[#E7F9FD] border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">

        <div className="flex flex-row relative justify-start items-end">
          <h5 className="text-2xl font-semibold text-gray-900 dark:text-white">Everything is going well</h5>
          <img className="w-[40px] h-[39px] " src={celeAnimation} alt="" />
        </div>

        <p className="mb-3 font-normal text-gray-500 dark:text-gray-400 text-sm">Sit back and relax, we will alert you if any error(s) appear in your system.</p>
      </div>
    </>
  )
}

export default MainPage