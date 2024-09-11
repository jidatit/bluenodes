/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { Button, Select, Toast } from "flowbite-react";
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

const UnassignedTable = ({ assignUpdate }) => {
  const [selectedEventFilters, setSelectedEventFilters] = useState(null);
  const [ApiLocationsToBeSend, setApiLocationsToBeSend] = useState(null);
  const [apiLocationsToBeSendCounter, setApiLocationsToBeSendCounter] =
    useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

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
    const newExpandedKeys = { ...expandedKeys };

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
      newExpandedKeys[node.key] = true; // Expand the node

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
          newExpandedKeys[key] = true; // Keep parent node expanded

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
    Object.keys(newSelectedKeys).forEach((key) => {
      // ...
      newExpandedKeys[key] = true; // Expand the node
    });

    Object.keys(selectedKeys).forEach((key) => {
      if (!newSelectedKeys[key]) {
        // ...
        delete newExpandedKeys[key]; // Collapse the node
      }
    });
    // Update state
    setSelectedKeys(updatedKeys);
    setSelectedRoomIds(newSelectedRoomIds);
    setDeselectedKeys(updatedDeselectedKeys);
    setExpandedKeys(newExpandedKeys); // Update expanded keys

    console.log("Deselected Keys", updatedDeselectedKeys);
    console.log("Selected Keys", updatedKeys);

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
    setExpandedKeys((prevExpandedKeys) => ({
      ...prevExpandedKeys,
      // Optionally include additional logic to ensure the tree stays expanded as needed
    }));
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
  const handleOpenEditModal = (room) => {
    setOpenEditModal(!openEditModal);
    setSelectedRoom(room);
  };
  const assignSuccess = () => {
    setIsSuccess(true);
    setShowToast(true);
    assignUpdate();
    setToastMessage(errors.PorgramAssignedSuccessfully);
    setTimeout(() => {
      setShowToast(false);
      // handleCloseModal();
    }, 1000);
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
              selectionMode="multiple"
              placeholder="Alle Gebäude"
              expandedKeys={expandedKeys}
              onToggle={(e) => {
                const updatedExpandedKeys = { ...expandedKeys, ...e.value };
                setExpandedKeys(updatedExpandedKeys); // Maintain expanded state
              }}
              onCollapse={(e) => {
                const updatedExpandedKeys = { ...expandedKeys };
                delete updatedExpandedKeys[e.value]; // Remove collapsed node from expanded keys
                setExpandedKeys(updatedExpandedKeys);
              }}
              filter
              filterBy="label"
              filterValue={filterValue}
              className="w-full md:w-20rem"
              closeIcon="false"
              panelStyle={{
                border: "0.5px solid #bababa",
                borderRadius: "4px",
                outline: "none", // Ensures no outline is present
                boxShadow: "none", // Ensures no box-shadow is applied
              }}
              style={{
                outline: "none", // Removes the blue border from the component
                boxShadow: "none", // Removes the focus shadow if applied
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
                      outline: "none", // Removes the focus outline from the input
                      color: "#6e6e6e",
                    }}
                    placeholder="Suche"
                  />
                </div>
              )}
            />
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
                    <span className="text-[12px] py-0.5 px-2.5 font-semibold bg-gray-100 rounded-[80px] p-1">
                      {item.tag ? item.tag : "N/A"}
                    </span>
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
      {showToast && (
        <div
          className="fixed top-4 right-4 z-50 transition-transform duration-300 ease-in-out transform translate-x-0"
          style={{ transition: "transform 0.3s ease-in-out" }}
        >
          <Toast className="animate-slideIn">
            {isSuccess ? (
              <div className="text-cyan-600 dark:text-cyan-600 mr-2.5">
                {/* Success SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 27 27"
                  fill="none"
                >
                  <path
                    d="M19.1213 16.4205L19.8535 14.7761C20.454 13.4263 20.5249 11.8905 20.0539 10.4294C19.583 8.96834 18.5993 7.67189 17.2698 6.76004L17.8636 5.42623C17.9715 5.18394 17.9696 4.90465 17.8583 4.64982C17.747 4.39498 17.5355 4.18547 17.2702 4.06737C17.005 3.94927 16.7077 3.93225 16.4439 4.02007C16.18 4.10789 15.9712 4.29334 15.8633 4.53563L15.2695 5.86944C13.7022 5.49155 12.0805 5.62803 10.6796 6.25572C9.27869 6.88341 8.1848 7.96366 7.58354 9.31317L6.93844 10.7621C6.90978 10.8266 6.88885 10.8944 6.87602 10.9642L6.85302 10.9539C6.50116 11.7045 5.8405 12.2751 5.01303 12.543C4.26214 12.7847 3.64872 13.2814 3.28693 13.9408C3.06607 14.4369 2.39494 15.9442 3.93318 16.6291L6.14153 17.6123C6.06521 18.5639 6.31396 19.5341 6.85197 20.3834C7.38998 21.2326 8.18951 21.9171 9.13549 22.3383C10.0815 22.7595 11.1251 22.8956 12.1162 22.7272C13.1073 22.5588 13.9948 22.0944 14.6509 21.401L16.8592 22.3842C18.3975 23.069 19.0686 21.5617 19.2895 21.0656C19.537 20.3557 19.4956 19.5678 19.1729 18.8484C18.8187 18.0552 18.8002 17.1836 19.1213 16.4205ZM9.94879 20.5116C9.54212 20.33 9.18255 20.0597 8.90179 19.7247C8.62103 19.3897 8.42771 19.0003 8.33888 18.5907L12.4535 20.4226C12.0897 20.6307 11.6709 20.7476 11.2341 20.7632C10.7973 20.7787 10.3559 20.6923 9.94879 20.5116ZM17.2107 20.3513L5.20875 15.0077C5.236 14.9465 5.26406 14.8835 5.28725 14.8314C5.50216 14.6348 5.76072 14.4847 6.04693 14.3902C7.31392 13.9285 8.31686 13.0215 8.85571 11.85L9.58785 10.2055C10.0409 9.18291 10.9061 8.38969 12.0052 7.98941C13.1043 7.58913 14.3535 7.61231 15.4952 8.05417C16.5886 8.60635 17.4428 9.51919 17.8816 10.6043C18.3204 11.6894 18.3102 12.8639 17.8532 13.8855L17.2081 15.3344C17.1796 15.399 17.1584 15.4665 17.1447 15.5361L17.1227 15.5263C16.6126 16.7106 16.6097 18.0629 17.1143 19.3134C17.2356 19.5892 17.2971 19.8819 17.2948 20.1731C17.266 20.2271 17.2379 20.2901 17.2107 20.3513Z"
                    fill="#0CB4D5"
                  />
                  <path
                    d="M6.58338 8.86787C7.3498 7.16476 8.79039 5.83957 10.6184 5.15605C10.878 5.0581 11.0786 4.86424 11.176 4.61714C11.2735 4.37003 11.2598 4.08992 11.138 3.83842C11.0162 3.58692 10.7963 3.38463 10.5266 3.27606C10.2569 3.16749 9.95956 3.16152 9.69997 3.25948C7.37973 4.12878 5.55262 5.81337 4.58306 7.97727C4.47518 8.21956 4.4771 8.49884 4.58839 8.75368C4.69967 9.00852 4.91121 9.21803 5.17647 9.33613C5.44173 9.45423 5.73898 9.47125 6.00282 9.38343C6.26667 9.29561 6.4755 9.11016 6.58338 8.86787Z"
                    fill="#0CB4D5"
                  />
                  <path
                    d="M22.9361 9.15257C22.8861 9.0246 22.8105 8.90546 22.7135 8.80197C22.6164 8.69847 22.5 8.61264 22.3707 8.54938C22.2414 8.48612 22.1018 8.44667 21.9599 8.43327C21.818 8.41988 21.6765 8.4328 21.5436 8.47131C21.4107 8.50982 21.289 8.57316 21.1853 8.65772C21.0817 8.74227 20.9981 8.84638 20.9395 8.9641C20.8808 9.08182 20.8482 9.21085 20.8435 9.34382C20.8388 9.47679 20.8621 9.6111 20.9121 9.73907C21.628 11.5566 21.6064 13.5158 20.8516 15.226C20.7437 15.4683 20.7457 15.7476 20.857 16.0025C20.9683 16.2573 21.1798 16.4668 21.445 16.5849C21.7103 16.7029 22.0076 16.7199 22.2714 16.6321C22.5353 16.5443 22.7441 16.3588 22.852 16.1165C23.9747 13.4288 23.9986 10.3526 22.9361 9.15257Z"
                    fill="#0CB4D5"
                  />
                </svg>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-500 mr-2.5">
                {/* Error SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 27 27"
                  fill="none"
                >
                  <path
                    d="M13.5 27C20.9558 27 27 20.9558 27 13.5C27 6.04416 20.9558 0 13.5 0C6.04416 0 0 6.04416 0 13.5C0 20.9558 6.04416 27 13.5 27ZM13.5 2.025C19.5456 2.025 24.975 7.45438 24.975 13.5C24.975 19.5456 19.5456 24.975 13.5 24.975C7.45438 24.975 2.025 19.5456 2.025 13.5C2.025 7.45438 7.45438 2.025 13.5 2.025ZM12.1992 13.5V8.74359C12.1992 8.05984 12.759 7.5 13.5 7.5C14.241 7.5 14.8008 8.05984 14.8008 8.74359V13.5C14.8008 14.1832 14.241 14.7436 13.5 14.7436C12.759 14.7436 12.1992 14.1832 12.1992 13.5ZM13.5 19.2266C12.7106 19.2266 12.0742 18.5903 12.0742 17.8008C12.0742 17.0114 12.7106 16.375 13.5 16.375C14.2894 16.375 14.9258 17.0114 14.9258 17.8008C14.9258 18.5903 14.2894 19.2266 13.5 19.2266Z"
                    fill="#F35151"
                  />
                </svg>
              </div>
            )}
            <div className="pl-4 text-sm font-normal border-l">
              {toastMessage}
            </div>
          </Toast>
        </div>
      )}
    </div>
  );
};

export default UnassignedTable;
