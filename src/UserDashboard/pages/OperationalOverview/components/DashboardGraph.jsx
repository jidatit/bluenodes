import React, { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { MultiSelect } from "primereact/multiselect";
import DateFilter from "../../StatusPage/components/dateFilter/DateFilter";

const generateDummyData = (points, min, max) => {
	return Array.from({ length: points }, (_, i) => ({
		x: new Date(Date.now() + i * 3600000).getTime(),
		y: Math.floor(Math.random() * (max - min + 1) + min),
	}));
};

const Dashboard = () => {
	const [selectedDevice, setSelectedDevice] = useState([]);
	const temperatureData = generateDummyData(24, 15, 30);
	const humidityData = generateDummyData(24, 30, 70);
	const [apiData, setApiData] = useState(null);
	const [dates, setDates] = useState(null);
	const [selectedDropdownOption, setSelectedDropdownOption] =
		useState("Schnellauswahl");
	const [dropDownValue, setDropDownValue] = useState("Schnellauswahl");
	const [closeDateFilter, setCloseDateFilter] = useState(false);
	const dateFilterRef = useRef(null);
	const [subDropdownValue, setSubDropdownValue] = useState(null);
	const [dateTo, setdateTo] = useState(null);
	const [dateFrom, setdateFrom] = useState(null);
	const handleDatesChange = (newDates) => {
		console.log("datechanges");
		if (!newDates || !newDates[0]) {
			setdateFrom(null);
			setdateTo(null);
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
			zoom: { enabled: false },
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
			<div className="flex-grow overflow-auto !pt-2 p-6">
				<div className="flex justify-start w-2">
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
							className="w-full md:w-18rem"
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
