/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Button, Select } from "flowbite-react";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoChevronForwardOutline } from "react-icons/io5";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoIosWarning } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { GiTireIronCross } from "react-icons/gi";
import { fetchUnassignedRoomsData } from '../data/Statuspageapis';
import { TreeSelect } from 'primereact/treeselect';
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL";
import { MultiSelect } from 'primereact/multiselect';
import DateFilter from "./dateFilter/DateFilter";

const UnassignedTable = () => {

    const [selectedEventFilters, setSelectedEventFilters] = useState(null);
    const [ApiLocationsToBeSend, setApiLocationsToBeSend] = useState(null);
    const eventFilterOptions = [
        { name: 'Information', code: 'info' },
        { name: 'Error', code: 'err' },
        { name: 'Warning', code: 'warn' },
        { name: 'Behoben', code: 'beh' },
    ];

    const [LocationsData, setLocationsData] = useState([]);

    const transformData = (nodes) => {
        return nodes.map(node => {
            const key = node.children.length > 0
                ? node.id.toString()
                : `room${node.id}`;

            const transformedNode = {
                key: key,
                label: node.name,
            };

            if (node.children.length > 0) {
                transformedNode.children = transformData(node.children);
            }

            return transformedNode;
        });
    };

    const getAllLocations = async () => {
        try {
            const data = await axios.get(ApiUrls.SMARTHEATING_LOCATIONS.LIST);
            const transformedData = transformData(data.data)
            setLocationsData(transformedData)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getAllLocations()
    }, [])

    const [tableData, setTableData] = useState([])
    // const [selectedFilter, setSelectedFilter] = useState('Last Year');
    // const [selectedEvent, setSelectedEvent] = useState("All events");
    // const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0)

    const itemsPerPage = 10;

    const [selectedKeys, setSelectedKeys] = useState({});
    const [selectedRoomIds, setSelectedRoomIds] = useState(new Set());

    const getAllKeys = (node) => {
        let keys = [node.key];
        if (node.children) {
            for (const child of node.children) {
                keys = [...keys, ...getAllKeys(child)];
            }
        }
        return keys;
    };

    const updateSelection = (newSelectedKeys) => {
        let newSelectedRoomIds = new Set([...selectedRoomIds]);

        // Update selection state
        const updatedKeys = { ...selectedKeys };

        // Add new selections
        Object.keys(newSelectedKeys).forEach((key) => {
            const node = findNodeByKey(key, LocationsData);
            if (node) {
                const allKeys = getAllKeys(node);
                allKeys.forEach((childKey) => {
                    updatedKeys[childKey] = true;
                    if (childKey.startsWith('room')) {
                        newSelectedRoomIds.add(childKey);
                    }
                });
            }
        });

        // Remove unselected keys
        Object.keys(selectedKeys).forEach((key) => {
            if (!newSelectedKeys[key]) {
                const node = findNodeByKey(key, LocationsData);
                if (node) {
                    const allKeys = getAllKeys(node);
                    allKeys.forEach((childKey) => {
                        delete updatedKeys[childKey];
                        if (childKey.startsWith('room')) {
                            newSelectedRoomIds.delete(childKey);
                        }
                    });
                }
            }
        });

        // Check if any children are still selected for a parent
        Object.keys(updatedKeys).forEach((key) => {
            const node = findNodeByKey(key, LocationsData);
            if (node && node.children) {
                const anyChildSelected = node.children.some(child => updatedKeys[child.key]);
                if (!anyChildSelected) {
                    delete updatedKeys[node.key];
                }
            }
        });

        setSelectedKeys(updatedKeys);
        setSelectedRoomIds(newSelectedRoomIds);
        const locations = Array.from(newSelectedRoomIds);
        const transformedArray = locations && locations.map(item => parseInt(item.replace('room', ''), 10));
        if (transformedArray.length > 0) {
            const sep_locations = transformedArray.join(',');
            setApiLocationsToBeSend(sep_locations)
        } else {
            getData() // no locations to send thats why empty parameter.
        }
    };

    const onNodeSelectChange = (e) => {
        const newSelectedKeys = e.value;
        updateSelection(newSelectedKeys);
    };

    const findNodeByKey = (key, nodes) => {
        for (const node of nodes) {
            if (node.key === key) {
                return node;
            }
            if (node.children) {
                const childNode = findNodeByKey(key, node.children);
                if (childNode) {
                    return childNode;
                }
            }
        }
        return null;
    };

    const getData = async (locations) => {
        try {
            const eventTypeLevel = selectedEventFilters !== null && selectedEventFilters.map(filter => filter.name).join(',') || null;
            const data = await fetchUnassignedRoomsData(currentPage, itemsPerPage, locations, eventTypeLevel, dateTo, dateFrom);
            setTotalRows(data.count)
            setTableData(data.rows);
        } catch (error) {
            console.log(error)
        }
    }
    const [dateTo, setdateTo] = useState(null);
    const [dateFrom, setdateFrom] = useState(null);
    useEffect(() => {
        getData()
    }, [currentPage])

    useEffect(() => {
        getData(ApiLocationsToBeSend, selectedEventFilters);
    }, [ApiLocationsToBeSend, selectedEventFilters, dateTo, dateFrom])

    const totalItems = totalRows && totalRows;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const paginationRange = 1;

    let startPage = Math.max(1, currentPage - paginationRange);
    let endPage = Math.min(totalPages, currentPage + paginationRange);

    const formatDateforApitosend = (date) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('en-GB', options).format(date).split('/').reverse().join('-');
    };

    const handleDatesChange = (newDates) => {
        if (!newDates || !newDates[0]) {
            console.log('cleared');
            setdateFrom(null)
            setdateTo(null)
            return;
        }
        if (newDates[0] && newDates[1]) {
            let from = newDates[0] && formatDateforApitosend(new Date(newDates[0]));
            setdateFrom(from);
            let to = newDates[1] && formatDateforApitosend(new Date(newDates[1]));
            setdateTo(to);
        }
    };

    return (
        <div className=' flex flex-col gap-4 w-full'>
            <div className='flex flex-col justify-center items-start w-full'>
                <h1 className=' font-[500] text-lg text-gray-900'>Rooms Unassigned</h1>
            </div>
            <div className="relative w-full overflow-x-auto bg-white shadow-md sm:rounded-lg">
                <div className="flex flex-column my-2 bg-transparent mx-2 sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between">
                    {/* Filter buttons */}
                    <div className='flex flex-row justify-center items-center gap-1'>
                        <TreeSelect
                            value={selectedKeys}
                            options={LocationsData}
                            onChange={onNodeSelectChange}
                            className="md:w-20rem w-full"
                            selectionMode="multiple"
                            placeholder="All Buildings"
                            display="chip"
                            filter
                            filterPlaceholder="Search"
                        />
                        {/* <MultiSelect value={selectedEventFilters} onChange={(e) => setSelectedEventFilters(e.value)} showSelectAll={false} options={eventFilterOptions} optionLabel="name"
                            filter placeholder="All Events" display="chip" className="w-full md:w-20rem" />

                        <DateFilter onDatesChange={handleDatesChange} /> */}

                    </div>

                </div>
                {/* Table */}
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr className=' uppercase'>
                            <th scope="col" className="p-4 w-[20%]">
                                ID
                            </th>
                            <th scope="col" className="p-4 w-[30%]">
                                ROOM
                            </th>
                            <th scope="col" className="p-4 w-[60%]">
                                BUILDING - FLOOR
                            </th>
                            <th scope="col" className="p-4">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length > 0 &&
                            tableData.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.id ? item.id : "N/A"}
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name ? item.name : "N/A"} <span className='text-[12px] py-0.5 px-2.5 font-semibold bg-gray-100 rounded-[80px] p-1'>{item.tag ? item.tag : "N/A"}</span></td>
                                    <td className="px-4 py-4">{item.building_floor_string ? item.building_floor_string : "N/A"}</td>
                                    <td className="px-4 py-4">
                                        <Button className=' hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent'>Assign</Button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {tableData.length === 0 && (
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
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-primary bg-[#CFF4FB] hover:bg-primary-300'}`}
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
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === startPage + index ? 'text-primary bg-[#CFF4FB] hover:bg-primary-300' : 'text-gray-500 bg-white hover:bg-gray-100'}`}
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
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100'}`}
                                disabled={currentPage === totalPages}
                            >
                                {totalPages}
                            </button>
                        )}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-primary bg-[#CFF4FB] hover:bg-primary-300'}`}
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

export default UnassignedTable;