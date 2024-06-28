import EventLogsTable from "../../components/EventLogsTable"
import { tableData } from "../../components/data/tableData"
import celeAnimation from "../../../assets/icons/celeb.gif"

function MainPage() {

  return (
    <>
      <div className="w-full flex flex-col justify-start gap-3 items-center min-h-screen">
        <div className="w-full flex flex-row justify-start items-center">
          <Card />
        </div>
        {tableData && (<EventLogsTable tableData={tableData} />)}
      </div>
    </>
  )
}

const Card = () => {
  return (
    <>
      <div className="max-w-md p-6 bg-[#E7F9FD] border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">

        <div className="flex flex-row relative h-[60px] justify-start items-center">
          <h5 className="mb-2 text-2xl font-semibold inline-flex justify-center items-center gap-2 tracking-tight text-gray-900 dark:text-white">Everything is going well</h5>
          <img className="w-[80px] h-[80px] absolute bottom-0 right-0" src={celeAnimation} alt="" />
        </div>

        <p className="mb-3 font-normal text-gray-500 dark:text-gray-400">Sit back and relax, we will alert you if any error(s) appear in your system.</p>
      </div>
    </>
  )
}

export default MainPage