import { useEffect, useState } from "react";
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
      startDate.setDate(startDate.getDate());

      // Add one day to the end date
      endDate.setDate(endDate.getDate());
      break;

    case "Yesterday":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1); // Subtract two days to get the day before yesterday
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1); // Yesterday + 1 day = Today
      break;

    case "Last 7 Days":
      // Set endDate to today (current time)
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999); // Set to the end of the day

      // Set startDate to 7 days ago
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7); // Subtract 7 days
      startDate.setHours(0, 0, 0, 0); // Set to the start of the day

      break;

    case "Last 30 days":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30); // 30 days ago
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1); // Include end of the day (next day)
      break;

    case "LastYear":
      // Set startDate to January 1st of the last year
      startDate = new Date(now.getFullYear() - 1, 0, 1); // Jan 1st of last year
      startDate.setHours(0, 0, 0, 0); // Set to the start of the day

      // Set endDate to December 31st of the last year
      endDate = new Date(now.getFullYear() - 1, 11, 31); // Dec 31st of last year
      endDate.setHours(23, 59, 59, 999); // Set to the end of the day
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
  dateRef,
  onDatesChange,
  closeDropdown,
  setCloseDateFilter,
  setApiLocationsToBeSend,
  selectedLocationFilter,
}) => {
  const [selectedOption, setSelectedOption] = useState("Quick Select");
  const [showCalendar, setShowCalendar] = useState(false);
  const [subDropdownValue, setSubDropdownValue] = useState(null);
  const [dates, setDates] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDropdownOption, setSelectedDropdownOption] =
    useState("Quick Select");
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);

  const subDropdownOptions = [
    { key: "Today", label: "Today" },
    { key: "Yesterday", label: "Yesterday" },
    { key: "Last 7 Days", label: "Last 7 Days" },
    { key: "Last30days", label: "Last 30 days" },
    { key: "LastYear", label: "LastYear" },
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
      if (selectedDropdownOption === "Quick Select") {
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

  const handleDropdownChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedDropdownOption(selectedValue);

    setDropdownOpen(true);

    if (selectedValue === "Quick Select") {
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
    setSelectedDropdownOption("Quick Select");
    setShowCalendar(false);
    setSubDropdownValue(null);
    let startDate = null,
      endDate = null;
    setDates(startDate, endDate);
    onDatesChange(startDate, endDate);
  };
  return (
    <div
      className="relative flex w-fit items-start space-y-2 z-50"
      ref={dateRef}
    >
      <div className="relative w-full flex flex-col gap-x-2">
        <div className=" flex gap-3">
          <button
            onClick={toggleDropdown}
            className="flex justify-between text-gray-500 items-center text-[1rem] w-40 min-w-60 px-4 py-[0.623rem] bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
        <div className=" flex flex-col gap-2 absolute top-14 ">
          {dropdownOpen && (
            <div className=" mt-2 py-2 bg-[#ffffff] border border-gray-300 rounded-md shadow-lg w-[23rem] z-20">
              <div className="p-2 flex gap-x-3 justify-center items-center">
                <div className="flex items-center justify-center">
                  <RadioButton
                    inputId="Quick Select"
                    name="dateFilter"
                    value="Quick Select"
                    onChange={handleDropdownChange}
                    checked={selectedDropdownOption === "Quick Select"}
                  />
                  <label htmlFor="Last30days" className="ml-2">
                    Quick Select
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
            <div className=" py-2 px-4 bg-[#ffffff] border border-gray-300 rounded-md shadow-lg w-[23rem] z-50">
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
            <div
              className=" p-6 ccc relative shadow-lg bg-white w-[23rem] rounded-lg border z-50"
              // ref={dateRef}
            >
              <Calendar
                // dateRef={dateRef}
                value={dates}
                onChange={handleCalendarChange}
                selectionMode="range"
                readOnlyInput={true}
                dateFormat="dd.mm.yy"
                hideOnRangeSelection
                showIcon
                appendTo={"self"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
