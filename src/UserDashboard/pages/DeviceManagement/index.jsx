import React from 'react'
import DeviceManagementTable from './components/DeviceManagementTable'
import { deviceData } from "../StatusPage/components/data/deviceData";

const index = () => {
    return (
        <>
            <div className="flex flex-col gap-6">
                <h2 className="text-[24px] text-gray-900">Device Management</h2>
                <div className='w-full flex flex-col justify-center items-center'>
                    {deviceData && (<DeviceManagementTable tableData={deviceData} />)}
                </div>
            </div>
        </>
    )
}

export default index;