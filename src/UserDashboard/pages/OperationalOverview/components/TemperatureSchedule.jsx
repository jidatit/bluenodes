import React, { useState, useEffect } from "react";
import thermometer from '../../../../assets/icons/thermometer-02.png'
import windowicon from '../../../../assets/icons/Window.png'
import algo from '../../../../assets/icons/algorithm.png'
import { Button, Tooltip } from "flowbite-react";
import { ViewRoomScheduleModal } from "./ViewRoomScheduleModal";
import EditHeatingProgramModal from "./EditHeatingProgramModal";

// Function to determine the background and text colors based on type
const handleTypeColor = (type) => {
  switch (type) {
    case 'Resident':
      return 'bg-yellow-100 text-yellow-800';
    case 'Office':
      return 'bg-primary-100 text-primary-800';
    case 'Utility':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-200 text-gray-900';
  }
};

// Function to determine color based on temperature
const handleTempColour = (temp) => {
  if (temp < 10) {
    return '#DEF7EC';
  }
  else if (temp >= 10 && temp < 20) {
    return '#6EDEF4';
  }
  else if (temp >= 20 && temp <= 25) {
    return '#84E1BC';
  }
  else if (temp > 25 && temp < 30) {
    return '#FDBA8C';
  }
  else if (temp >= 30) {
    return '#F8B4B4';
  }
  else {
    return '#CFF4FB';
  }
};

const handleTextColour = (temp) => {
  if (temp < 10) {
    return '#DEF7EC';
  }
  else if (temp >= 10 && temp < 20) {
    return '#0BAAC9';
  }
  else if (temp >= 20 && temp <= 25) {
    return '#046C4E';
  }
  else if (temp > 25 && temp < 30) {
    return '#FDBA8C';
  }
  else if (temp >= 30) {
    return '#B43403';
  }
  else {
    return '#CFF4FB';
  }
};

// Dummy data representing temperature changes
const temperatureData = [
  { startTime: '00:00', endTime: '08:00', temp: 15, },
  { startTime: '08:00', endTime: '12:00', temp: 24, },
  { startTime: '12:00', endTime: '18:00', temp: 30, },
  { startTime: '18:00', endTime: '24:00', temp: 27, },
];

// Update the temperatureData to include colors
const updatedTemperatureData = temperatureData.map(data => ({
  ...data,
  color: handleTempColour(data.temp),
  textcolor: handleTextColour(data.temp)
}));

// Dummy data representing manual changes
const manualChanges = [
  { time: '02:00', temp: 22 },
  { time: '06:00', temp: 22 },
  { time: '10:00', temp: 22 },
  { time: '21:00', temp: 22 },
  { time: '24:00', temp: 22 },
];

const targetTemp = [
  { time: '16:00', temp: 20 }
];

// const parseTimeToPercentage = (timestamp) => {
//   const date = new Date(timestamp);
//   const hours1 = date.getUTCHours();
//   const minutes1 = date.getUTCMinutes();
//   const time = `${hours1.toString().padStart(2, '0')}:${minutes1.toString().padStart(2, '0')}`
//   const [hours, minutes] = time.split(':').map(Number);
//   const a = ((hours * 60 + minutes) / 1440) * 100;
//   console.log(timestamp,"-->",time, " --> ", a)
//   return a
// };

const parseTimeToPercentage = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return ((hours * 60 + minutes) / 1440) * 100;
}

const TemperatureSchedule = ({ floorId }) => {
  const [type, settype] = useState('Resident');
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(!openModal)
  }

  const [openEditModal, setopenEditModal] = useState(false);
  const handleOpenEditModal = () => {
    setopenEditModal(!openEditModal)
  }
  const token = localStorage.getItem('token');
  const [RoomsDetail, setRoomsDetail] = useState([])

  const getFloorDetails = async (id) => {
    try {
      const resp = await fetch(`https://api-dev.blue-nodes.app/dev/smartheating/operationaloverview/${id}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await resp.json()
      console.log(data);
      setRoomsDetail(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (floorId) {
      getFloorDetails(floorId);
    }
  }, [floorId])

  return (
    <>
      {RoomsDetail && RoomsDetail.map((room, index) => (
        <div key={index} className="w-full p-4 relative rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-7 text-gray-900">
            <div className=' flex items-center gap-1'>
              <span className="text-lg font-bold">{room.name}</span>
              <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${handleTypeColor(type)} rounded-[80px]`}>
                {room.tag}
              </span>
            </div>
            <Tooltip
              className={`px-2 py-1.5 text-center max-w-96`}
              // content={`Current Temp: ${target.temp}°C`}
              content={`Current Temp: ${room.roomTemperature ? `${room.roomTemperature}°C` : "Unavailable"}`}
              style="light"
            >
              <div className=" flex items-center gap-1 text-xl">
                <img src={thermometer} />
                <p className=" text-sm">{room.roomTemperature ? `${room.roomTemperature}°C` : "Unavailable"}</p>
              </div>
            </Tooltip>
            <Tooltip
              className={`px-2 py-1.5 text-center max-w-96`}
              // content={`Window: ${target.temp}`}
              content={`Window: ${room.windowOpen ? "Yes" : "No"}`}
              style="light"
            >
              <div className=" flex items-center gap-1 text-xl">
                <img src={windowicon} />
                <p className=" text-sm">{room.windowOpen ? "Yes" : "No"}</p>
              </div>
            </Tooltip>
            <Tooltip
              className={`px-2 py-1.5 text-center max-w-96`}
              // content={`Algorithm: ${target.temp}`}
              content={`Algorithm: ${room.algorithm ? "On" : "Off"}`}
              style="light"
            >
              <div className=" flex items-center gap-1 text-xl">
                <img src={algo} />
                <p className=" text-sm">{room.algorithm ? "On" : "Off"}</p>
              </div>
            </Tooltip>
            <p className=" text-sm text-primary">Program 1</p>
            <div className=" flex items-center gap-4 text-sm">
              <Button onClick={handleOpenModal} className=' hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent'>View Schedule</Button>
              <Tooltip
                className={`px-2 py-1.5 text-center min-w-32 max-w-96`}
                // content={`Algorithm: ${target.temp}`}
                content={`Edit Schedule`}
                style="light"
              >
                <div>
                  <svg onClick={handleOpenEditModal} className="cursor-pointer w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                  </svg>
                </div>
              </Tooltip>
            </div>

          </div>
          {/* <div className="flex items-center mb-2">
        <span className="text-sm text-gray-500">Today 00:00</span>
      </div> */}
          <div className='w-full relative px-4'>
            {/* Render dots for manual changes outside the h-4 container */}
            <div className=' w-full relative'>
              {room.manuallySetTemperatures && room.manuallySetTemperatures.length > 0 && room.manuallySetTemperatures.map((change, index) => (
                <div
                  key={`dot-wrapper-${index}`}
                  className="absolute"
                  style={{
                    left: `calc(${parseTimeToPercentage(change.createdAt)}% - 0.375rem)`,
                    top: `-9px`,
                    zIndex: '1', // Ensure dots are above the temperature line
                  }}
                >
                  <Tooltip
                    className={`px-2 py-1.5 text-center w-full min-w-[170px] max-w-96`}
                    content={`Manual Change: ${change.targetTemperature}°C`}
                    style="light"
                  >
                    <div
                      key={`dot-${index}`}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </Tooltip>
                </div>
              ))}
            </div>
            {/* marker  */}
            {room.heatingSchedule && room.heatingSchedule !== null && (
              <div
                key={`dot-wrapper-${1}`}
                className="absolute"
                style={{
                  left: `calc(${parseTimeToPercentage(room.heatingSchedule.currentTargetTemperature.createdAt)}% - 0.375rem)`,
                  top: `-28px`,
                  zIndex: '1', // Ensure dots are above the temperature line
                }}
              >
                <Tooltip
                  className={`px-2 py-1.5 text-center w-full min-w-[170px] max-w-96`}
                  content={`Target Temp: ${room.heatingSchedule.currentTargetTemperature.targetTemperature}°C`}
                  style="light"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div
                      key={`dot-${1}`}
                      className="py-0.5 px-1 text-[8px] text-gray-900 bg-transparent border border-red-500 rounded-full"
                    >
                      {room.heatingSchedule.currentTargetTemperature.targetTemperature}°C
                    </div>
                    <div className=" w-[1px] h-[26px] bg-red-500"></div>
                  </div>
                </Tooltip>
              </div>
            )}
            <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-transparent">
              {updatedTemperatureData.map((data, index) => (
                <div
                  key={index}
                  className={`absolute h-1.5 rounded-full`}
                  style={{
                    backgroundColor: data.color,
                    left: `${parseTimeToPercentage(data.startTime)}% `,
                    width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}% - 0.275rem)`,
                    marginLeft: index === 0 ? '0' : '0.1rem',
                    marginRight: index === updatedTemperatureData.length - 1 ? '0' : '0.45rem',
                  }}
                />
              ))}
            </div>
            <div className=' w-full absolute left-0 right-0 px-3 flex gap-1' style={{ top: `-5px` }}>
              {updatedTemperatureData.map((data, index) => (
                <div key={`separator-parent-${index}`} style={{ width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}% - 0.275rem)` }} className=' flex justify-start '>
                  <div
                    key={`separator-${index}`}
                    className=" w-[2px] h-4 bg-gray-200"
                  />
                </div>
              ))}
              {/* Render an additional div after the last index */}
              <div
                key={`separator-${updatedTemperatureData.length}`}
                className="w-[2px] h-4 bg-gray-200"
              />
            </div>

            {/* Temperature labels */}
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              {updatedTemperatureData.map((data, index) => (
                <React.Fragment key={index}>
                  <span
                    style={{
                      width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}%)`,
                      marginLeft: index === 0 ? '-16px' : '0',
                    }}
                    key={`time-${index}`}
                  >
                    {index === 0 ? "Today " : ""}{data.startTime}
                  </span>
                  {index === updatedTemperatureData.length - 1 && (
                    <span key={`time-${index + 1}`}>
                      {/* {data.endTime === '24:00' ? '00:00' : data.endTime} */}
                      23:59
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>


            <div className="flex justify-between mt-[-10px] text-sm font-semibold">
              {updatedTemperatureData.map((data, index) => (
                <span style={{ width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}%)`, color: data.textcolor }} key={`temp-${index}`} className={`${data.labelColor} flex justify-center`}>
                  {data.temp}°C
                </span>
              ))}
            </div>
          </div>
          <ViewRoomScheduleModal openModal={openModal} handleOpenModal={handleOpenModal} />
          <EditHeatingProgramModal openModal={openEditModal} handleOpenModal={handleOpenEditModal} />
        </div>
      ))}
    </>
  );
};

export default TemperatureSchedule;
