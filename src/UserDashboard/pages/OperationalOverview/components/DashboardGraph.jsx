import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const generateDummyData = (points, min, max) => {
  return Array.from({ length: points }, (_, i) => ({
    x: new Date(Date.now() + i * 3600000).getTime(),
    y: Math.floor(Math.random() * (max - min + 1) + min),
  }));
};

const Dashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState("Device 1");
  const temperatureData = generateDummyData(24, 15, 30);
  const humidityData = generateDummyData(24, 30, 70);
  const valvePositionData = generateDummyData(24, 0, 100).map((point) => ({
    ...point,
    y: Math.round(point.y / 25) * 25, // Round to nearest 25
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
    title: { text: "Room temperature", align: "left" },
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

  const humidityOptions = {
    ...commonOptions,
    chart: { ...commonOptions.chart, type: "area" },
    title: { text: "Humidity", align: "left" },
    colors: ["#0CB4D5"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4, // Make the start color lighter
        opacityTo: 0, // Make the color fully transparent at the end
        stops: [0, 60, 100], // Transition to transparency quickly
      },
    },

    series: [{ name: "Humidity", data: humidityData }],
    grid: {
      borderColor: "#e0e0e0", // Set the grid line color
      strokeDashArray: 5, // This makes the grid lines dotted (set the dash length)
      padding: {
        top: 10, // Adjust this value to control spacing at the top
        bottom: 10, // Adjust this value to control spacing at the bottom
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
    title: { text: "Valve position", align: "left" },
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

  return (
    <div className="h-[70vh] flex flex-col">
      <div className="flex-grow  overflow-auto space-y-4 p-2">
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
            height={270}
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
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-white border border-gray-300 rounded-md py-1 px-2 pr-8 appearance-none"
            >
              <option>Device 1</option>
              <option>Device 2</option>
              <option>Device 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
