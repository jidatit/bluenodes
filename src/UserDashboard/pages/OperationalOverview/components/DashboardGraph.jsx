import React, { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { MultiSelect } from "primereact/multiselect";
import DateFilter from "../../StatusPage/components/dateFilter/DateFilter";
import ApiUrls from "../../../../globals/apiURL";
import axios from "axios";

import { Dropdown } from "primereact/dropdown";

import { data } from "autoprefixer";
import { IoEllipseSharp } from "react-icons/io5";

const Dashboard = (roomId) => {
  const [selectedDevice, setSelectedDevice] = useState("");
  //   const temperatureData = generateDummyData(24, 15, 30);
  const [temperatureData, setTemperatureData] = useState([]);
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
  const [valvePositionData, setValvePositionData] = useState({
    valveFormattedData: [],
    valveMin: 0,
    valveMax: 100,
  });

  const getTodayDate = () => new Date().toISOString().split("T")[0];

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
      setCloseDateFilter(true);
    }
  };

  const commonOptions = {
    chart: {
      // height: 200,
      toolbar: { show: false },
      zoom: { enabled: true},
      fontFamily: "Inter, sans-serif", // Sets the global font to Inter
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      type: "datetime",
      labels: {
        format: "HH:mm",
        style: { fontFamily: "Inter, sans-serif" }, // Apply Inter font to x-axis labels
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}${value === 100 ? "" : "%"}`,
        style: { fontFamily: "Inter, sans-serif" }, // Apply Inter font to y-axis labels
      },
    },
    tooltip: {
      x: {
        format: "HH:mm",
        style: { fontFamily: "Inter, sans-serif" }, // Apply Inter font to tooltip
      },
    },
    title: {
      style: { fontFamily: "Inter, sans-serif" }, // Apply Inter font to the chart title if present
    },
    legend: {
      fontFamily: "Inter, sans-serif", // Apply Inter font to the legend text if used
    },
  };

  //FORMATIING THE humidityData here data here POSTION DATA HERE
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

  const convertUTCToGermanTime = (utcDateTimeString) => {
    const date = new Date(utcDateTimeString);

    // Set options for the date format in German without hour and seconds
    const options = {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    // Use Intl.DateTimeFormat to format the date to German
    const dateFormatter = new Intl.DateTimeFormat("de-DE", options);
    return dateFormatter.format(date); // Format as "dd.mm.yyyy"
  };

  const formatHumidityData = (data) => {
    if (data.length === 0) return { formattedData: [], min: 0, max: 100 };

    const formattedData = data.map((item) => {
      const dateG = convertUTCToGermanTime(item.createdAt);
      const date = new Date(item.createdAt);

      return {
        x: date.toLocaleString(),
        y: Math.round(item.humidity),
        timestamp: date.getTime(),
      };
    });

    const humidityValues = formattedData.map((item) => item.y);
    const minHumidity = Math.min(...humidityValues);
    const maxHumidity = Math.max(...humidityValues);
    const adjustedMin = Math.max(0, Math.floor((minHumidity - 5) / 5) * 5);
    const adjustedMax = Math.min(100, Math.ceil((maxHumidity + 5) / 5) * 5);

    const allData = [...humidityData];
    const startTime = new Date(
      Math.min(...allData.map((item) => new Date(item.createdAt).getTime()))
    );
    const endTime = new Date(
      Math.max(...allData.map((item) => new Date(item.createdAt).getTime()))
    );

    const timeDifference = endTime - startTime;
    let sequence = "";

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const monthsDifference =
      (endTime.getFullYear() - startTime.getFullYear()) * 12 +
      (endTime.getMonth() - startTime.getMonth());

    if (timeDifference < oneDay) {
      sequence = "HH:mm";
    } else if (timeDifference < oneWeek) {
      sequence = "dd.MM";
    } else if (monthsDifference < 12) {
      sequence = "dd.MM.yy";
    } else {
      sequence = "dd.MM.yy";
    }

    return {
      sequence: sequence,
      formattedData,
      min: adjustedMin,
      max: adjustedMax,
      tickAmount: Math.min(10, adjustedMax - adjustedMin),
    };
  };

  const { formattedData, min, max, sequence } =
    formatHumidityData(humidityData);

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
        opacityFrom: 0.3,
        opacityTo: 0,
        stops: [0, 80, 100],
      },
    },
    series: [
      {
        name: "Humidity",
        data: formattedData,
      },
    ],
    xaxis: {
      type: "datetime",
      labels: {
        format: sequence,
      },
    },
    yaxis: {
      min: min,
      max: max,
      labels: {
        formatter: (val) => `${val}%`,
      },
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

  //FORMATIING THE temperature data here POSTION DATA HERE
  const fetchTemperatureData = async () => {
    try {
      const url = ApiUrls.SMARTHEATING_CHART.ROOM_TEMPERATURE(
        roomId.roomId,
        dateFrom,
        dateTo
      );
      const response = await axios.get(`${ApiUrls.BASE_URL}${url}`);

      const { sequence, currentTemp, targetTemp, min, max, tickAmount } =
        formatTemperatureData(response.data);

      setTemperatureData({
        sequence: sequence,
        currentTemp: currentTemp,
        targetTemp: targetTemp,
        min: min,
        max: max,
        tickAmount: tickAmount,
      });
    } catch (error) {
      console.error("Error fetching temperature data:", error);
    }
  };
  const formatTemperatureData = (apiData) => {
    if (!apiData?.roomTemperature || !apiData?.targetTemperature) {
      return {
        currentTemp: [],
        targetTemp: [],
        min: 0,
        max: 40,
      };
    }

    const currentTemp = apiData.roomTemperature.map((item) => {
      const date = new Date(item.createdAt);
      return {
        x: date.toLocaleString(),
        y: Math.round(item.temperature),
        timestamp: date.getTime(),
      };
    });

    const targetTemp = apiData.targetTemperature.map((item) => {
      const date = new Date(item.createdAt);
      return {
        x: date.toLocaleString(),
        y: Math.round(item.temperature),
        timestamp: date.getTime(),
      };
    });

    const allTemps = [...currentTemp, ...targetTemp].map((item) => item.y);
    const minTemp = Math.min(...allTemps);
    const maxTemp = Math.max(...allTemps);

    const adjustedMin = Math.max(0, Math.floor((minTemp - 5) / 5) * 5);
    const adjustedMax = Math.min(100, Math.ceil((maxTemp + 5) / 5) * 5);

    const allData = [...currentTemp, ...targetTemp];
    const startTime = new Date(
      Math.min(...allData.map((item) => item.timestamp))
    );
    const endTime = new Date(
      Math.max(...allData.map((item) => item.timestamp))
    );

    const timeDifference = endTime - startTime;
    let sequence = "";

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const monthsDifference =
      (endTime.getFullYear() - startTime.getFullYear()) * 12 +
      (endTime.getMonth() - startTime.getMonth());

    if (timeDifference < oneDay) {
      sequence = "dd:mm";
    } else if (timeDifference < oneWeek) {
      sequence = "dd.MM";
    } else if (monthsDifference < 12) {
      sequence = "dd.MM.yy";
    } else {
      sequence = "dd.MM.yy";
    }

    return {
      sequence,
      currentTemp,
      targetTemp,
      min: adjustedMin,
      max: adjustedMax,
      tickAmount: Math.min(10, adjustedMax - adjustedMin),
    };
  };

  const temperatureOptions = {
    ...commonOptions,
    chart: { ...commonOptions.chart, type: "area", width: "100%" },
    title: {
      text: "Room temperature",
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
    colors: ["#0CB4D5", "#048FAB"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 35, 100],
      },
    },

    series: [
      { name: "Current temperature", data: temperatureData.currentTemp },
      {
        name: "Target temperature",
        // data: temperatureData.map((point) => ({ ...point, y: 19 })),
        data: temperatureData.targetTemp,
      },
    ],
    xaxis: {
      type: "datetime",
      labels: {
        format: temperatureData.sequence,
      },
    },
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 5,
      padding: {
        top: 10,
        bottom: 10,
      },
    },
    yaxis: {
      ...commonOptions.yaxis,
      tickAmount: 4,
      min: temperatureData.min,
      max: temperatureData.max,
      labels: {
        formatter: (value) => `${value}${value === 100 ? "°C" : "°C"}`,
      },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "left",
      offsetY: 10, // Adds some top margin to the legend
      fontFamily: "Inter, sans-serif",
      fontSize: "12px",
      markers: {
        width: 10,
        height: 10,
        radius: 5,
      },
      itemMargin: {
        vertical: 4,
      },
    },

  };

  //FORMATIING THE VALVE POSTION DATA HERE
  const [deviceNames, setDeviceNames] = useState([]);
  const [tempValveData, setTempValveData] = useState({
    valveFormattedData: [],
    valveMin: 0,
    valveMax: 100,
  });

  const fetchValvePositionData = async () => {
    try {
      const url = ApiUrls.SMARTHEATING_CHART.VALVE_POSITION(
        roomId.roomId,
        dateFrom,
        dateTo
      );
      const response = await axios.get(`${ApiUrls.BASE_URL}${url}`);
      const { valveFormattedData, valveMin, valveMax, sequence } =
        formatValvePositionData(response.data);

      //   const filteredData = valveFormattedData.filter(
      //     (item) =>
      //       item.deviceName.toLowerCase().replace(/\s+/g, "") === selectedDevice
      //   );

      setValvePositionData({
        sequence: sequence,
        valveFormattedData,
        valveMin,
        valveMax,
      });
      setTempValveData({
        valveFormattedData,
        valveMin,
        valveMax,
      });
    } catch (error) {
      console.error("Error fetching valve position data:", error);
    }
  };
  //   const formatValvePositionData = (data) => {
  //     if (!data || data.length === 0)
  //       return { valveFormattedData: [], valveMin: 0, valveMax: 100 };

  //     const uniqueDeviceNames = [
  //       ...new Set(data.map((device) => device.deviceName)),
  //     ];

  //     const deviceOptions = uniqueDeviceNames.map((deviceName) => ({
  //       label: deviceName,
  //       value: deviceName.toLowerCase().replace(/\s+/g, ""),
  //     }));

  //     setDeviceNames(deviceOptions);
  //     setSelectedDevice(deviceOptions[0].value);
  //     // if (selectedDevice === "") {
  //     //   console.log("selecteddeviceoptoins", deviceOptions[0].value);
  //     //   setSelectedDevice(deviceOptions[0].value);
  //     // }

  //     const valveFormattedData = data.flatMap((device) => {
  //       return device.data.map((item) => {
  //         const date = new Date(item.createdAt);
  //         return {
  //           deviceName: device.deviceName,
  //           x: date.toLocaleString(),
  //           y: Math.round(item.valvePosition / 25) * 25,
  //           timestamp: date.getTime(),
  //         };
  //       });
  //     });

  //     const startTime = new Date(
  //       Math.min(...valveFormattedData.map((item) => item.timestamp))
  //     );
  //     const endTime = new Date(
  //       Math.max(...valveFormattedData.map((item) => item.timestamp))
  //     );

  //     const timeDifference = endTime - startTime;
  //     let sequence = "";

  //     const oneDay = 24 * 60 * 60 * 1000;
  //     const oneWeek = 7 * oneDay;

  //     const monthsDifference =
  //       (endTime.getFullYear() - startTime.getFullYear()) * 12 +
  //       (endTime.getMonth() - startTime.getMonth());

  //     if (timeDifference < oneDay) {
  //       sequence = "HH:mm";
  //     } else if (timeDifference < oneWeek) {
  //       sequence = "dd.MM";
  //     } else if (monthsDifference < 12) {
  //       sequence = "dd.MM.yy";
  //     } else {
  //       sequence = "dd.MM.yy";
  //     }

  //     const valvePositions = valveFormattedData.map((item) => item.y);
  //     const minValvePosition = Math.min(...valvePositions);
  //     const maxValvePosition = Math.max(...valvePositions);
  //     const adjustedMin = Math.max(0, Math.floor((minValvePosition - 5) / 5) * 5);
  //     const adjustedMax = Math.min(
  //       100,
  //       Math.ceil((maxValvePosition + 5) / 5) * 5
  //     );

  //     return {
  //       sequence: sequence,
  //       valveFormattedData,
  //       valveMin: adjustedMin,
  //       valveMax: adjustedMax,
  //       tickAmount: Math.min(10, adjustedMax - adjustedMin),
  //     };
  //   };
  const formatValvePositionData = (data) => {
    if (!data || data.length === 0)
      return { valveFormattedData: [], valveMin: 0, valveMax: 100 };

    const valveFormattedData = data.map((device) => ({
      name: device.deviceName,
      data: device.data.map((item) => {
        const date = new Date(item.createdAt);
        return {
          x: date.toLocaleString(),
          y: Math.round(item.valvePosition / 25) * 25,
          timestamp: date.getTime(),
        };
      }),
    }));

    const allTimestamps = valveFormattedData.flatMap((series) =>
      series.data.map((item) => item.timestamp)
    );
    const startTime = new Date(Math.min(...allTimestamps));
    const endTime = new Date(Math.max(...allTimestamps));

    const timeDifference = endTime - startTime;
    let sequence = "";

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const monthsDifference =
      (endTime.getFullYear() - startTime.getFullYear()) * 12 +
      (endTime.getMonth() - startTime.getMonth());

    if (timeDifference < oneDay) {
      sequence = "HH:mm";
    } else if (timeDifference < oneWeek) {
      sequence = "dd.MM";
    } else if (monthsDifference < 12) {
      sequence = "dd.MM.yy";
    } else {
      sequence = "dd.MM.yy";
    }

    const valvePositions = valveFormattedData.flatMap((series) =>
      series.data.map((item) => item.y)
    );
    const minValvePosition = Math.min(...valvePositions);
    const maxValvePosition = Math.max(...valvePositions);
    const adjustedMin = Math.max(0, Math.floor((minValvePosition - 5) / 5) * 5);
    const adjustedMax = Math.min(
      100,
      Math.ceil((maxValvePosition + 5) / 5) * 5
    );

    return {
      sequence,
      valveFormattedData,
      valveMin: adjustedMin,
      valveMax: adjustedMax,
    };
  };
  const valvePositionOptions = {
    ...commonOptions,
    chart: {
      ...commonOptions.chart,
      type: "line",
      toolbar: { show: false },
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
      width: 2, // Make the line smaller (reduce the width)
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5, // Make the start color lighter
        opacityTo: 0, // Make the color fully transparent at the end
        stops: [0, 80, 100], // Transition to transparency quickly
      },
    },
    // series: [
    //   { name: "Valve position", data: valvePositionData.valveFormattedData },
    // ],
    series: valvePositionData.valveFormattedData,
    xaxis: {
      //   type: "category",
      //   labels: {
      //     format: "HH:mm",
      //   },
      type: "datetime",
      labels: {
        format: valvePositionData.sequence,
      },
    },
    yaxis: {
      ...commonOptions.yaxis,
      tickAmount: 4,
      tickPlacement: "between",
      min: valvePositionData.valveMin,
      max: 101, // Slightly above 100 to avoid cutoff
      labels: {
        formatter: (val) => {
          if (val > 100) return "100%";
          return `${Math.floor(val)}%`; 
        },
      },
      offset: 0,
    },
    
    grid: {
      borderColor: "#e0e0e0",
      strokeDashArray: 5,
      padding: {
        top: 10,
        bottom: 10, // Adjust this value to control spacing at the bottom
      },
    },
    legend: {
      show: true,
      onItemClick: {
        toggleDataSeries: true, // Enables toggling series by clicking on legend
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
  };

  //   const filterValveDataByDevice = () => {
  //     const filteredData = tempValveData.valveFormattedData.filter(
  //       (item) =>
  //         item.deviceName.toLowerCase().replace(/\s+/g, "") === selectedDevice
  //     );

  //     return filteredData;
  //   };
  //   useEffect(() => {
  //     if (tempValveData.valveFormattedData.length > 0) {
  //       const filteredData = filterValveDataByDevice();
  //       setValvePositionData((prev) => ({
  //         ...prev,
  //         valveFormattedData: filteredData,
  //       }));
  //     }
  //   }, [selectedDevice]);

  const handleMultiSelectClick = () => {};

  const handleMultiSelectHide = () => {};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target)
      ) {
        setCloseDateFilter(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateFilterRef]);

  useEffect(() => {
    if (roomId) {
      fetchTemperatureData();
      fetchHumidityData();
      fetchValvePositionData();
    }
  }, [dateFrom, dateTo]);

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
        <div className="">
          <ReactApexChart
            options={temperatureOptions}
            s
            series={temperatureOptions.series}
            type="area"
            height={370}
          />
        </div>
        <div className=" ">
          <ReactApexChart
            options={humidityOptions}
            series={humidityOptions.series}
            type="area"
            height={370}
          />
        </div>
        <div className=" relative">
          <ReactApexChart
            options={valvePositionOptions}
            series={valvePositionOptions.series}
            type="area"
            height={370}
          />
          {/* <div className="absolute top-4 right-4">
            <Dropdown
              value={selectedDevice}
              onShow={handleMultiSelectClick}
              onHide={handleMultiSelectHide}
              onChange={(e) => setSelectedDevice(e.value)}
              showSelectAll={false}
              options={deviceNames}
              optionLabel="label"
              placeholder="Alle Ereignisse"
              display="chip"
              className="w-fit flex items-center custom-multiselect"
              panelClassName="custom-multiselect-panel"
              panelStyle={{
                border: "0.5px solid #bababa",
                borderRadius: "4px",
              }}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
