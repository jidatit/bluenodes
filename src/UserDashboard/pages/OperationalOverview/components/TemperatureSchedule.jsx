import { useEffect, useRef, useState } from "react";
import thermometer from "../../../../assets/icons/thermometer-02.png";
import windowicon from "../../../../assets/icons/Window.png";
import { Button, Tooltip } from "flowbite-react";
import { ViewRoomScheduleModal } from "./ViewRoomScheduleModal";
import EditHeatingProgramModal from "./EditHeatingProgramModal";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";

// Function to determine color based on temperature
const handleTempColour = (temp) => {
  if (temp < 10) {
    return "#DEF7EC";
  } else if (temp >= 10 && temp < 20) {
    return "#6EDEF4";
  } else if (temp >= 20 && temp <= 25) {
    return "#84E1BC";
  } else if (temp > 25 && temp < 30) {
    return "#FDBA8C";
  } else if (temp >= 30) {
    return "#F8B4B4";
  } else {
    return "#CFF4FB";
  }
};

const handleTextColour = (temp) => {
  if (temp < 10) {
    return "#DEF7EC";
  } else if (temp >= 10 && temp < 20) {
    return "#0BAAC9";
  } else if (temp >= 20 && temp <= 25) {
    return "#046C4E";
  } else if (temp > 25 && temp < 30) {
    return "#FDBA8C";
  } else if (temp >= 30) {
    return "#B43403";
  } else {
    return "#CFF4FB";
  }
};

// Dummy data representing temperature changes
const temperatureData = [
  { startTime: "00:00", endTime: "08:00", temp: 15 },
  { startTime: "08:00", endTime: "12:00", temp: 24 },
  { startTime: "12:00", endTime: "18:00", temp: 30 },
  { startTime: "18:00", endTime: "24:00", temp: 27 },
];

// Update the temperatureData to include colors
const updatedTemperatureData = temperatureData.map((data) => ({
  ...data,
  color: handleTempColour(data.temp),
  textcolor: handleTextColour(data.temp),
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
    const [timeString] = timestamp.split("T"); // Remove date part if present
    const [hours, minutes, seconds = "0"] = timeString.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }
    const totalMinutes = hours * 60 + minutes;
    const totalSeconds = totalMinutes * 60 + seconds;
    const percentage = (totalSeconds / 86400) * 100;
    return percentage;
  }
};

const TemperatureSchedule = ({
  floorId,
  accordianOpened,
  accordianOpened2,
  setaccordianOpened2,
  setaccordianOpened,
}) => {
  const convertUTCToGermanTime = (utcDateTimeString) => {
    const date = new Date(utcDateTimeString);

    // Manually format the date and time in German timezone
    const options = {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    // Extract year, month, day, hour, minute, second using Intl.DateTimeFormat
    const dateFormatter = new Intl.DateTimeFormat("de-DE", options);
    const parts = dateFormatter.formatToParts(date);

    const year = parts.find((part) => part.type === "year").value;
    const month = parts.find((part) => part.type === "month").value;
    const day = parts.find((part) => part.type === "day").value;
    const hour = parts.find((part) => part.type === "hour").value;
    const minute = parts.find((part) => part.type === "minute").value;
    const second = parts.find((part) => part.type === "second").value;

    // Extract milliseconds from the original UTC string
    const milliseconds = utcDateTimeString.split(".")[1].replace("Z", "");

    // Construct the final date-time string in ISO format
    const formattedDateTime = `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}Z`;
    return formattedDateTime;
  };

  const processRoomsData = (roomsData) => {
    return roomsData.map((room) => {
      if (room.heatingSchedule) {
        room.heatingSchedule.currentTargetTemperature.createdAt =
          convertUTCToGermanTime(
            room.heatingSchedule.currentTargetTemperature.createdAt
          );
      }

      if (room.manuallySetTemperatures) {
        room.manuallySetTemperatures = room.manuallySetTemperatures.map(
          (temp) => {
            temp.createdAt = convertUTCToGermanTime(temp.createdAt);
            return temp;
          }
        );
      }

      return room;
    });
  };

  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomSchedId, setSelectedRoomSchedId] = useState(null);
  const [selectedRoomAlgo, setSelectedRoomAlgo] = useState(false);
  const [RoomsDetail, setRoomsDetail] = useState([]);
  const [scheduleDetails, setscheduleDetails] = useState([]);
  const [roomName, setroomName] = useState("");
  const isFirstRender = useRef(true);
  const isFirstRender2 = useRef(true);

  const handleOpenModal = (roomSchedId) => {
    setSelectedRoomSchedId(roomSchedId);
    setOpenModal(!openModal);
  };
  const handleOpenEditModal = (room) => {
    setOpenEditModal(!openEditModal);
    setSelectedRoom(room);
  };
  const fetchHeatingScheduleForRoom = async (heatingScheduleId) => {
    try {
      const resp = await axios.get(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(
          heatingScheduleId
        )
      );
      return await resp.data;
    } catch (error) {
      console.error("Error fetching heating schedule:", error);
      return null;
    }
  };

  const [fetch1, setfetch1] = useState(false);
  const updateReplacedF = async () => {
    setfetch1(true);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      if (fetch1 === true) {
        getFloorDetails(floorId);
        fetchSchedules();
        setfetch1(false);
      }
    }
  }, [fetch1]);

  useEffect(() => {
    if (RoomsDetail.length) {
      fetchSchedules(); // Trigger fetchSchedules when RoomsDetail updates
    }
  }, [RoomsDetail]); // Use RoomsDetail as a dependency

  const fetchedScheduleIds = new Set();

  const fetchSchedules = async () => {
    if (!RoomsDetail.length) return;

    const updatedRooms = await Promise.all(
      RoomsDetail.map(async (room) => {
        if (room.heatingSchedule) {
          // Check if schedule has already been fetched
          if (!fetchedScheduleIds.has(room.heatingSchedule.id)) {
            // Fetch schedule if it hasn't been fetched before
            const schedule = await fetchHeatingScheduleForRoom(
              room.heatingSchedule.id
            );
            fetchedScheduleIds.add(room.heatingSchedule.id); // Mark ID as fetched
            // Store schedule with the room's heatingSchedule.id
            fetchedScheduleIds[room.heatingSchedule.id] = schedule;
          }
          // Assign the fetched schedule to the room
          return {
            ...room,
            schedule: fetchedScheduleIds[room.heatingSchedule.id],
          };
        }
        return room;
      })
    );
    setscheduleDetails(updatedRooms); // Update schedule details
  };

  const getFloorDetails = async (id) => {
    try {
      const resp = await axios.get(
        ApiUrls.SMARTHEATING_OPERATIONALVIEW.DETAILS(id)
      );
      const data = await resp.data;
      const pdata = processRoomsData(data);
      setRoomsDetail(pdata); // This will automatically trigger fetchSchedules via useEffect
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      if (accordianOpened === true) {
        getFloorDetails(floorId);
        fetchSchedules();
        setaccordianOpened(false);
      }
    }
  }, [accordianOpened]);

  useEffect(() => {
    if (isFirstRender2.current) {
      isFirstRender2.current = false;
    } else {
      if (accordianOpened2 === true) {
        fetchSchedules();
        setaccordianOpened2(false);
      }
    }
  }, [accordianOpened2]);

  const formatTime = (time) => {
    // Extract hours and minutes from the time string
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      {RoomsDetail && RoomsDetail.length > 0 ? (
        RoomsDetail.map((room, index) => (
          <div
            key={index}
            className="relative w-full p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-12 text-gray-900 md:gap-4 2xl:mb-10">
              <div className="flex flex-wrap items-center gap-2 w-full 2xl:w-[22%]  2xl:mr-0 ">
                <Tooltip content={room.name} style="light">
                  <span className="text-sm font-bold block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {room.name && room.name.length > 40
                      ? room.name.slice(0, 40) + "..."
                      : room.name}
                  </span>
                </Tooltip>
              </div>
              <div className=" flex  items-center gap-4 justify-start w-auto 2xl:w-[25%] 2xl:gap-10">
                <Tooltip
                  className={`px-2 py-1.5 text-center max-w-xs`}
                  content={`Raumtemperatur: ${
                    room.roomTemperature ? `${room.roomTemperature}°C` : "Unset"
                  }`}
                  style="light"
                >
                  <div className="flex items-center gap-2 text-xl ">
                    <img src={thermometer} alt="Thermometer" />
                    <p className="text-sm w-[80px]">
                      {room.roomTemperature
                        ? `${room.roomTemperature.toFixed(1)}°C`
                        : "nicht vorhanden"}
                    </p>
                  </div>
                </Tooltip>

                <Tooltip
                  className={`px-2 py-1.5 text-center max-w-xs`}
                  content={`Fenster ist ${room.windowOpen ? "offen" : "zu"}`}
                  style="light"
                >
                  <div className="flex items-center w-full gap-2 text-xl ">
                    <img src={windowicon} alt="Window" />
                    <p className="text-sm w-[45px]">
                      {room.windowOpen ? "offen" : "zu"}
                    </p>
                  </div>
                </Tooltip>
              </div>

              <div className="w-auto 2xl:w-[30%] flex justify-end">
                <Tooltip
                  content={
                    scheduleDetails[index]?.schedule?.templateName || "None"
                  }
                  style="light"
                >
                  <p
                    className="text-sm text-primary"
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {scheduleDetails[index]?.schedule?.templateName
                      ? scheduleDetails[index].schedule.templateName.length > 50
                        ? `${scheduleDetails[index].schedule.templateName.slice(
                            0,
                            50
                          )}...`
                        : scheduleDetails[index].schedule.templateName
                      : "None"}
                  </p>
                </Tooltip>
              </div>

              <div className="flex items-center justify-end gap-4 text-sm xl:w-[20%] 2xl:w-[15%]">
                <Button
                  disabled={room.heatingSchedule === null}
                  onClick={() => {
                    handleOpenModal(
                      room.heatingSchedule ? room.heatingSchedule.id : null
                    );
                    setSelectedRoomAlgo(
                      room.algorithm && room.algorithm ? true : false
                    );
                    setroomName(room.name);
                    setSelectedRoom(room);
                  }}
                  className={`hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent ${
                    room.heatingSchedule !== null && room.heatingSchedule.id
                      ? "text-primary"
                      : "text-gray-500"
                  } pr-2 py-0 [&>*]:p-0 focus:ring-transparent`}
                >
                  Heizplan ansehen
                </Button>

                <Tooltip
                  className={`px-2 py-1.5 text-center whitespace-nowrap max-w-xs`}
                  content={`Heizplan bearbeiten`}
                  style="light"
                >
                  <div>
                    <svg
                      onClick={() => {
                        if (room.heatingSchedule !== null)
                          handleOpenEditModal(room ? room : null);
                      }}
                      className={`cursor-pointer w-6 h-6  dark:text-white ${
                        room.heatingSchedule !== null && room.heatingSchedule.id
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                      />
                    </svg>
                  </div>
                </Tooltip>
              </div>
            </div>

            {room.manuallySetTemperatures &&
              room.manuallySetTemperatures.length > 0 && (
                <div className="relative w-full px-4">
                  {/* Render dots for manual changes outside the h-4 container */}
                  <div className="relative w-full">
                    {room.manuallySetTemperatures.map((change, index) => (
                      <div
                        key={`dot-wrapper-${index}`}
                        className="absolute"
                        style={{
                          left: `calc(${parseTimeToPercentage(
                            change.createdAt
                          )}% + 0.215rem)`,
                          top: `-9px`,
                          zIndex: "1", // Ensure dots are above the temperature line
                        }}
                      >
                        <Tooltip
                          className={`px-2 py-1.5 text-center w-full min-w-[170px] max-w-xs`}
                          content={`Raumnutzer änderte Soll-Temperatur auf ${change.targetTemperature}°C`}
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
              )}
            {room.heatingSchedule && room.heatingSchedule.currentDay ? (
              <div className="relative w-full px-4">
                {/* marker */}
                {room.heatingSchedule.currentTargetTemperature && (
                  <div
                    key={`dot-wrapper-${1}`}
                    className="absolute"
                    style={{
                      left: `calc(${parseTimeToPercentage(
                        room.heatingSchedule.currentTargetTemperature.createdAt
                      )}% - 0.575rem)`,
                      top: `-28px`,
                      zIndex: "1", // Ensure dots are above the temperature line
                    }}
                  >
                    <Tooltip
                      className={`px-2 py-1.5 text-center w-full min-w-[170px] max-w-96`}
                      content={`Soll-Temperatur: ${room.heatingSchedule.currentTargetTemperature.targetTemperature}°C`}
                      style="light"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div
                          key={`dot-${1}`}
                          className="py-0.5 px-1 text-[8px] text-gray-900 bg-transparent border border-red-500 rounded-full"
                        >
                          {
                            room.heatingSchedule.currentTargetTemperature
                              .targetTemperature
                          }
                          °C
                        </div>
                        <div className="w-[1px] h-[26px] bg-red-500"></div>
                      </div>
                    </Tooltip>
                  </div>
                )}

                {/* line */}
                <div className="relative flex w-full h-1.5 rounded-full  bg-transparent">
                  <div
                    key={`separator-${index}`}
                    className="w-[2px] h-4 -ml-[3px] -mt-[4px] bg-gray-200"
                  />
                  {room.heatingSchedule.currentDay
                    .slice() // Create a shallow copy to avoid mutating the original array
                    .sort((a, b) => {
                      // Compare the `from` times
                      return a.from.localeCompare(b.from);
                    })
                    .map((element, index, array) => (
                      <>
                        <div
                          key={index}
                          className={`absolute h-1.5 rounded-full`}
                          style={{
                            backgroundColor: handleTempColour(
                              element.targetTemperature
                            ),
                            left: `${parseTimeToPercentage(element.from)}%  `,
                            width: `calc(${
                              parseTimeToPercentage(element.to) -
                              parseTimeToPercentage(element.from)
                            }% - 0.15rem)`,
                          }}
                        ></div>
                        <div
                          className=" absolute top-[-4px] flex flex-col text-sm text-gray-500 items-end ml-[2px]"
                          style={{
                            left: `${parseTimeToPercentage(element.from)}%  `,
                            width: `calc(${
                              parseTimeToPercentage(element.to) -
                              parseTimeToPercentage(element.from)
                            }% - 0.15rem)`,
                          }}
                        >
                          {/* Separator */}
                          <div
                            key={`separator-${index}`}
                            className="w-[2px] h-4 bg-gray-200"
                          />
                          {/* Time label directly under the separator */}
                          <span
                            style={{
                              position: "absolute",
                              top: "20px", // Adjust vertical spacing below the separator
                              left: `${
                                parseTimeToPercentage(element.to) -
                                  parseTimeToPercentage(element.from) <
                                5
                                  ? "-10px"
                                  : "0px"
                              }`, // Align with the left edge of the separator
                              transform: index === 0 ? "" : "translateX(-50%)",
                              whiteSpace: "nowrap", // Prevent text wrapping
                            }}
                          >
                            {index === 0 ? "Heute " : ""}
                            {formatTime(element.from)}
                          </span>
                          {index ===
                            room.heatingSchedule.currentDay.length - 1 && (
                            <span
                              style={{
                                position: "absolute",
                                top: "20px", // Adjust vertical spacing below the separator
                                right: "-35px", // Align with the left edge of the separator
                                transform:
                                  index === 0 ? "" : "translateX(-50%)",
                                whiteSpace: "nowrap", // Prevent text wrapping
                              }}
                            >
                              {index === 0 ? "Heute " : ""}
                              {formatTime(element.to)}
                            </span>
                          )}
                        </div>
                      </>
                    ))}
                </div>

                {/* Render an additional div after the last index */}

                <div className="flex justify-between mt-7 text-sm font-semibold">
                  {room.heatingSchedule.currentDay
                    .slice() // Create a shallow copy to avoid mutating the original array
                    .sort((a, b) => {
                      // Compare the `from` times
                      return a.from.localeCompare(b.from);
                    })
                    .map((element, index) => (
                      <span
                        style={{
                          width: `calc(${
                            parseTimeToPercentage(element.to) -
                            parseTimeToPercentage(element.from)
                          }%)`,
                          color: handleTextColour(element.targetTemperature),
                        }}
                        key={`temp-${index}`}
                        className={`${handleTextColour(
                          element.targetTemperature
                        )} flex justify-center`}
                      >
                        {element.targetTemperature}°C
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-center text-gray-600">
                Der Raum hat keinen Heizplan.
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-600">Keine Räume</p>
      )}

      {selectedRoomSchedId && (
        <ViewRoomScheduleModal
          openModal={openModal}
          handleOpenModal={handleOpenModal}
          algo={selectedRoomAlgo}
          heatingScheduleId={selectedRoomSchedId}
          roomName={roomName}
          room={selectedRoom}
          handleOpenEditModal={handleOpenEditModal}
        />
      )}
      {handleOpenEditModal && openEditModal && (
        <EditHeatingProgramModal
          fetchFloorDetails={getFloorDetails}
          openModal={openEditModal}
          handleOpenModal={handleOpenEditModal}
          room={selectedRoom}
          updateReplaced={updateReplacedF}
        />
      )}
    </>
  );
};

export default TemperatureSchedule;
