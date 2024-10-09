import React, { useState, useEffect, useRef } from "react";
import { Tooltip, TextInput } from "flowbite-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { FaRegCircleCheck } from "react-icons/fa6";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { errorMessages as errors } from "../../../../globals/errorMessages";
import BatteryFull from "../../../../assets/battery-icons/battery-100.png";
import BatteryMedium from "../../../../assets/battery-icons/battery-51.png";
import BatteryLow from "../../../../assets/battery-icons/battery-26.png";
import BatteryEmpty from "../../../../assets/battery-icons/battery-0.png";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";
import { FaCheck } from "react-icons/fa6";
import ThermometerIcon from "../../../../assets/icons/thermometer-02.png";
import HumidityIcon from "../../../../assets/icons/humidity.png";
import ValvePositionIcon from "../../../../assets/icons/pipe.png";
import ChildLockIcon from "../../../../assets/icons/user-key.png";
import ErrorIcon from "../../../../assets/icons/bell.png";
import OpenCloseWindowIcon from "../../../../assets/icons/Window.png";
import LightIntensityIcon from "../../../../assets/icons/light.png";
import MovementIcon from "../../../../assets/icons/movement.png";
import { IoSearch } from "react-icons/io5";
import { TreeSelect } from "primereact/treeselect";
import { MultiSelect } from "primereact/multiselect";
import {
  fetchDeviceManagementList,
  updateDeviceName,
  getDeviceInfo,
} from "./data/DevicePageApis";
import axios from "axios";
import formatTimestamp from "../../../../utils/formatTimeStamp";
import ApiUrls from "../../../../globals/apiURL";
import { CiCircleRemove } from "react-icons/ci";
import { useToast } from "../../OperationalOverview/components/ToastContext";
const getBatteryImage = (battery_level) => {
  const level = battery_level;
  if (level === "full") {
    return BatteryFull;
  } else if (level === "high") {
    return BatteryFull;
  } else if (level === "medium") {
    return BatteryMedium;
  } else if (level === "low") {
    return BatteryLow;
  } else {
    return BatteryEmpty;
  }
};

const DeviceManagementTable = () => {
  const [selectedFilter, setSelectedFilter] = useState("Last Year");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [deviceData, setDeviceData] = useState(null);
  const itemsPerPage = 10;
  const totalItems = totalRows && totalRows;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [LocationsData, setLocationsData] = useState([]);
  const [buildingOpen, setBuildingOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [selectedBatteryLevels, setSelectedBatteryLevels] = useState([]);
  const [batteryLevel, setBatteryLevel] = useState("");
  const [selectedEventFilters, setSelectedEventFilters] = useState(null);
  const [ApiLocationsToBeSend, setApiLocationsToBeSend] = useState(null);
  const [apiLocationsToBeSendCounter, setApiLocationsToBeSendCounter] =
    useState(null);
  const [filtersSelected, setFiltersSelected] = useState(false);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState(0);
  const [closeDateFilter, setCloseDateFilter] = useState(false); // State to manage dropdown visibility
  const dateFilterRef = useRef(null);
  const [floors, setFloors] = useState([]);
  const [parentNodes, setParentNodes] = useState(null);
  const { generateToast } = useToast();
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
  const handleMultiSelectClick = () => {
    if (selectedLocationFilter === 0) {
      setApiLocationsToBeSend(null);
    }
    setCloseDateFilter(true);
  };
  const eventFilterOptions = [
    { key: "offline", germanLabel: "Offline" },
    { key: "online", germanLabel: "Online" },
  ];

  const batteryLevelOptions = [
    { key: "low", germanLabel: "Niedrig" },
    { key: "medium", germanLabel: "Mittel" },
    { key: "high", germanLabel: "Hoch" },
  ];

  const clearBuildingFilter = () => {
    // Clear selected keys and related filters
    setSelectedKeys([]);
    setApiLocationsToBeSend(null);
    setSelectedLocationFilter(0);
    setFiltersSelected(false);
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
  const clearStatusFilter = () => {
    setSelectedStatusFilter(null);
    setStatus(null);
  };
  const clearBatteryFilter = () => {
    setSelectedBatteryLevels([]);
    setBatteryLevel(null);
  };
  const clearAllFilters = () => {
    setSelectedKeys([]);
    setSelectedRoomIds([]);
    setApiLocationsToBeSend(null);
    setBatteryLevel(null);
    setStatus(null);
    setSelectedStatusFilter(null);
    setSelectedBatteryLevels(null);
  };

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
  const getAllKeys = (node) => {
    let keys = [node.key];
    if (node.children) {
      for (const child of node.children) {
        keys = [...keys, ...getAllKeys(child)];
      }
    }
    return keys;
  };

  const [Deselectedkeys, setDeselectedKeys] = useState({});
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

  const [selectedKeys, setSelectedKeys] = useState({});
  const [selectedRoomIds, setSelectedRoomIds] = useState(new Set());

  const [expandedKeys, setExpandedKeys] = useState({});

  const updateSelection = (newSelectedKeys) => {
    const newSelectedRoomIds = new Set([...selectedRoomIds]);
    const updatedKeys = { ...selectedKeys };
    const updatedDeselectedKeys = { ...Deselectedkeys };
    console.log("new", newSelectedKeys);
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
  const handleBatteryLevelChange = (e) => {
    const selectedOptions = e.value;

    // Convert selected values to their keys for the API
    const selectedKeys = selectedOptions.map((option) => option.key);
    setSelectedBatteryLevels(selectedOptions);

    // Convert array to a comma-delimited string for API
    const formattedBatteryLevel = selectedKeys.join(",");
    setBatteryLevel(formattedBatteryLevel); // Send the English keys to the backend
  };
  const handleStatusChange = (e) => {
    const selectedOptions = e.value;

    // Ensure only one option is selected
    if (selectedOptions && selectedOptions.length > 0) {
      const singleSelection = selectedOptions[selectedOptions.length - 1]; // Keep the last selected value

      // Extract the 'key' for backend and 'germanLabel' for display
      const selectedKey = singleSelection.key;
      setSelectedStatusFilter([
        { key: selectedKey, germanLabel: singleSelection.germanLabel },
      ]);
      setStatus(selectedKey);
      if (!ApiLocationsToBeSend || selectedLocationFilter === 0) {
        setApiLocationsToBeSend(null);
      } // Send the English key to the backend
    } else {
      setSelectedStatusFilter(null);
      setStatus("");
    }
  };

  const getData = async (locations) => {
    try {
      const data = await fetchDeviceManagementList(
        currentPage,
        itemsPerPage,
        batteryLevel,
        status,
        locations
      );
      setTotalRows(data.count);

      // Sorting tableData by roomName, handling null values
      const sortedData = data.rows.sort((a, b) => {
        // Handle null values by putting them at the end
        if (!a.roomName) return 1;
        if (!b.roomName) return -1;

        // Compare roomName in a case-insensitive manner
        return a.roomName.localeCompare(b.roomName);
      });

      // Set sorted data to the table
      setTableData(sortedData);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  useEffect(() => {
    getData(ApiLocationsToBeSend);
    setExpandedRow(null);
  }, [
    ApiLocationsToBeSend,
    apiLocationsToBeSendCounter,
    currentPage,
    status,
    batteryLevel,
  ]);
  useEffect(() => {
    if (selectedEventFilters !== null) {
      getData(ApiLocationsToBeSend);
    }
  }, [selectedEventFilters]);
  useEffect(() => {
    filterData();
  }, [selectedFilter, searchQuery]);
  const filterData = () => {
    let currentDate = new Date();
    let startDate = new Date();
    switch (selectedFilter) {
      case "Last 7 days":
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case "Last 30 days":
        startDate.setDate(currentDate.getDate() - 30);
        break;
      case "Last Month":
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case "Last Year":
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        break;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const paginationRange = 1;

  let startPage = Math.max(1, currentPage - paginationRange);
  let endPage = Math.min(totalPages, currentPage + paginationRange);

  const handleRowClick = async (index, deviceId) => {
    if (expandedRow === index) {
      // If the row is already expanded, toggle it to collapse
      setExpandedRow(null);
    } else {
      // If the row is being expanded, fetch the device data
      try {
        const data = await getDeviceInfo(deviceId); // Fetch device data
        setDeviceData(data); // Store fetched data in state
        setExpandedRow(index); // Expand the row
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    }
  };

  const [editMode, setEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const handleEditClick = (id) => {
    setEditingItemId(id);
    setEditedName(findDeviceName(id));
    setEditMode(true);
  };
  const handleSave = async (id) => {
    // Convert deviceName to numeric string if possible

    try {
      const response = await updateDeviceName(id, editedName);
      if (response.status >= 200 && response.status < 300) {
        setEditMode(false);
        setEditingItemId(null);
        getData();
        generateToast(errors.DeviceNameUpdatedSuccessfully, true);
      } else {
        setEditMode(false);
        setEditingItemId(null);
        generateToast(errors.DeviceNameUpdatedFailed, false);
        alert("Failed to update device name.");
      }
    } catch (error) {
      console.error("Error updating device name:", error);
      alert("An error occurred while updating the device name.");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditingItemId(null);
    setEditedName(findDeviceName(editingItemId));
  };

  const handleInputChange = (e) => {
    setEditedName(e.target.value);
  };

  const findDeviceName = (id) => {
    const device = tableData?.find((item) => item?.id === id);

    return device ? device.deviceName : "";
  };
  const [filterValue, setFilterValue] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(LocationsData);
  const handleFilterChange = (event) => {
    const filterText = event.target.value.toLowerCase();
    setFilterValue(filterText);
    let filteredData = []; // Clear the filteredData array
    const searchInChildren = (node) => {
      if (node.label.toLowerCase().includes(filterText)) {
        filteredData.push(node);
      } else if (node.children) {
        node.children.forEach((child) => searchInChildren(child));
        filteredData = filteredData.filter((item) => item.key !== node.key);
      }
    };
    LocationsData.forEach((location) => searchInChildren(location));
    setFilteredLocations(filteredData);
  };
  const handleNodeToggle = (e) => {
    setExpandedKeys(e.value); // Update expanded keys state
  };
  // Define the function outside of the JSX
  const getBatteryLevelText = (batteryLevel) => {
    switch (batteryLevel) {
      case "low":
        return "Niedrig";
      case "medium":
        return "Mittel";
      case "high":
        return "Hoch";
      default:
        return "Undefined";
    }
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="relative w-full overflow-x-auto bg-white shadow-md sm:rounded-lg">
        <div className="flex flex-wrap items-center justify-between mx-2 my-2 space-y-4 bg-transparent flex-column sm:flex-row sm:space-y-0">
          {/* Filter buttons */}
          <div className="flex flex-row items-center justify-center gap-1">
            <div className="flex flex-row gap-x-2">
              <TreeSelect
                value={selectedKeys}
                options={filteredLocations}
                onChange={onNodeSelectChange}
                onClick={handleTreeSelectClick}
                onHide={hideBuildingFilter}
                onShow={openBuildingFilter}
                expandedKeys={expandedKeys} // Use expandedKeys to manage expanded nodes
                onToggle={handleNodeToggle} // Handle node expand/collapse event
                selectionMode="multiple"
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
            </div>
            <div className="flex flex-row gap-x-2">
              <MultiSelect
                value={selectedStatusFilter}
                onShow={handleMultiSelectClick}
                onChange={handleStatusChange}
                showSelectAll={false}
                options={eventFilterOptions}
                placeholder="Status"
                display="chip"
                className="w-full md:w-20rem"
                panelStyle={{
                  border: "0.5px solid #bababa",
                  borderRadius: "4px",
                }}
                maxSelectedLabels={1}
                optionLabel={(option) => option.germanLabel} // Display German label in the UI
              />
              {selectedStatusFilter && (
                <button
                  className="text-xl text-red-500 rounded-lg"
                  onClick={clearStatusFilter}
                >
                  <CiCircleRemove size={36} />
                </button>
              )}
            </div>
            <div className="flex flex-row gap-x-2">
              <MultiSelect
                value={selectedBatteryLevels}
                onShow={handleMultiSelectClick}
                onChange={handleBatteryLevelChange}
                showSelectAll={false}
                options={batteryLevelOptions}
                placeholder="Batteriestand"
                display="chip"
                className="w-full md:w-20rem"
                panelStyle={{
                  border: "0.5px solid #bababa",
                  borderRadius: "4px",
                }}
                optionLabel={(option) => option.germanLabel} // Display German label in the UI
              />{" "}
              {selectedBatteryLevels?.length > 0 && (
                <button
                  className="text-xl text-red-500  rounded-lg"
                  onClick={clearBatteryFilter}
                >
                  <CiCircleRemove size={36} />
                </button>
              )}
            </div>
            {(selectedStatusFilter ||
              Object.keys(selectedKeys).length > 0 ||
              (selectedBatteryLevels && selectedBatteryLevels.length > 0)) && (
              <button
                className="bg-red-500 px-2 text-[11px] py-3 h-[34%] text-white shadow-lg rounded-lg"
                onClick={clearAllFilters}
              >
                Alle zurücksetzen
              </button>
            )}
          </div>
          {/* Search bar */}
        </div>
        {/* Table */}
        <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
          <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr className="uppercase">
              <th></th>
              <th scope="col" className="p-4">
                ID
              </th>
              <th scope="col" className="p-4" style={{ width: "200px" }}>
                GERÄTENAME
              </th>
              <th scope="col" className="p-4">
                TYP
              </th>
              <th scope="col" className="p-4">
                GEBÄUDE - ETAGE
              </th>
              <th scope="col" className="p-4">
                RAUM
              </th>
              <th scope="col" className="p-4">
                DATUM - UHRZEIT
              </th>
              <th scope="col" className="p-4">
                BATTERIE
              </th>
              <th scope="col" className="p-4">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData?.length > 0 &&
              tableData.map((item, index) => (
                <React.Fragment key={index}>
                  <tr
                    onClick={() => handleRowClick(index, item?.id)}
                    className="bg-white border-b cursor-pointer dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td onClick={() => handleRowClick(index, item?.id)}>
                      {" "}
                      {expandedRow === index ? (
                        <FaChevronUp className="w-6 h-6 p-1 ml-2 rounded-full shadow-md" />
                      ) : (
                        <FaChevronDown className="w-6 h-6 p-1 ml-2 rounded-full shadow-md" />
                      )}{" "}
                    </td>
                    <td className="px-4 py-4 truncate uppercase">
                      {item?.devEui}
                    </td>
                    <td className="relative px-4 py-4 truncate">
                      {editMode && editingItemId === item?.id ? (
                        <TextInput
                          type="text"
                          value={editedName}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent the row click handler from being called
                            if (e.target.value.length <= 25) {
                              // Check if the length is within the limit
                              handleInputChange(e); // Call the original input change handler
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          maxLength={25} // Set the maximum length to 25
                          className="w-[68%] mr-2"
                          sizing="sm"
                        />
                      ) : (
                        <>
                          {item?.deviceName &&
                          item.deviceName.toString().length > 20 ? (
                            <>
                              <p className="mr-2">
                                {item.deviceName.toString().slice(0, 20)}{" "}
                                <span>...</span>
                              </p>
                            </>
                          ) : (
                            <p className="pr-1">{item.deviceName}</p>
                          )}
                        </>
                      )}

                      {editMode && editingItemId === item?.id ? (
                        <div className="absolute top-1/2 transform -translate-y-1/2 right-2 flex gap-[2px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the row click handler from being called
                              handleCancel();
                            }}
                            className="p-1 text-red-700 hover:bg-gray-300 hover:shadow-md hover:rounded-md"
                          >
                            <ImCancelCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the row click handler from being called
                              handleSave(item?.id);
                            }}
                            className="p-1 text-green-800 hover:bg-gray-300 hover:shadow-md hover:rounded-md"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <FaEdit
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the row click handler from being called
                            handleEditClick(item?.id);
                          }}
                          className="absolute p-[2px] hover:rounded-md hover:shadow-md hover:bg-gray-300 w-5 h-5 top-1/2 bottom-1/2 right-0 transform -translate-y-1/2"
                        />
                      )}
                    </td>

                    <td className="px-4 py-4 truncate">{item?.deviceType}</td>
                    <td className="px-4 py-4">{item?.building_floor_string}</td>

                    <td className="px-4 py-4">{item?.roomName}</td>
                    <td className="px-4 py-4">
                      {formatTimestamp(item?.lastSeen)}
                    </td>
                    <td className="px-4 py-4 truncate">
                      <Tooltip
                        className="p-3"
                        content={getBatteryLevelText(item?.batteryLevel)}
                        style="light"
                        animation="duration-500"
                      >
                        <div className="flex items-center gap-1">
                          <img
                            src={getBatteryImage(item?.batteryLevel)}
                            alt="Battery Level"
                            className="w-4 h-4 mr-2"
                          />
                          {item.batteryLevel === "low" && (
                            <p className="text-sm font-bold text-red-500">
                              Bald leer
                            </p>
                          )}
                        </div>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-4 truncate">
                      <div
                        className={`py-0.5 px-2.5 rounded-md flex items-center justify-center gap-1 w-fit ${
                          item.status === "online"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-900"
                        } text-[10px]`}
                      >
                        {item.status === "online" ? (
                          <FaRegCircleCheck />
                        ) : (
                          <AiOutlineExclamationCircle />
                        )}
                        <p className="text-xs font-medium">{item?.status}</p>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="w-full bg-gray-100 dark:bg-gray-700">
                      <td colSpan="9" className="w-full p-6">
                        {item?.deviceType === "Wandthermostat" && (
                          <div className="flex flex-row items-start justify-around gap-24 px-2">
                            <div className="flex flex-col items-start justify-start gap-2">
                              <img
                                src={ThermometerIcon}
                                alt="Thermometer Icon"
                                className={`${
                                  deviceData.targetTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <h2
                                className={`${
                                  deviceData.targetTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {" "}
                                Soll-Temperatur{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.targetTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {`${deviceData.targetTemperature}°C` || "--"}
                              </h1>
                              <h2
                                className={`${
                                  deviceData.currentTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {" "}
                                Sensor-Temperatur{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.currentTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                } `}
                              >
                                {`${deviceData.currentTemperature}°C` || "--"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2 ${
                                deviceData.currentHumidity
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <img src={HumidityIcon} alt="Humidity Icon" />
                              <h2> Luftfeuchtigkeit </h2>
                              <h1 className="text-base font-medium text-black">
                                {`${deviceData.currentHumidity}%` || "--"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2 ${
                                deviceData.lightIntensity
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <img
                                src={LightIntensityIcon}
                                alt="Light Intensity Icon"
                              />
                              <h2> Lichtstärke </h2>
                              <h1 className="text-base font-medium text-black">
                                {`${deviceData.lightIntensity}lux` || "--"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2 ${
                                deviceData.movementDetected
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <img src={MovementIcon} alt="Movement Icon" />
                              <h2> Anwesenheit erkannt </h2>
                              <h1 className="text-base font-medium text-black">
                                {deviceData.movementDetected || "--"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2 `}
                            >
                              <img
                                className={`${
                                  deviceData.error ? "opacity-100" : "opacity-0"
                                }`}
                                src={ErrorIcon}
                                alt="Error Icon"
                              />
                              <h2
                                className={`${
                                  deviceData.error ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                {" "}
                                Fehler{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.error ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                {deviceData.error || "--"}
                              </h1>
                              <h2
                                className={`${
                                  deviceData.timestamp
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {" "}
                                Letztes Datenpaket{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.timestamp
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {formatTimestamp(deviceData.timestamp)}
                              </h1>
                            </div>
                          </div>
                        )}

                        {item?.deviceType === "Heizthermostat" && (
                          <div className="flex flex-row items-start justify-around gap-24 px-2">
                            <div className="flex flex-col items-start justify-start gap-2">
                              <img
                                src={ThermometerIcon}
                                alt="Thermometer Icon"
                                className={`${
                                  deviceData.targetTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <h2
                                className={`${
                                  deviceData.targetTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {" "}
                                Soll-Temperatur{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.targetTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {`${deviceData.targetTemperature}°C` || "--"}
                              </h1>
                              <h2
                                className={`${
                                  deviceData.currentTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {" "}
                                Sensor-Temperatur{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.currentTemperature
                                    ? "opacity-100"
                                    : "opacity-0"
                                } `}
                              >
                                {`${deviceData.currentTemperature}°C` || "--"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2 ${
                                deviceData.currentHumidity
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <img src={HumidityIcon} alt="Humidity Icon" />
                              <h2> Luftfeuchtigkeit </h2>
                              <h1 className="text-base font-medium text-black">
                                {`${deviceData.currentHumidity}%` || "--"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2 ${
                                deviceData.valvePositionInPercent !== "" &&
                                deviceData.valvePositionInPercent !== null
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <img
                                src={ValvePositionIcon}
                                alt="Valve Position Icon"
                              />
                              <h2> Ventilöffnung in % </h2>
                              <h1 className="text-base font-medium text-black">
                                {`${deviceData.valvePositionInPercent}%` ||
                                  "--"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2  ${
                                deviceData.childLock !== null
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <img src={ChildLockIcon} alt="Child Lock Icon" />
                              <h2> Kindersicherung </h2>
                              <h1 className="text-base font-medium text-black">
                                {deviceData.childLock ? "An" : "Aus"}
                              </h1>
                            </div>
                            <div
                              className={`flex flex-col items-start justify-start gap-2 `}
                            >
                              <img
                                className={`${
                                  deviceData.error ? "opacity-100" : "opacity-0"
                                }`}
                                src={ErrorIcon}
                                alt="Error Icon"
                              />
                              <h2
                                className={`${
                                  deviceData.error ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                {" "}
                                Fehler{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.error ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                {deviceData.error || "--"}
                              </h1>
                              <h2
                                className={`${
                                  deviceData.timestamp
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {" "}
                                Letztes Datenpaket{" "}
                              </h2>
                              <h1
                                className={`text-base font-medium text-black ${
                                  deviceData.timestamp
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              >
                                {formatTimestamp(deviceData.timestamp)}
                              </h1>
                            </div>
                          </div>
                        )}

                        {item?.deviceType === "Type C" && (
                          <div className="flex flex-row items-start justify-start px-5 gap-52">
                            <div className="flex flex-col items-start justify-start gap-2">
                              <img
                                src={OpenCloseWindowIcon}
                                alt="Open Close Window Icon"
                              />
                              <h2> Status </h2>
                              <h1 className="text-base font-medium text-black">
                                {deviceData.openClose || "--"}
                              </h1>
                            </div>
                            <div className="flex flex-col items-start justify-start gap-2">
                              <img src={ErrorIcon} alt="Error Icon" />
                              <h2> Fehler </h2>
                              <h1 className="text-base font-medium text-black">
                                {deviceData.error || "--"}
                              </h1>
                            </div>
                            <div className="flex flex-col items-start justify-start gap-2">
                              <BsFillCalendarDateFill className="text-2xl" />
                              <h2> Letztes Datenpaket </h2>
                              <h1 className="text-base font-medium text-black">
                                {formatTimestamp(deviceData.timestamp)}
                              </h1>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>

        {tableData.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full bg-slate-100">
            <p className="w-full py-2 italic font-semibold text-center">
              Keine Ergebnisse
            </p>
          </div>
        )}

        <div className="flex flex-row items-center justify-between w-full p-3">
          {tableData && (
            <p className="text-sm font-light text-gray-500">
              {" "}
              <span className="font-bold text-black">
                {startIndex}-{endIndex}
              </span>{" "}
              von <span className="font-bold text-black">{totalItems}</span>
            </p>
          )}

          {/* Pagination */}
          <div className="flex justify-end border border-gray-200 rounded-md w-fit">
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
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white rounded-sm hover:bg-gray-100"
              >
                1
              </button>
            )}
            {startPage > 2 && (
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white rounded-sm">
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
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white rounded-sm">
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

export default DeviceManagementTable;
