import React, { useState, useEffect } from 'react';
import { Accordion, Pagination, Select, Tooltip } from 'flowbite-react';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { MdOutlineAccessTimeFilled } from 'react-icons/md';
import { FaCircleInfo, FaRegCircleCheck } from 'react-icons/fa6';
import { RiErrorWarningFill } from 'react-icons/ri';
import { IoIosWarning } from 'react-icons/io';
import { GiTireIronCross } from 'react-icons/gi';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { BsFillCalendarDateFill } from "react-icons/bs";
import BatteryFull from '../../../../assets/battery-icons/battery-100.png';
import BatteryHigh from '../../../../assets/battery-icons/battery-76.png';
import BatteryMedium from '../../../../assets/battery-icons/battery-51.png';
import BatteryLow from '../../../../assets/battery-icons/battery-26.png';
import BatteryEmpty from '../../../../assets/battery-icons/battery-0.png';
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import ThermometerIcon from '../../../../assets/icons/thermometer-02.png';
import HumidityIcon from '../../../../assets/icons/humidity.png';
import ValvePositionIcon from '../../../../assets/icons/pipe.png';
import ChildLockIcon from '../../../../assets/icons/user-key.png';
import ErrorIcon from '../../../../assets/icons/bell.png';
import OpenCloseWindowIcon from '../../../../assets/icons/Window.png'
import LightIntensityIcon from '../../../../assets/icons/light.png';
import MovementIcon from '../../../../assets/icons/movement.png';

const getBatteryImage = (battery_level) => {
  const level = parseInt(battery_level);
  if (level === 100) {
    return BatteryFull;
  } else if (level >= 76) {
    return BatteryHigh;
  } else if (level >= 51) {
    return BatteryMedium;
  } else if (level >= 26) {
    return BatteryLow;
  } else {
    return BatteryEmpty;
  }
};

const OfflineTable = ({ tableData }) => {
  const [selectedFilter, setSelectedFilter] = useState('Last Year');
  const [selectedEvent, setSelectedEvent] = useState('All events');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const itemsPerPage = 10;
  const totalItems = filteredData && filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    filterData();
  }, [selectedFilter, searchQuery]);

  const filterData = () => {
    let currentDate = new Date();
    let startDate = new Date();
    switch (selectedFilter) {
      case 'Last 7 days':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'Last 30 days':
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case 'Last Month':
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'Last Year':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        break;
    }

    const filtered = tableData.filter((item) => {
      let eventDate = new Date(item.date + ' ' + item.time);
      return (
        eventDate >= startDate &&
        eventDate <= currentDate &&
        (item.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.event_type.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const paginationRange = 1;

  let startPage = Math.max(1, currentPage - paginationRange);
  let endPage = Math.min(totalPages, currentPage + paginationRange);

  const handleRowClick = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };


  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col justify-center items-start w-full">
        <h1 className="font-[500] text-lg text-gray-900">Devices Offline</h1>
      </div>
      <div className="relative w-full overflow-x-auto bg-white shadow-md sm:rounded-lg">
        <div className="flex flex-column my-2 bg-transparent mx-2 sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between">
          {/* Filter buttons */}
          <div className="flex flex-row justify-center items-center gap-1">
            <Select
              id="dayFilter"
              icon={MdOutlineAccessTimeFilled}
              required
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option className="text-md" value="Last 30 days">
                Last 30 days
              </option>
              <option className="text-md" value="Last 7 days">
                Last 7 days
              </option>
              <option className="text-md" value="Last Month">
                Last Month
              </option>
              <option className="text-md" value="Last Year">
                Last Year
              </option>
            </Select>
            <Select
              id="eventFilter"
              required
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option className="font-semibold text-md" value="Last 30 days">
                All events
              </option>
            </Select>
          </div>
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
              {/* <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" /> */}
            </div>
            <input
              type="text"
              id="table-search"
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search for event logs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <GiTireIronCross
                onClick={(e) => setSearchQuery('')}
                className="w-5 h-5 cursor-pointer absolute p-1 bg-gray-200 text-black rounded-full right-[7px] top-[9px] hover:scale-75 transition-all delay-100"
              />
            )}
          </div>
        </div>
        {/* Table */}
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr className="uppercase">
              <th></th>
              <th scope="col" className="p-4">
                device id
              </th>
              <th scope="col" className="p-4">
                device type
              </th>
              <th scope="col" className="p-4">
                BUILDING - FLOOR
              </th>
              <th scope="col" className="p-4">
                ROOM
              </th>
              <th scope="col" className="p-4">
                DATE - TIME occurred
              </th>
              <th scope="col" className="p-4">
                battery level
              </th>
              <th scope="col" className="p-4">
                status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 &&
              filteredData
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((item, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <td onClick={() => handleRowClick(index)} > {expandedRow === index ? <FaChevronUp /> : <FaChevronDown />}  </td>
                      <td className="px-4 py-4 truncate">{item.device_id}</td>
                      <td className="px-4 py-4 truncate">{item.type}</td>
                      <td className="px-4 py-4">
                        Building {item.building} -<span> Floor {item.floor}</span>
                      </td>
                      <td className="px-4 py-4">{item.room}</td>
                      <td className="px-4 py-4">
                        {item.date} -<span> {item.time}</span>
                      </td>
                      <td className="px-4 py-4 truncate">
                        <Tooltip className="p-3" content={`${item.battery_level}%`} style="light" animation="duration-500">
                          <div className="flex items-center gap-1">
                            <img src={getBatteryImage(item.battery_level)} alt="Battery Level" className="w-4 h-4 mr-2" />
                            {parseInt(item.battery_level) < 26 && (
                              <p className="text-base font-bold text-red-500">Low Battery</p>
                            )}
                          </div>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-4 truncate">
                        <div
                          className={`py-0.5 px-2.5 rounded-md flex items-center justify-center gap-1 w-fit ${item.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-900'
                            } text-[10px]`}
                        >
                          {item.status === 'online' ? <FaRegCircleCheck /> : <AiOutlineExclamationCircle />}
                          <p className="text-xs font-medium">{item.status}</p>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === index && (
                      <tr className="w-full bg-gray-100 dark:bg-gray-700">
                        <td colSpan="8" className="w-full p-6">

                          {item.type === 'Type A' &&
                            <div className='flex flex-row justify-around items-start px-2 gap-24'>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={ThermometerIcon} alt="Thermometer Icon" />
                                <h2> Target Temprature </h2>
                                <h1 className='text-black font-medium text-base'> Manual · 20°C </h1>
                                <h2> Current Temprature </h2>
                                <h1 className='text-black font-medium text-base'> 20 °C</h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={HumidityIcon} alt="Humidity Icon" />
                                <h2> Current humidity </h2>
                                <h1 className='text-black font-medium text-base'> 20 °C</h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={LightIntensityIcon} alt="Light Intensity Icon" />
                                <h2> Light intensity </h2>
                                <h1 className='text-black font-medium text-base'> 120 </h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={MovementIcon} alt="Movement Icon" />
                                <h2> Movement detected </h2>
                                <h1 className='text-black font-medium text-base'> 120 </h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={ErrorIcon} alt="Error Icon" />
                                <h2> Error</h2>
                                <h1 className='text-black font-medium text-base'> - </h1>
                                <h2> Date/time of data packet </h2>
                                <h1 className='text-black font-medium text-base'> - </h1>
                              </div>
                            </div>
                          }

                          {item.type === 'Type B' &&
                            <div className='flex flex-row justify-around items-start px-2 gap-24'>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={ThermometerIcon} alt="Thermometer Icon" />
                                <h2> Target Temprature </h2>
                                <h1 className='text-black font-medium text-base'> Manual · 20°C </h1>
                                <h2> Current Temprature </h2>
                                <h1 className='text-black font-medium text-base'> 20 °C</h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={HumidityIcon} alt="Humidity Icon" />
                                <h2> Current humidity </h2>
                                <h1 className='text-black font-medium text-base'> 20 °C</h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={ValvePositionIcon} alt="Valve Position Icon" />
                                <h2> Valve position in % </h2>
                                <h1 className='text-black font-medium text-base'> 20% </h1>
                                <h2> Valve position in steps </h2>
                                <h1 className='text-black font-medium text-base'> 123 </h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={ChildLockIcon} alt="Child Lock Icon" />
                                <h2> Child lock</h2>
                                <h1 className='text-black font-medium text-base'> Yes </h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={ErrorIcon} alt="Error Icon" />
                                <h2> Error</h2>
                                <h1 className='text-black font-medium text-base'> - </h1>
                                <h2> Date/time of data packet </h2>
                                <h1 className='text-black font-medium text-base'> - </h1>
                              </div>
                            </div>
                          }

                          {item.type === 'Type C' &&
                            <div className='flex flex-row justify-start items-start px-5 gap-52'>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={OpenCloseWindowIcon} alt="Open Close Window Icon" />
                                <h2> Open/close </h2>
                                <h1 className='text-black font-medium text-base'> Open </h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <img src={ErrorIcon} alt="Error Icon" />
                                <h2> Error </h2>
                                <h1 className='text-black font-medium text-base'> - </h1>
                              </div>
                              <div className='flex flex-col justify-start items-start gap-2'>
                                <BsFillCalendarDateFill className='text-2xl' />
                                <h2> Date/time of data packet </h2>
                                <h1 className='text-black font-medium text-base'> - </h1>
                              </div>
                            </div>
                          }

                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="w-full bg-slate-100 flex flex-col justify-center items-center">
            <p className="w-full text-center italic py-2 font-semibold">No Results Found</p>
          </div>
        )}

        <div className="w-full p-3 flex flex-row justify-between items-center">
          {tableData && (
            <p className="font-light text-sm text-gray-500">
              Showing{' '}
              <span className="font-bold text-black">
                {startIndex}-{endIndex}
              </span>{' '}
              of <span className="font-bold text-black">{totalItems}</span>
            </p>
          )}

          {/* Pagination */}
          <div className="flex justify-end border rounded-md border-gray-200 w-fit">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-primary bg-[#CFF4FB] hover:bg-primary-300'
                }`}
              disabled={currentPage === 1}
            >
              <IoChevronBackOutline />
            </button>
            {startPage > 1 && (
              <button
                onClick={() => handlePageChange(1)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm text-gray-500 bg-white hover:bg-gray-100"
              >
                1
              </button>
            )}
            {startPage > 2 && (
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm text-gray-500 bg-white">
                ...
              </span>
            )}
            {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
              <button
                key={startPage + index}
                onClick={() => handlePageChange(startPage + index)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === startPage + index
                  ? 'text-primary bg-[#CFF4FB] hover:bg-primary-300'
                  : 'text-gray-500 bg-white hover:bg-gray-100'
                  }`}
              >
                {startPage + index}
              </button>
            ))}
            {endPage < totalPages - 1 && (
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm text-gray-500 bg-white">
                ...
              </span>
            )}
            {endPage < totalPages && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100'
                  }`}
                disabled={currentPage === totalPages}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-primary bg-[#CFF4FB] hover:bg-primary-300'
                }`}
              disabled={currentPage === totalPages}
            >
              <IoChevronForwardOutline />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineTable;