import EventLogsTable from "../../components/EventLogsTable"
import { tableData } from "../../components/data/tableData"

function MainPage() {

  return (
    <>
      <div className="w-full flex flex-col justify-start items-center min-h-screen">
        {tableData && (<EventLogsTable tableData={tableData} />)}
      </div>
    </>
  )
}

export default MainPage