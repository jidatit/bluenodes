import React, { useState, useEffect } from "react";
import thermometer from '../../../../assets/icons/thermometer-02.png';
import windowicon from '../../../../assets/icons/Window.png';
import algo from '../../../../assets/icons/algorithm.png';
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
  } else if (temp >= 10 && temp < 20) {
    return '#6EDEF4';
  } else if (temp >= 20 && temp <= 25) {
    return '#84E1BC';
  } else if (temp > 25 && temp < 30) {
    return '#FDBA8C';
  } else if (temp >= 30) {
    return '#F8B4B4';
  } else {
    return '#CFF4FB';
  }
};

const handleTextColour = (temp) => {
  if (temp < 10) {
    return '#DEF7EC';
  } else if (temp >= 10 && temp < 20) {
    return '#0BAAC9';
  } else if (temp >= 20 && temp <= 25) {
    return '#046C4E';
  } else if (temp > 25 && temp < 30) {
    return '#FDBA8C';
  } else if (temp >= 30) {
    return '#B43403';
  } else {
    return '#CFF4FB';
  }
};

// Dummy data representing temperature changes
const temperatureData = [
  { startTime: '00:00', endTime: '08:00', temp: 15 },
  { startTime: '08:00', endTime: '12:00', temp: 24 },
  { startTime: '12:00', endTime: '18:00', temp: 30 },
  { startTime: '18:00', endTime: '24:00', temp: 27 },
];

// Update the temperatureData to include colors
const updatedTemperatureData = temperatureData.map(data => ({
  ...data,
  color: handleTempColour(data.temp),
  textcolor: handleTextColour(data.temp)
}));

const parseTimeToPercentage = (timestamp) => {
  let date;

  // Try to parse the timestamp directly
  try {
    date = new Date(timestamp);
  } catch (e) {
    // Fallback if parsing fails
    return null;
  }

  // Check if the input is a time-only string
  if (!isNaN(date.getTime())) {
    // ISO 8601 timestamp or valid Date string
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const totalMinutes = hours * 60 + minutes;
    const totalSeconds = totalMinutes * 60 + seconds;
    const percentage = (totalSeconds / 86400) * 100;

    return percentage;
  } else {
    // Handle time-only string format (e.g., "23:59:00")
    const [timeString] = timestamp.split('T'); // Remove date part if present
    const [hours, minutes, seconds = '0'] = timeString.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    const totalMinutes = hours * 60 + minutes;
    const totalSeconds = totalMinutes * 60 + seconds;
    const percentage = (totalSeconds / 86400) * 100;

    return percentage;
  }
};

const TemperatureSchedule = ({ floorId }) => {
  console.log(floorId)
  const [type, setType] = useState('Resident');
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomSchedId, setSelectedRoomSchedId] = useState(null);
  const token = localStorage.getItem('token');
  const [RoomsDetail, setRoomsDetail] = useState([]);

  const handleOpenModal = (roomSchedId) => {
    setSelectedRoomSchedId(roomSchedId);
    setOpenModal(!openModal);
  };

  const handleOpenEditModal = (room) => {
    setOpenEditModal(!openEditModal);
    setSelectedRoom(room)
  }

  const getFloorDetails = async (id) => {
    try {
      const resp = await fetch(`https://api-dev.blue-nodes.app/dev/smartheating/operationaloverview/${id}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await resp.json();
      setRoomsDetail(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (floorId) {
      getFloorDetails(floorId);
    }
  }, [floorId]);

  return (
    <>
      {RoomsDetail && RoomsDetail.length > 0 ? (
        RoomsDetail.map((room, index) => (
          <div key={index} className="w-full p-4 relative rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-7 text-gray-900">
              <div className='flex items-center gap-1'>
                <span className="text-sm font-bold">{room.name}</span>
                <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${handleTypeColor(type)} rounded-[80px]`}>
                  {room.tag}
                </span>
              </div>
              <Tooltip
                className={`px-2 py-1.5 text-center max-w-96`}
                content={`Current Temp: ${room.roomTemperature ? `${room.roomTemperature}°C` : "Unavailable"}`}
                style="light"
              >
                <div className="flex items-center gap-1 text-xl">
                  <img src={thermometer} alt="Thermometer" />
                  <p className="text-sm">{room.roomTemperature ? `${room.roomTemperature}°C` : "Unavailable"}</p>
                </div>
              </Tooltip>
              <Tooltip
                className={`px-2 py-1.5 text-center max-w-96`}
                content={`Window: ${room.windowOpen ? "Yes" : "No"}`}
                style="light"
              >
                <div className="flex items-center gap-1 text-xl">
                  <img src={windowicon} alt="Window" />
                  <p className="text-sm">{room.windowOpen ? "Yes" : "No"}</p>
                </div>
              </Tooltip>
              <Tooltip
                className={`px-2 py-1.5 text-center max-w-96`}
                content={`Algorithm: ${room.algorithm ? "On" : "Off"}`}
                style="light"
              >
                <div className="flex items-center gap-1 text-xl">
                  <img src={algo} alt="Algorithm" />
                  <p className="text-sm">{room.algorithm ? "On" : "Off"}</p>
                </div>
              </Tooltip>
              <p className="text-sm text-primary">Program 1</p>
              <div className="flex items-center gap-4 text-sm">
                <Button
                  disabled={room.heatingSchedule === null}
                  onClick={() => handleOpenModal(room.heatingSchedule ? room.heatingSchedule.id : null)} // Pass the room ID here
                  className={`hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent ${room.heatingSchedule !== null && room.heatingSchedule.id ? "text-primary" : "text-gray-500"} pr-2 py-0 [&>*]:p-0 focus:ring-transparent`}
                >
                  View Schedule
                </Button>
                <Tooltip
                  className={`px-2 py-1.5 text-center min-w-32 max-w-96`}
                  content={`Edit Schedule`}
                  style="light"
                >
                  <div>
                    <svg onClick={() => handleOpenEditModal(room ? room : null)} className="cursor-pointer w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                    </svg>
                  </div>
                </Tooltip>
              </div>
            </div>
            {room.manuallySetTemperatures && room.manuallySetTemperatures.length > 0 ? (
              <div className='w-full relative px-4'>
                {/* Render dots for manual changes outside the h-4 container */}
                <div className='w-full relative'>
                  {room.manuallySetTemperatures.map((change, index) => (
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
              </div>
            ) : (
              <p className="text-center text-sm italic text-gray-600">No manually set temperatures for this room</p>
            )}
            {room.heatingSchedule && room.heatingSchedule.currentDay ? (
              <div className='w-full relative px-4'>
                {/* marker */}
                {room.heatingSchedule.currentTargetTemperature && (
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
                        <div className="w-[1px] h-[26px] bg-red-500"></div>
                      </div>
                    </Tooltip>
                  </div>
                )}

                {/* line */}
                <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-transparent">
                  {room.heatingSchedule.currentDay.map((element, index) => (
                    <div
                      key={index}
                      className={`absolute h-1.5 rounded-full`}
                      style={{
                        backgroundColor: handleTempColour(element.targetTemperature),
                        left: `${parseTimeToPercentage(element.from)}%`,
                        width: `calc(${parseTimeToPercentage(element.to) - parseTimeToPercentage(element.from)}% - 0.275rem)`,
                        marginLeft: index === 0 ? '0' : '0.1rem',
                        marginRight: index === room.heatingSchedule.currentDay.length - 1 ? '0' : '0.45rem',
                      }}
                    />
                  ))}
                </div>

                {/* Render an additional div after the last index */}
                <div className='w-full absolute left-0 right-0 px-3 flex gap-1' style={{ top: `-5px` }}>
                  {room.heatingSchedule.currentDay.map((element, index) => (
                    <div key={`separator-parent-${index}`} style={{ width: `calc(${parseTimeToPercentage(element.to) - parseTimeToPercentage(element.from)}% - 0.275rem)` }} className='flex justify-start'>
                      <div
                        key={`separator-${index}`}
                        className="w-[2px] h-4 bg-gray-200"
                      />
                    </div>
                  ))}
                  <div
                    key={`separator-${updatedTemperatureData.length}`}
                    className="w-[2px] h-4 bg-gray-200"
                  />
                </div>

                {/* Temperature labels */}
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  {room.heatingSchedule.currentDay.map((element, index) => (
                    <React.Fragment key={index}>
                      <span
                        style={{
                          width: `calc(${parseTimeToPercentage(element.to) - parseTimeToPercentage(element.from)}%)`,
                          marginLeft: index === 0 ? '-16px' : '0',
                        }}
                        key={`time-${index}`}
                      >
                        {index === 0 ? "Today " : ""}{element.from}
                      </span>
                      {index === room.heatingSchedule.currentDay.length - 1 && (
                        <span key={`time-${index + 1}`}>
                          {element.to === '24:00' ? '00:00' : element.to}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex justify-between mt-[-10px] text-sm font-semibold">
                  {room.heatingSchedule.currentDay.map((element, index) => (
                    <span style={{ width: `calc(${parseTimeToPercentage(element.to) - parseTimeToPercentage(element.from)}%)`, color: handleTextColour(element.targetTemperature) }} key={`temp-${index}`} className={`${handleTextColour(element.targetTemperature)} flex justify-center`}>
                      {element.targetTemperature}°C
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-sm italic text-gray-600">No heating schedule for this room</p>
            )}
            {room.heatingSchedule !== null && room.heatingSchedule.id && openModal && (
              <ViewRoomScheduleModal
                openModal={openModal}
                handleOpenModal={handleOpenModal}
                algo={room.algorithm}
                heatingScheduleId={selectedRoomSchedId}
              />
            )}
            <EditHeatingProgramModal
              fetchFloorDetails={getFloorDetails}
              openModal={openEditModal}
              handleOpenModal={handleOpenEditModal}
              room={selectedRoom} />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600">No rooms available</p>
      )}
    </>
  );
};

export default TemperatureSchedule;
