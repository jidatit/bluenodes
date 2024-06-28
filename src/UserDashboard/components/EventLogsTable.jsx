import React, { useState, useEffect } from 'react';
import { Select } from "flowbite-react";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoChevronForwardOutline } from "react-icons/io5";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoIosWarning } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { GiTireIronCross } from "react-icons/gi";

const EventLogsTable = ({tableData}) => {
    const [selectedFilter, setSelectedFilter] = useState('Last Year');
    const [selectedEvent, setSelectedEvent] = useState("All events");
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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

        const filtered = tableData.filter(item => {
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

    return (
        <div className="relative w-full overflow-x-auto bg-white shadow-md sm:rounded-lg">
            <div className='bg-gray-50 flex flex-col justify-center items-start w-full'>
                <h1 className='mx-2 my-2 font-bold text-md'>Event Logs</h1>
            </div>
            <div className="flex flex-column my-2 bg-transparent mx-2 sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between">
                {/* Filter buttons */}
                <div className='flex flex-row justify-center items-center gap-1'>
                    <Select id="dayFilter" icon={MdOutlineAccessTimeFilled} required value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                        <option className='font-semibold text-md' value="Last 30 days">Last 30 days</option>
                        <option className='font-semibold text-md' value="Last 7 days">Last 7 days</option>
                        <option className='font-semibold text-md' value="Last Month">Last Month</option>
                        <option className='font-semibold text-md' value="Last Year">Last Year</option>
                    </Select>
                    <Select id="eventFilter" required value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                        <option className='font-semibold text-md' value="Last 30 days">All events</option>
                    </Select>
                </div>
                {/* Search bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                        <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="table-search"
                        className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search for event logs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery.length > 0 && (<GiTireIronCross onClick={(e) => setSearchQuery('')} className='w-5 h-5 cursor-pointer absolute p-1 bg-gray-200 text-black rounded-full right-[7px] top-[9px] hover:scale-75 transition-all delay-100' />)}
                </div>
            </div>
            {/* Table */}
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            ROOM
                        </th>
                        <th scope="col" className="px-6 py-3">
                            BUILDING - FLOOR
                        </th>
                        <th scope="col" className="px-6 py-3">
                            DATE - TIME
                        </th>
                        <th scope="col" className="px-6 py-3">
                            EVENT TYPE
                        </th>
                        <th scope="col" className="px-6 py-3">
                            AFTER
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 &&
                        (filteredData
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.room} <span className='text-[10px] font-semibold bg-slate-200 rounded-md p-1'>Room type name</span></td>
                                    <td className="px-6 py-4">Building {item.building} -<span> Floor {item.floor}</span></td>
                                    <td className="px-6 py-4">{item.date} -<span> {item.time}</span></td>
                                    <td className="px-6 py-4 inline-flex justify-center items-center text-center gap-1">{item.event_status === "info" ? <FaCircleInfo /> : item.event_status === "warning" ? <RiErrorWarningFill className='text-yellow-500' /> : <IoIosWarning className='text-red-700' />}<span className='text-xs'>{item.event_type}</span></td>
                                    <td className="px-6 py-4 truncate">{item.after}</td>
                                </tr>
                            )))}
                </tbody>
            </table>

            {filteredData.length === 0 && (
                <>
                    <div className='w-full bg-slate-100 flex flex-col justify-center items-center'>
                        <p className='w-full text-center italic py-2 font-semibold'>No Results Found</p>
                    </div>
                </>
            )}

            <div className='w-full p-3 flex flex-row justify-between items-center'>
                {tableData && (
                    <p className='font-light text-sm text-gray-500'>
                        Showing <span className='font-bold text-black'>{startIndex}-{endIndex}</span> of <span className='font-bold text-black'>{totalItems}</span>
                    </p>
                )}

                {/* Pagination */}
                <div className="flex justify-end border rounded-md border-gray-200 w-fit">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}
                        disabled={currentPage === 1}
                    >
                        <IoChevronBackOutline />
                    </button>
                    {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
                        <button
                            key={startPage + index}
                            onClick={() => handlePageChange(startPage + index)}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === startPage + index ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' : 'text-gray-500 bg-white hover:bg-gray-100'}`}
                        >
                            {startPage + index}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}
                        disabled={currentPage === totalPages}
                    >
                        <IoChevronForwardOutline />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EventLogsTable;