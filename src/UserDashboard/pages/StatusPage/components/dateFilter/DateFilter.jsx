import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { CiCircleRemove } from "react-icons/ci";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import "../../../../../index.css";
import { Tooltip } from "flowbite-react";
const getDateRange = (option) => {
  const now = new Date();
  let startDate, endDate;

  switch (option) {
    case "Today":
      startDate = new Date(now);
      endDate = new Date(now);

      // Subtract one day from the start date
      startDate.setDate(startDate.getDate() - 1);

      // Add one day to the end date
      endDate.setDate(endDate.getDate() + 1);
      break;

    case "Yesterday":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 2); // Subtract two days to get the day before yesterday
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1); // Yesterday + 1 day = Today
      break;

    case "ThisWeek":
      const currentDay = now.getDay();
      const startOfWeek = new Date(now);

      // Set to Monday, then subtract one more day
      startOfWeek.setDate(
        now.getDate() - currentDay + (currentDay === 0 ? -7 : 0) - 1
      );
      startDate = new Date(startOfWeek);

      // Set to the last day of the current week (Sunday) and add one day
      endDate = new Date(now);
      endDate.setDate(startDate.getDate() + 7);
      endDate.setDate(endDate.getDate() + 1);
      break;

    case "Last 30 days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 31); // Subtract 31 days to include the previous day before the 30-day range
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1); // Add one day to include tomorrow
      break;

    case "LastYear":
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setDate(startDate.getDate() - 1); // Subtract one more day for the year
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1); // Add one day to include tomorrow
      break;

    case "AllDates":
      startDate = new Date(1900, 0, 1); // Arbitrary far past date
      endDate = new Date(2100, 11, 31); // Arbitrary far future date

      // No need to adjust since we're already covering all possible dates
      break;

    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1); // Default to include the previous day
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1); // Default to include the next day
      break;
  }

  // Ensure endDate is at the end of the day
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
};

const DateFilter = ({
  onDatesChange,
  closeDropdown,
  setCloseDateFilter,
  setApiLocationsToBeSend,
  selectedLocationFilter,
}) => {
  const [selectedOption, setSelectedOption] = useState("last30Days");
  const [showCalendar, setShowCalendar] = useState(false);
  const [subDropdownValue, setSubDropdownValue] = useState(null);
  const [dates, setDates] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDropdownOption, setSelectedDropdownOption] =
    useState("All Dates");
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);

  const subDropdownOptions = [
    { key: "Today", label: "Today" },
    { key: "Yesterday", label: "Yesterday" },
    { key: "ThisWeek", label: "This Week" },
    { key: "Last30days", label: "Last 30 days" },
    { key: "LastYear", label: "Last year" },
  ];
  useEffect(() => {
    if (closeDropdown === true) {
      setDropdownOpen(false);
      setSubDropdownOpen(false);
      setShowCalendar(false);
    }
  }, [closeDropdown]);
  const toggleDropdown = () => {
    if (dropdownOpen === false) {
      if (selectedLocationFilter === 0) {
        setApiLocationsToBeSend(null);
      }

      setDropdownOpen(true);
      setSubDropdownOpen(false);
      setCloseDateFilter(false);
      if (selectedDropdownOption === "Last30days") {
        setSubDropdownOpen(true);
      } else if (selectedDropdownOption === "SpecificDateRange") {
        setShowCalendar(true);
      }
    } else {
      setDropdownOpen(false);

      setSubDropdownOpen(false);
      setShowCalendar(false);
    }
  };

  const resetToDefault = () => {
    setDropdownOpen(false);
    setCloseDateFilter(false);
    setSubDropdownOpen(false);
    setShowCalendar(false);
    setSelectedDropdownOption("All Dates");
    let startDate = null,
      endDate = null;
    setDates(startDate, endDate);
    onDatesChange(startDate, endDate);
  };

  const handleDropdownChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedDropdownOption(selectedValue);

    setDropdownOpen(true);

    if (selectedValue === "Last30days") {
      setSubDropdownOpen(true);
      setShowCalendar(false);
      setDates(null); // Reset dates for the specific date range
    } else {
      setSubDropdownOpen(false);
      setShowCalendar(true);
      setSubDropdownValue(null); // Reset sub-dropdown value
      setDates(null); // Ensure dates are reset
    }

    setSelectedOption(selectedValue);
  };

  const handleSubDropdownChange = (e) => {
    const value = e.value;
    setSubDropdownValue(value);

    const [startDate, endDate] = getDateRange(value);
    setDates([startDate, endDate]);
    onDatesChange([startDate, endDate]);
  };

  const handleCalendarChange = (e) => {
    if (e.value) {
      setDates(e.value);
      onDatesChange(e.value); // Notify parent component
    } else {
      setDates(null); // Reset or handle accordingly
    }
  };
  const clearFilter = () => {
    setDropdownOpen(false);
    setSubDropdownOpen(false);
    setCloseDateFilter(false);
    setSelectedDropdownOption("All Dates");
    setShowCalendar(false);
    setSubDropdownValue(null);
    let startDate = null,
      endDate = null;
    setDates(startDate, endDate);
    onDatesChange(startDate, endDate);
  };
  return (
    <div className="relative flex w-full items-start space-y-2 z-50">
      <div className="relative w-[90rem] flex gap-x-2">
        <button
          onClick={toggleDropdown}
          className="flex justify-between text-gray-500 items-center text-[15px] w-40 min-w-60 px-4 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {selectedDropdownOption}
          <span className="ml-2">
            <MdOutlineKeyboardArrowDown size={29} className="text-gray-400" />
          </span>{" "}
          {/* Down arrow */}
        </button>
        {dropdownOpen && (
          <button
            className="bg-red-500 px-4 py-2 text-white shadow-lg rounded-lg"
            onClick={clearFilter}
          >
            <Tooltip
              content={"remove Filter"}
              style="light"
              className="-mt-12 ml-24 bg-white shadow-lg"
            >
              <CiCircleRemove size={30} />
            </Tooltip>
          </button>
        )}

        {dropdownOpen && (
          <div className="absolute top-full mt-2 py-2 bg-[#ffffff] border border-gray-300 rounded-md shadow-lg w-[23rem] z-20">
            <div className="p-2 flex gap-x-3 justify-center items-center">
              <div className="flex items-center justify-center">
                <RadioButton
                  inputId="Last30days"
                  name="dateFilter"
                  value="Last30days"
                  onChange={handleDropdownChange}
                  checked={selectedDropdownOption === "Last30days"}
                />
                <label htmlFor="Last30days" className="ml-2">
                  Last 30 days
                </label>
              </div>
              <div className="flex items-center justify-center">
                <RadioButton
                  inputId="SpecificDateRange"
                  name="dateFilter"
                  value="SpecificDateRange"
                  onChange={handleDropdownChange}
                  checked={selectedDropdownOption === "SpecificDateRange"}
                />
                <label htmlFor="SpecificDateRange" className="ml-2">
                  Specific Date Range
                </label>
              </div>
            </div>
          </div>
        )}

        {subDropdownOpen && (
          <div className="absolute top-full mt-[4rem] py-2 px-4 bg-[#ffffff] border border-gray-300 rounded-md shadow-lg w-[23rem] z-50">
            {subDropdownOptions.map((category) => (
              <div key={category.key} className="flex items-center mb-2">
                <RadioButton
                  inputId={category.key}
                  name="category"
                  value={category.label}
                  onChange={handleSubDropdownChange}
                  checked={subDropdownValue === category.label}
                />
                <label htmlFor={category.key} className="ml-2">
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        )}

        {showCalendar && (
          <div className="absolute top-full p-6 left-0 mt-[4rem] shadow-lg bg-white w-[23rem] rounded-lg border z-50">
            <Calendar
              value={dates}
              onChange={handleCalendarChange}
              selectionMode="range"
              readOnlyInput={true}
              dateFormat="dd/mm/yy"
              hideOnRangeSelection
              showIcon
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;
