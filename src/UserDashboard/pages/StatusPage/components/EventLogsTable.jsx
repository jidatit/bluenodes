/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Select, Tooltip } from "flowbite-react";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoChevronForwardOutline } from "react-icons/io5";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoSearch } from "react-icons/io5";
import { IoIosWarning } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { GiTireIronCross } from "react-icons/gi";
import { fetchEventLogsData } from "../data/Statuspageapis";
import { TreeSelect } from "primereact/treeselect";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL";
import { MultiSelect } from "primereact/multiselect";
import DateFilter from "./dateFilter/DateFilter";
import "../../../../index.css";
const EventLogsTable = () => {
  const [selectedEventFilters, setSelectedEventFilters] = useState(null);
  const [ApiLocationsToBeSend, setApiLocationsToBeSend] = useState(null);
  const [apiLocationsToBeSendCounter, setApiLocationsToBeSendCounter] =
    useState(null);
  const [closeDateFilter, setCloseDateFilter] = useState(false);
  const [FirstApiStatus, setFirstApiStatus] = useState(false);
  const [treeSelectOpen, setTreeSelectOpen] = useState(false);
  const handleTreeSelectClick = () => {
    setCloseDateFilter(true);

    // Additional logic for TreeSelect click if needed
  };
  const handleMultiSelectClick = () => {
    console.log("heyy");
    setCloseDateFilter(true);
    setdateFrom(null);
    setdateTo(null);
  };
  const eventFilterOptions = [
    { name: "Information", code: "info" },
    { name: "Error", code: "err" },
    { name: "Warning", code: "warn" },
    { name: "Behoben", code: "beh" },
  ];
  const [LocationsData, setLocationsData] = useState([]);
  const transformData = (nodes) => {
    return nodes.map((node) => {
      const key =
        node.children.length > 0 ? node.id.toString() : `room${node.id}`;

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
      const transformedData = transformData(data.data);
      setFilteredLocations(transformedData);
      setLocationsData(transformedData);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllLocations();
  }, []);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
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
          if (childKey.startsWith("room")) {
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
            if (childKey.startsWith("room")) {
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
        const anyChildSelected = node.children.some(
          (child) => updatedKeys[child.key]
        );
        if (!anyChildSelected) {
          delete updatedKeys[node.key];
        }
      }
    });

    setSelectedKeys(updatedKeys);
    setSelectedRoomIds(newSelectedRoomIds);
    const locations = Array.from(newSelectedRoomIds);
    const transformedArray =
      locations &&
      locations.map((item) => parseInt(item.replace("room", ""), 10));
    if (transformedArray.length > 0) {
      const sep_locations = transformedArray.join(",");

      setApiLocationsToBeSend(sep_locations);
      setApiLocationsToBeSendCounter(apiLocationsToBeSendCounter + 1);
    } else {
      getData();
    }
  };

  const onNodeSelectChange = (e) => {
    const newSelectedKeys = e.value;
    setCloseDateFilter(false);
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
      const eventTypeLevel =
        (selectedEventFilters !== null &&
          selectedEventFilters.map((filter) => filter.name).join(",")) ||
        null;
      const data = await fetchEventLogsData(
        currentPage,
        itemsPerPage,
        locations,
        eventTypeLevel,
        dateTo,
        dateFrom
      );
      setTotalRows(data.count);
      setTableData(data.rows);
    } catch (error) {
      console.log(error);
    }
  };

  const [dateTo, setdateTo] = useState(null);
  const [dateFrom, setdateFrom] = useState(null);
  console.log(tableData);

  useEffect(() => {
    getData(ApiLocationsToBeSend);
  }, [ApiLocationsToBeSend, apiLocationsToBeSendCounter, dateTo, dateFrom]);

  useEffect(() => {
    if (selectedEventFilters !== null) {
      setApiLocationsToBeSend(null);
      setApiLocationsToBeSendCounter(0);
      getData(ApiLocationsToBeSend);
    }
  }, [selectedEventFilters]);
  const itemsPerPage = 10;
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

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("de-DE", options);
  };

  const formatDateforApitosend = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat("en-GB", options)
      .format(date)
      .split("/")
      .reverse()
      .join("-");
  };

  const handleDatesChange = (newDates) => {
    console.log(newDates);
    if (!newDates || !newDates[0]) {
      setdateFrom(null);
      setdateTo(null);
      return;
    }
    if (newDates[0] && newDates[1]) {
      let from = newDates[0] && formatDateforApitosend(new Date(newDates[0]));
      setdateFrom(from);
      let to = newDates[1] && formatDateforApitosend(new Date(newDates[1]));
      setdateTo(to);
    }
  };
  const [filterValue, setFilterValue] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(LocationsData); // Initialize with LocationsData

  const handleFilterChange = (event) => {
    const filterText = event.target.value.toLowerCase();
    setFilterValue(filterText);
    let filteredData = []; // Clear the filteredData array
    const searchInChildren = (node) => {
      if (node.label.toLowerCase().includes(filterText)) {
        filteredData.push(node);
      } else if (node.children) {
        node.children.forEach((child) => searchInChildren(child));
        // Remove child filters from filteredData if they don't match the search query
        filteredData = filteredData.filter((item) => item.key !== node.key);
      }
    };
    LocationsData.forEach((location) => searchInChildren(location));
    setFilteredLocations(filteredData);
  };

  return (
    <div className=" flex flex-col gap-4 w-full">
      <div className="flex flex-col justify-center items-start w-full">
        <h1 className=" font-[500] text-lg text-gray-900">Event Übersicht</h1>
      </div>
      <div className="relative w-full overflow-x-auto bg-white shadow-md sm:rounded-lg z-10">
        <div className="flex flex-column my-2 bg-transparent mx-2 sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between z-10">
          {/* Filter buttons */}
          <div className="flex flex-row justify-center items-center gap-1">
            <TreeSelect
              value={selectedKeys}
              options={filteredLocations} // Use filteredLocations here
              onChange={onNodeSelectChange}
              onClick={handleTreeSelectClick}
              selectionMode="multiple"
              placeholder="All Buildings"
              filter
              filterBy="label"
              filterValue={filterValue}
              className="w-full md:w-20rem"
              closeIcon="false"
              panelStyle={{
                border: "0.5px solid #bababa",
                borderRadius: "4px",
              }}
              filterTemplate={({ filterInputProps }) => (
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    borderRadius: "6px",
                    border: "1px solid #d5ddde",
                  }}
                >
                  <span
                    style={{
                      marginLeft: "8px",
                      marginRight: "8px",
                      color: "#9e9e9e",
                      fontSize: "18px",
                    }}
                  >
                    <IoSearch />
                  </span>
                  <input
                    {...filterInputProps}
                    value={filterValue}
                    onChange={handleFilterChange} // Ensures the filter input is correctly connected
                    style={{
                      border: "none",
                      width: "100%",
                      backgroundColor: "transparent",
                      outline: "none",

                      color: "#6e6e6e",
                    }}
                    placeholder="Search" // Optional: you can add a placeholder
                  />
                </div>
              )}
            />
            <MultiSelect
              value={selectedEventFilters}
              onShow={handleMultiSelectClick}
              onChange={(e) => setSelectedEventFilters(e.value)}
              showSelectAll={false}
              options={eventFilterOptions}
              optionLabel="name"
              filter
              placeholder="All Events"
              display="chip"
              className="w-full md:w-20rem"
              panelStyle={{
                border: "0.5px solid #bababa",
                borderRadius: "4px",
              }}
            />
            <DateFilter
              closeDropdown={closeDateFilter}
              setCloseDateFilter={setCloseDateFilter}
              onDatesChange={handleDatesChange}
            />
          </div>
        </div>
        {/* Table */}
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 z-10 min-h-[10rem]">
          <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4">
                EVENT ID
              </th>
              <th scope="col" className="p-4">
                ROOM
              </th>
              <th scope="col" className="p-4">
                BUILDING - FLOOR
              </th>
              <th scope="col" className="p-4">
                DATE - TIME
              </th>
              <th scope="col" className="p-4">
                EVENT TYPE
              </th>
              <th scope="col" className="p-4">
                MESSAGE
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 &&
              tableData.map((item, index) => (
                <tr
                  key={index}
                  className="text-sm bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white w-full md:w-[6%]">
                    {item.id ? item.id : "-"}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 break-words dark:text-white w-full md:w-[15%]">
                    {item.roomName ? item.roomName : "-"}{" "}
                    <span className="text-[10px] py-0.5 px-2.5 font-semibold bg-gray-100 rounded-[80px] p-1">
                      {item.roomTag ? item.roomTag : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 w-full md:w-[15%]">
                    {item.building_floor_string
                      ? item.building_floor_string
                      : "-"}
                  </td>
                  <td className="px-4 py-4 w-full md:w-[15%]">
                    {item.createdAt ? formatDate(item.createdAt) : "-"}
                  </td>
                  <td className="px-4 py-4 w-full md:w-[13%]">
                    <Tooltip content={item.eventTypeLevel} style="light">
                      <div className="flex items-center gap-x-2">
                        {item.eventTypeLevel === "Information" ? (
                          <FaCircleInfo />
                        ) : item.eventTypeLevel === "Warning" ? (
                          <RiErrorWarningFill className="text-yellow-500" />
                        ) : (
                          <IoIosWarning className="text-red-700" />
                        )}
                        <span className="text-sm">
                          {item.eventTypeMessage ? item.eventTypeMessage : "-"}
                        </span>
                      </div>
                    </Tooltip>
                  </td>

                  <td className="px-4 py-4 w-full md:w-[40%]">
                    <Tooltip content={item.message} style="light">
                      {item.message ? `${item.message.slice(0, 70)}...` : "-"}
                    </Tooltip>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {tableData.length === 0 && (
          <>
            <div className="w-full bg-slate-100 flex flex-col justify-center items-center">
              <p className="w-full text-center italic py-2 font-semibold">
                No Results Found
              </p>
            </div>
          </>
        )}

        <div className="w-full p-3 flex flex-row justify-between items-center">
          {tableData && (
            <p className="font-light text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-black">
                {startIndex}-{endIndex}
              </span>{" "}
              of <span className="font-bold text-black">{totalItems}</span>
            </p>
          )}

          {/* Pagination */}
          <div className="flex justify-end border rounded-md border-gray-200 w-fit">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-primary bg-[#CFF4FB] hover:bg-primary-300"
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
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${
                  currentPage === startPage + index
                    ? "text-primary bg-[#CFF4FB] hover:bg-primary-300"
                    : "text-gray-500 bg-white hover:bg-gray-100"
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
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 bg-white hover:bg-gray-100"
                }`}
                disabled={currentPage === totalPages}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-primary bg-[#CFF4FB] hover:bg-primary-300"
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

export default EventLogsTable;
