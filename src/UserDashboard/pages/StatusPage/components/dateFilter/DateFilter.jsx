import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import "../../../../../index.css";
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
      startDate = endDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case "ThisWeek":
      const currentDay = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(
        now.getDate() - currentDay + (currentDay === 0 ? -6 : 1)
      ); // Set to Monday
      startDate = startOfWeek;
      endDate = now;
      break;
    case "Last 30 days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      endDate = now;
      break;
    case "LastYear":
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      endDate = now;
      break;
    case "AllDates":
      startDate = new Date(1900, 0, 1); // Arbitrary far past date
      endDate = new Date(2100, 11, 31); // Arbitrary far future date
      break;
    default:
      startDate = new Date(now); // Default to today
      endDate = new Date(now);
      break;
  }

  // Ensure endDate is at the end of the day
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
};

const DateFilter = ({ onDatesChange, closeDropdown, setCloseDateFilter }) => {
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
    console.log("close", closeDropdown);
    if (closeDropdown) {
      resetToDefault();
    }
  }, [closeDropdown]);
  const toggleDropdown = () => {
    if (!dropdownOpen) {
      setDropdownOpen(true);
      setSubDropdownOpen(false);
    } else {
      resetToDefault();
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
    console.log(value);
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

  return (
    <div className="relative flex flex-col items-start space-y-2 z-50">
      <div className="relative">
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
