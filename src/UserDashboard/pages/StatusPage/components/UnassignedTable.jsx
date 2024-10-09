/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { Button, Select, Toast, Tooltip } from "flowbite-react";
import { IoChevronBackOutline, IoSearch } from "react-icons/io5";
import { IoChevronForwardOutline } from "react-icons/io5";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCircleInfo } from "react-icons/fa6";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoIosWarning } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { GiTireIronCross } from "react-icons/gi";
import {
  fetchEventLogsData,
  fetchUnassignedRoomsData,
} from "../data/Statuspageapis";
import { TreeSelect } from "primereact/treeselect";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL";
import { MultiSelect } from "primereact/multiselect";
import DateFilter from "./dateFilter/DateFilter";
import AssignProgramModal from "./AssignProgramModal";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import { CiCircleRemove } from "react-icons/ci";
import { useToast } from "../../OperationalOverview/components/ToastContext";

const UnassignedTable = ({ assignUpdate }) => {
  const [selectedEventFilters, setSelectedEventFilters] = useState(null);
  const [ApiLocationsToBeSend, setApiLocationsToBeSend] = useState(null);
  const [apiLocationsToBeSendCounter, setApiLocationsToBeSendCounter] =
    useState(null);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const { generateToast } = useToast();
  const [filtersSelected, setFiltersSelected] = useState(false);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState(0);

  const [closeDateFilter, setCloseDateFilter] = useState(false); // State to manage dropdown visibility
  const [parentNodes, setParentNodes] = useState(null);
  const dateFilterRef = useRef(null);
  const [floors, setFloors] = useState([]);
  // Function to handle click outside of the DateFilter
  useEffect(() => {
    // Function to handle click outside of the DateFilter
    const handleClickOutside = (event) => {
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target)
      ) {
        setCloseDateFilter(true); // Close dropdown if clicked outside
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateFilterRef]);
  const handleTreeSelectClick = () => {
    setCloseDateFilter(true);
  };
  const clearBuildingFilter = () => {
    setSelectedKeys([]);
    setBuildingOpen(false);
    setApiLocationsToBeSend(null);
    setSelectedRoomIds([]);
  };
  const openBuildingFilter = () => {
    if (buildingOpen === false) {
      setBuildingOpen(true);
    }
  };
  const hideBuildingFilter = () => {
    if (buildingOpen === true) {
      setBuildingOpen(false);
    }
  };

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
      const extractedFloors = LocationsData.map(
        (location) => location.children
      ).flat();

      // Update the floors state with the extracted children
      setFloors(extractedFloors);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (filtersSelected === false) getAllLocations();
  }, [filtersSelected]);

  const [tableData, setTableData] = useState([]);
  // const [selectedFilter, setSelectedFilter] = useState("Last Year");
  // const [selectedEvent, setSelectedEvent] = useState("All events");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [selectedKeys, setSelectedKeys] = useState({});
  const [selectedRoomIds, setSelectedRoomIds] = useState(new Set());
  const [Deselectedkeys, setDeselectedKeys] = useState({});

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const getAllKeys = (node) => {
    let keys = [node.key];
    if (node.children) {
      for (const child of node.children) {
        keys = [...keys, ...getAllKeys(child)];
      }
    }
    return keys;
  };

  const [expandedKeys, setExpandedKeys] = useState({});

  const updateSelection = (newSelectedKeys) => {
    const newSelectedRoomIds = new Set([...selectedRoomIds]);
    const updatedKeys = { ...selectedKeys };
    const updatedDeselectedKeys = { ...Deselectedkeys };

    // Helper function to select a node and all its children
    const selectNodeAndChildren = (key) => {
      const node = findNodeByKey(key, LocationsData);
      if (node) {
        selectNodeAndChildrenRecursive(node);
      }
    };

    const selectNodeAndChildrenRecursive = (node) => {
      updatedKeys[node.key] = true; // Mark node as selected

      // Ensure that previously deselected rooms/children get reselected
      if (updatedDeselectedKeys[node.key]) {
        delete updatedDeselectedKeys[node.key];
      }

      if (node.key.startsWith("room")) {
        newSelectedRoomIds.add(node.key); // Add room ID back to selected rooms
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          selectNodeAndChildrenRecursive(child); // Select all child nodes
        });
      }
    };

    // Helper function to deselect a node and all its children
    const deselectNodeAndChildren = (key) => {
      const node = findNodeByKey(key, LocationsData);
      if (node) {
        const allKeys = getAllKeys(node); // Get all children keys
        allKeys.forEach((childKey) => {
          delete updatedKeys[childKey]; // Remove selection for child keys
          if (childKey.startsWith("room")) {
            newSelectedRoomIds.delete(childKey); // Remove room ID from selection
          }
          updatedDeselectedKeys[childKey] = true; // Add to deselected keys
        });
      }
    };

    // Add newly selected keys and their children
    Object.keys(newSelectedKeys).forEach((key) => {
      if (!updatedKeys[key]) {
        // Select all children if parent is selected for the first time or reselected
        selectNodeAndChildren(key);
      } else {
        // If the parent is already selected, just select the node
        updatedKeys[key] = true;

        // Remove from deselected keys if previously deselected
        if (updatedDeselectedKeys[key]) {
          delete updatedDeselectedKeys[key];
        }
      }
    });

    // Remove unselected keys and their children
    Object.keys(selectedKeys).forEach((key) => {
      if (!newSelectedKeys[key]) {
        deselectNodeAndChildren(key); // Deselect node and its children

        // Add to deselected keys
        updatedDeselectedKeys[key] = true;

        const node = findNodeByKey(key, LocationsData); // Define node
        if (node && node.children && node.children.length > 0) {
          // Deselect parent ONLY IF all children are deselected
          const allChildrenDeselected = node.children.every(
            (child) => updatedDeselectedKeys[child.key]
          );
          if (allChildrenDeselected) {
            delete updatedKeys[key]; // Deselect parent if all children are deselected
          }
        }
      }
    });

    // Ensure room IDs in updatedKeys are included in newSelectedRoomIds
    Object.keys(updatedKeys).forEach((key) => {
      if (key.startsWith("room")) {
        newSelectedRoomIds.add(key);
      }
    });

    // Remove room IDs from newSelectedRoomIds that are in updatedDeselectedKeys
    Object.keys(updatedDeselectedKeys).forEach((key) => {
      if (key.startsWith("room")) {
        newSelectedRoomIds.delete(key);
      }
    });

    // Update state
    setSelectedKeys(updatedKeys);
    setSelectedRoomIds(newSelectedRoomIds);
    setDeselectedKeys(updatedDeselectedKeys);

    // Handle selected room IDs and filters
    const locations = Array.from(newSelectedRoomIds);
    const transformedArray = locations.map((item) =>
      parseInt(item.replace("room", ""), 10)
    );

    if (transformedArray.length > 0) {
      const sep_locations = transformedArray.join(",");
      setFiltersSelected(true);
      setSelectedLocationFilter(transformedArray.length);
      setApiLocationsToBeSend(sep_locations);
      setApiLocationsToBeSendCounter(apiLocationsToBeSendCounter + 1);
    } else {
      setSelectedLocationFilter(0);
      setFiltersSelected(false);
      getData();
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
          setParentNodes(childNode);
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

      const data = await fetchUnassignedRoomsData(
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

  useEffect(() => {
    getData(ApiLocationsToBeSend);
  }, [
    ApiLocationsToBeSend,
    apiLocationsToBeSendCounter,
    dateTo,
    dateFrom,
    currentPage,
  ]);

  useEffect(() => {
    if (selectedEventFilters !== null) {
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

  const formatDateforApitosend = (date) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat("en-GB", options)
      .format(date)
      .split("/")
      .reverse()
      .join("-");
  };

  const handleDatesChange = (newDates) => {
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
  const handleOpenEditModal = (room) => {
    setOpenEditModal(!openEditModal);
    setSelectedRoom(room);
  };
  const assignSuccess = () => {
    assignUpdate();
    generateToast(errors.PorgramAssignedSuccessfully, true);
  };
  const [filterValue, setFilterValue] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(LocationsData);

  // Initialize with LocationsData

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
  const handleNodeToggle = (e) => {
    setExpandedKeys(e.value); // Update expanded keys state
  };
  return (
    <div className=" flex flex-col gap-4 w-full">
      <div className="flex flex-col justify-center items-start w-full">
        <h1 className=" font-[500] text-lg text-gray-900">Rooms Unassigned</h1>
      </div>
      <div className="relative w-full overflow-x-auto bg-white shadow-md sm:rounded-lg">
        <div className="flex flex-column my-2 bg-transparent mx-2 sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between">
          {/* Filter buttons */}
          <div className="flex flex-row justify-center items-center gap-1">
            <TreeSelect
              value={selectedKeys}
              options={filteredLocations}
              onChange={onNodeSelectChange}
              onClick={handleTreeSelectClick}
              expandedKeys={expandedKeys} // Use expandedKeys to manage expanded nodes
              onToggle={handleNodeToggle} // Handle node expand/collapse event
              selectionMode="multiple"
              onShow={openBuildingFilter}
              onHide={hideBuildingFilter}
              placeholder="Alle Gebäude"
              filter
              filterBy="label"
              filterValue={filterValue}
              className="w-full md:w-20rem"
              closeIcon="false"
              panelStyle={{
                border: "0.5px solid #bababa",
                borderRadius: "4px",
                outline: "none",
                boxShadow: "none",
              }}
              style={{
                outline: "none",
                boxShadow: "none",
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
                    onChange={handleFilterChange}
                    style={{
                      border: "none",
                      width: "100%",
                      backgroundColor: "transparent",
                      outline: "none",
                      color: "#6e6e6e",
                    }}
                    placeholder="Suche"
                  />
                </div>
              )}
            />
            {Object.keys(selectedKeys).length > 0 && (
              <button
                className="text-xl text-red-500 rounded-lg"
                onClick={clearBuildingFilter}
              >
                <CiCircleRemove size={36} />
              </button>
            )}
            {/* <MultiSelect value={selectedEventFilters} onChange={(e) => setSelectedEventFilters(e.value)} showSelectAll={false} options={eventFilterOptions} optionLabel="name"
                            filter placeholder="All Events" display="chip" className="w-full md:w-20rem" />

                        <DateFilter onDatesChange={handleDatesChange} /> */}
          </div>
        </div>
        {/* Table */}
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 min-h-[10rem]">
          <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr className=" uppercase">
              <th scope="col" className="p-4 w-[20%]">
                ID
              </th>
              <th scope="col" className="p-4 w-[30%]">
                RAUM
              </th>
              <th scope="col" className="p-4 w-[60%]">
                GEBÄUDE - ETAGE
              </th>
              <th scope="col" className="p-4">
                {/* Action */}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 &&
              tableData.map((item, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {item.locationId ? item.locationId : "N/A"}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {item.name ? item.name : "N/A"}{" "}
                    {/* <span className="text-[12px] py-0.5 px-2.5 font-semibold bg-gray-100 rounded-[80px] p-1">
                      {item.tag ? item.tag : "N/A"}
                    </span> */}
                  </td>
                  <td className="px-4 py-4">
                    {item.building_floor_string
                      ? item.building_floor_string
                      : "N/A"}
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      onClick={() => {
                        handleOpenEditModal(item ? item : null);
                      }}
                      className="whitespace-nowrap hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
                    >
                      Heizplan zuweisen
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {tableData.length === 0 && (
          <>
            <div className="w-full bg-slate-100 flex flex-col justify-center items-center">
              <p className="w-full text-center italic py-2 font-semibold">
                Keine Ergebnisse{" "}
              </p>
            </div>
          </>
        )}

        <div className="w-full p-3 flex flex-row justify-between items-center">
          {tableData && (
            <p className="font-light text-sm text-gray-500">
              {" "}
              <span className="font-bold text-black">
                {startIndex}-{endIndex}
              </span>{" "}
              von <span className="font-bold text-black">{totalItems}</span>
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

      {handleOpenEditModal && openEditModal && (
        <AssignProgramModal
          // fetchFloorDetails={getFloorDetails}
          openModal={openEditModal}
          handleOpenModal={handleOpenEditModal}
          room={selectedRoom}
          fetchList={getData}
          assignSuccess={assignSuccess}
          // updateReplaced={updateReplacedF}
        />
      )}
    </div>
  );
};

export default UnassignedTable;
