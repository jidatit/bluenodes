import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
const getDateRange = (option) => {
  const now = new Date();
  let startDate, endDate;

  switch (option) {
    case "Today":
      startDate = endDate = now;
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
    case "Last30days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      endDate = now;
      break;
    case "LastYear":
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      endDate = now;
      break;
    default:
      return [null, null];
  }

  // Ensure endDate is at the end of the day
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
};

const DateFilter = ({ onDatesChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [subDropdownValue, setSubDropdownValue] = useState(null);
  const [dates, setDates] = useState(null);

  const options = [
    { label: "Last 30 days", value: "Last30daysMenu" },
    { label: "Specific Date Range", value: "SpecificDateRange" },
  ];

  const subDropdownOptions = [
    { label: "Today", value: "Today" },
    { label: "Yesterday", value: "Yesterday" },
    { label: "This Week", value: "ThisWeek" },
    { label: "Last 30 days", value: "Last30days" },
    { label: "Last year", value: "LastYear" },
  ];

  const handleOptionChange = (e) => {
    const option = e.value;
    setSelectedOption(option);
    if (option === "SpecificDateRange") {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      const [startDate, endDate] = getDateRange(option);
      setDates([startDate, endDate]);
      onDatesChange([startDate, endDate]); // Notify parent component
    }
  };

  const handleCalendarChange = (e) => {
    setDates(e.value);
    onDatesChange(e.value); // Notify parent component
  };

  return (
    <div className="relative flex items-center space-x-2">
      <Dropdown
        value={selectedOption}
        options={options}
        onChange={handleOptionChange}
        placeholder="Last 30 days"
      />

      {selectedOption === "Last30daysMenu" && (
        <Dropdown
          value={subDropdownValue}
          options={subDropdownOptions}
          onChange={(e) => {
            const [startDate, endDate] = getDateRange(e.value);
            setSubDropdownValue(e.value);
            setDates([startDate, endDate]);
            onDatesChange([startDate, endDate]);
          }}
          placeholder="Select"
        />
      )}

      {dates !== null && (
        <button
          className="bg-red-500 px-3 py-1 text-white rounded-md text-nowrap"
          onClick={() => {
            setDates(null);
            setSelectedOption(null);
            onDatesChange([null, null]);
          }}
        >
          Clear Filter
        </button>
      )}

      {showCalendar && (
        <div className="absolute top-full p-3 left-0 mt-2 shadow-lg bg-white rounded-lg border z-50">
          <Calendar
            showButtonBar
            value={dates}
            onChange={handleCalendarChange}
            selectionMode="range"
            className="h-[30px]"
            readOnlyInput
            hideOnRangeSelection
            showIcon
          />
        </div>
      )}
    </div>
  );
};

export default DateFilter;
