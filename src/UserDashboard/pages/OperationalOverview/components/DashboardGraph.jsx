import React, { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { MultiSelect } from "primereact/multiselect";
import DateFilter from "../../StatusPage/components/dateFilter/DateFilter";
import ApiUrls from "../../../../globals/apiURL";
import axios from "axios";

const generateDummyData = (points, min, max) => {
  return Array.from({ length: points }, (_, i) => ({
    x: new Date(Date.now() + i * 3600000).getTime(),
    y: Math.floor(Math.random() * (max - min + 1) + min),
  }));
};

const Dashboard = (roomId) => {
  const [selectedDevice, setSelectedDevice] = useState([]);
  const temperatureData = generateDummyData(24, 15, 30);
  // const humidityData = generateDummyData(24, 30, 70);
  const [humidityData, setHumidityData] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [dates, setDates] = useState(null);
  const [selectedDropdownOption, setSelectedDropdownOption] =
    useState("Schnellauswahl");
  const [dropDownValue, setDropDownValue] = useState("Schnellauswahl");
  const [closeDateFilter, setCloseDateFilter] = useState(false);
  const dateFilterRef = useRef(null);
  const [subDropdownValue, setSubDropdownValue] = useState(null);

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getThirtyDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  };
  const [dateTo, setdateTo] = useState(getTodayDate());
  const [dateFrom, setdateFrom] = useState(getTodayDate());
  const handleDatesChange = (newDates) => {
    if (!newDates || !newDates[0]) {
      setdateFrom(getTodayDate());
      setdateTo(getTodayDate());
      return;
    }
    if (newDates[0] && newDates[1]) {
      let from = newDates[0];
      setdateFrom(from);
      let to = newDates[1];
      setdateTo(to);
    }
  };

  const valvePositionData = generateDummyData(24, 0, 100).map((point) => ({
    ...point,
    y: Math.round(point.y / 25) * 25,
  }));

  const commonOptions = {
    chart: {
      height: 200,
      toolbar: { show: false },
      zoom: { enabled: true },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      type: "datetime",
      labels: { format: "HH:mm" },
    },
    yaxis: {
      labels: { formatter: (value) => `${value}${value === 100 ? "" : "%"}` },
    },
    tooltip: { x: { format: "HH:mm" } },
  };

  const temperatureOptions = {
    ...commonOptions,
    chart: { ...commonOptions.chart, type: "area" },
    title: {
      text: "Room temperature",
      align: "left",
      style: {
        fontFamily: "Inter, sans-serif", // Applying Inter font
        fontSize: "14px", // Font size as requested
        fontWeight: 700, // Make the font bold
        lineHeight: "21px", // Line height as requested
        textAlign: "left", // Text alignment
        color: "#1F2937", // Gray/900 in hex (#1F2937)
      },
    },
    colors: ["#0CB4D5", "#048FAB"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4, // Make the start color lighter
        opacityTo: 0, // Make the color fully transparent at the end
        stops: [0, 35, 100], // Transition to transparency quickly
      },
    },
    series: [
      { name: "Current temperature", data: temperatureData },
      {
        name: "Target temperature",
        data: temperatureData.map((point) => ({ ...point, y: 19 })),
      },
    ],
    grid: {
      borderColor: "#e0e0e0", // Set the grid line color
      strokeDashArray: 5, // This makes the grid lines dotted (set the dash length)
      padding: {
        top: 10, // Adjust this value to control spacing at the top
        bottom: 10, // Adjust this value to control spacing at the bottom
      },
    },
    yaxis: {
      ...commonOptions.yaxis,
      tickAmount: 4,
      min: 0, // Adds extra space below the bottom line
      max: 40, // Adds extra space above the top line
      labels: { formatter: (value) => `${value}${value === 100 ? "" : "°C"}` },
    },
  };
  const formatHumidityData = (data) => {
    if (data.length === 0) return { formattedData: [], min: 0, max: 100 };

    const formattedData = data.map((item) => {
      const date = new Date(item.createdAt);
      return {
        x: date.toLocaleString(),
        y: Math.round(item.humidity),
        timestamp: date.getTime(),
      };
    });

    // Calculate min and max humidity values
    const humidityValues = formattedData.map((item) => item.y);
    const minHumidity = Math.min(...humidityValues);
    const maxHumidity = Math.max(...humidityValues);
    const adjustedMin = Math.max(0, Math.floor((minHumidity - 5) / 5) * 5);
    const adjustedMax = Math.min(100, Math.ceil((maxHumidity + 5) / 5) * 5);

    return {
      formattedData,
      min: adjustedMin,
      max: adjustedMax,
      tickAmount: Math.min(10, adjustedMax - adjustedMin),
    };
  };

  // Assuming humidityData is the incoming response

  const { formattedData, min, max } = formatHumidityData(humidityData);

  const humidityOptions = {
    ...commonOptions,
    chart: {
      ...commonOptions.chart,
      type: "area",
    },
    title: {
      text: "Humidity",
      align: "left",
      style: {
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: "21px",
        textAlign: "left",
        color: "#1F2937",
      },
    },
    colors: ["#0CB4D5"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 60, 100],
      },
    },
    series: [
      {
        name: "Humidity",
        data: formattedData,
      },
    ],
    xaxis: {
      type: "category",
      labels: {
        format: "HH:mm",
      },
    },
    yaxis: {
      min: min,
      max: max,
    },
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 5,
      padding: {
        top: 10,
        bottom: 10,
      },
    },
  };

  const valvePositionOptions = {
    ...commonOptions,
    chart: {
      ...commonOptions.chart,
      type: "line",
      toolbar: { show: false }, // Hides the toolbar if unnecessary
    },
    title: {
      text: "Valve position",
      align: "left",
      style: {
        fontFamily: "Inter, sans-serif", // Applying Inter font
        fontSize: "14px", // Font size as requested
        fontWeight: 700, // Make the font bold
        lineHeight: "21px", // Line height as requested
        textAlign: "left", // Text alignment
        color: "#1F2937", // Gray/900 in hex (#1F2937)
      },
    },
    colors: ["#0CB4D5"],
    stroke: {
      curve: "stepline",
      width: 1.5, // Make the line smaller (reduce the width)
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4, // Make the start color lighter
        opacityTo: 0, // Make the color fully transparent at the end
        stops: [0, 80, 100], // Transition to transparency quickly
      },
    },
    series: [{ name: "Valve position", data: valvePositionData }],
    yaxis: {
      ...commonOptions.yaxis,
      tickAmount: 4,
      min: 0, // Adds extra space below the bottom line
      max: 100, // Adds extra space above the top line
    },
    grid: {
      borderColor: "#e0e0e0", // Set the grid line color
      strokeDashArray: 5, // This makes the grid lines dotted (set the dash length)
      padding: {
        top: 10, // Adjust this value to control spacing at the top
        bottom: 10, // Adjust this value to control spacing at the bottom
      },
    },
  };

  const fetchApiData = async () => {
    try {
      // Example API call (replace with your actual API)
      const response = await fetch("/api/getData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ devices: selectedDevice }),
      });
      const data = await response.json();
      setApiData(data); // Store the fetched data in the state
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchHumidityData = async () => {
    try {
      const url = ApiUrls.SMARTHEATING_CHART.ROOM_HUMIDITY(
        roomId.roomId,
        dateFrom,
        dateTo
      );
      const response = await axios.get(`${ApiUrls.BASE_URL}${url}`);
      setHumidityData(response.data);
    } catch (error) {
      console.error("Error fetching humidity data:", error);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchHumidityData();
    }
  }, [roomId, dateFrom, dateTo]);

  // useEffect(() => {
  // 	if (selectedDevice.length > 0) {
  // 		// Call your API with the selected devices as a dependency
  // 		fetchApiData();
  // 	}
  // }, [selectedDevice]);
  const deviceOptions = [
    { label: "Device 1", value: "device1" },
    { label: "Device 2", value: "device2" },
    { label: "Device 3", value: "device3" },
  ];

  const handleMultiSelectClick = () => {};
  // if (selectedLocationFilter === 0) {
  // 	setApiLocationsToBeSend(null);
  // }
  // 	if (eventOpen === false) {
  // 		setEventOpen(true);
  // 		setCloseDateFilter(true);
  // 	}
  // 	setCloseDateFilter(true);
  // };
  const handleMultiSelectHide = () => {
    // if (eventOpen === true) {
    // 	setEventOpen(false);
    // }
  };
  const clearEventFilter = () => {
    setSelectedDevice([]);
  };
  useEffect(() => {
    // Function to handle click outside of the DateFilter
    const handleClickOutside = (event) => {
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target)
      ) {
        setCloseDateFilter(true);
        // Close dropdown if clicked outside
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateFilterRef]);

  return (
    <div className="h-[70vh] flex flex-col">
      <div className="flex-grow overflow-auto !pt-1 p-6 custom-scrollbar">
        <div className="flex justify-end items-end ">
          <DateFilter
            setSelectedDropdownOption={setSelectedDropdownOption}
            selectedDropdownOption={selectedDropdownOption}
            setDropDownValue={setDropDownValue}
            dropDownValue={dropDownValue}
            setDates={setDates}
            dates={dates}
            dateRef={dateFilterRef}
            closeDropdown={closeDateFilter}
            setCloseDateFilter={setCloseDateFilter}
            onDatesChange={handleDatesChange}
            // setApiLocationsToBeSend={setApiLocationsToBeSend}
            // selectedLocationFilter={selectedLocationFilter}
            setSubDropdownValue={setSubDropdownValue}
            subDropdownValue={subDropdownValue}
            Dashboard={true}
          />
        </div>
        <div className=" p-2">
          <ReactApexChart
            options={temperatureOptions}
            series={temperatureOptions.series}
            type="area"
            height={270}
          />
        </div>
        <div className=" p-2">
          <ReactApexChart
            options={humidityOptions}
            series={humidityOptions.series}
            type="area"
            height={370}
          />
        </div>
        <div className=" p-2 relative">
          <ReactApexChart
            options={valvePositionOptions}
            series={valvePositionOptions.series}
            type="area"
            height={270}
          />
          <div className="absolute top-4 right-4">
            <MultiSelect
              value={selectedDevice}
              onShow={handleMultiSelectClick}
              onHide={handleMultiSelectHide}
              onChange={(e) => setSelectedDevice(e.value)}
              showSelectAll={false}
              options={deviceOptions}
              optionLabel="label"
              filter
              placeholder="Alle Ereignisse"
              display="chip"
              className="w-fit flex items-center custom-multiselect"
              panelClassName="custom-multiselect-panel"
              panelStyle={{
                border: "0.5px solid #bababa",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
