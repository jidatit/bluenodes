/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

function HeatingScheduleTable({ locationDetails, props }) {
	const [zoomLevel, setZoomLevel] = useState(1);
	const updateZoomLevel = () => {
		const level =
			window.devicePixelRatio || window.outerWidth / window.innerWidth;
		setZoomLevel(level);
	};
	useEffect(() => {
		// Set the initial zoom level
		updateZoomLevel();

		// Update zoom level on window resize (as zoom might change)
		window.addEventListener("resize", updateZoomLevel);

		// Clean up the event listener on component unmount
		return () => {
			window.removeEventListener("resize", updateZoomLevel);
		};
	}, []);
	const daysOfWeek = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];
	const rowHeight = 7.3; // Each row represents 20 pixels

	// Helper function to convert time to units
	const convertTimeToUnits = (time) => {
		const [hours, minutes, seconds] = time.split(":").map(Number);
		// Map 23:59 to 96
		if (hours === 23 && minutes === 59) {
			return 96;
		}
		return hours * 4 + minutes / 15;
	};

	// Convert the times in the data
	locationDetails = locationDetails.days.map((item) => ({
		...item,
		from: convertTimeToUnits(item.from),
		to: convertTimeToUnits(item.to),
	}));

	// Group data by day
	let groupedData = locationDetails?.reduce((acc, obj) => {
		// If the day key doesn't exist, create it
		if (!acc[obj.day]) {
			acc[obj.day] = [];
		}
		// Push the object into the array for that day
		acc[obj.day].push(obj);
		return acc;
	}, {});

	// Dummy data for initial layouts
	const initialLayouts = {
		Monday: groupedData[1].map((item, index) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-Monday-${index + 1}`,
			minW: 1,
			maxW: 2,
			minH: 1,
			maxH: 24,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		})),
		Tuesday: groupedData[2].map((item, index) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-Tuesday-${index + 1}`,
			minW: 1,
			maxW: 2,
			minH: 1,
			maxH: 24,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		})),
		Wednesday: groupedData[3].map((item, index) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-Wednesday-${index + 1}`,
			minW: 1,
			maxW: 2,
			minH: 1,
			maxH: 24,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		})),
		Thursday: groupedData[4].map((item, index) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-Thursday-${index + 1}`,
			minW: 1,
			maxW: 2,
			minH: 1,
			maxH: 24,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		})),
		Friday: groupedData[5].map((item, index) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-Friday-${index + 1}`,
			minW: 1,
			maxW: 2,
			minH: 1,
			maxH: 24,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		})),
		Saturday: groupedData[6].map((item, index) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-Saturday-${index + 1}`,
			minW: 1,
			maxW: 2,
			minH: 1,
			maxH: 24,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		})),
		Sunday: groupedData[7].map((item, index) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-Sunday-${index + 1}`,
			minW: 1,
			maxW: 2,
			minH: 1,
			maxH: 24,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		})),
	};

	const handleTempColour = (temp) => {
		if (temp === null) {
			return "#CFF4FB";
		}
		if (temp === false) {
			return "#FFFFFF";
		} else if (temp < 10) {
			return "#DEF7EC";
		} else if (temp >= 10 && temp < 20) {
			return "#CFF4FB";
		} else if (temp >= 20 && temp <= 25) {
			return "#FEECDC";
		} else if (temp > 25) {
			return "#FDE8E8";
		} else {
			return "#CFF4FB";
		}
	};

	const handleTextColour = (temp) => {
		if (temp === null) {
			return "#0BAAC9";
		}
		if (temp === false) {
			return "#C81E1E";
		} else if (temp < 10) {
			return "#046C4E";
		} else if (temp >= 10 && temp < 20) {
			return "#0BAAC9";
		} else if (temp >= 20 && temp <= 25) {
			return "#B43403";
		} else if (temp > 25) {
			return "#C81E1E";
		} else {
			return "#0BAAC9";
		}
	};

	const timeLabels = Array.from({ length: 24 * 4 }, (_, index) => {
		const totalMinutes = index * 15;
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		const isFullHour = minutes === 0; // Check if it's a complete hour

		return (
			<div
				key={index}
				style={{
					height: `${rowHeight}px`,
					margin: "4px 0",
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "flex-start",
				}}
			>
				{isFullHour
					? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
					: ""}
			</div>
		);
	});
	const [zoomGap, setZoomGap] = useState(0.563);

	useEffect(() => {
		if (zoomLevel) {
			if (zoomLevel === 1.100000023841858) {
				setZoomGap(0.573);
			} else if (zoomLevel === 1.2) {
				setZoomGap(0.584);
			} else if (zoomLevel === 1.25) {
				setZoomGap(0.584);
			} else if (zoomLevel === 1.5) {
				setZoomGap(0.56);
			} else if (zoomLevel === 1.75) {
				setZoomGap(1.77);
			} else {
				setZoomGap(0.563);
			}
		}
	}, [zoomLevel]);

	return (
		<div
			className={`flex flex-col gap-4 ${props?.noHeading ? "w-[98%]" : "w-full"} px-2`}
		>
			{!props?.noHeading && (
				<h3 className="text-[16px] text-gray-500 font-semibold">
					Heating Schedule
				</h3>
			)}

			<div className="">
				<div
					style={{
						display: "flex",
						justifyContent: "flex-start",
						gap: "12px",
						marginLeft: "60px",
						alignItems: "center",
						marginBottom: "10px",
						zIndex: "1000",
					}}
				>
					{daysOfWeek.map((day) => (
						<div
							key={day}
							style={{
								width: "100%",
								textAlign: "center",
								position: "relative",
								margin: "0",
							}}
						>
							<div className="text-[#0BAAC9] bg-[#E7F9FD] w-full font-medium rounded-lg text-xs px-3 py-2 me-2 mb-2 border border-[#0BAAC9] flex items-center justify-between ">
								{day}
							</div>
						</div>
					))}
				</div>
				<div style={{ display: "flex", zIndex: "10" }}>
					<div style={{ width: "60px" }} className=" pt-1">
						{timeLabels}
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "flex-start",
							gap: "12px",
							width: "100%",
							position: "relative",
							zIndex: "10",
						}}
					>
						<div
							className={`  absolute top-[16px] left-0 bottom-0 right-0 w-full h-full flex flex-col gap-[9px] z-10`}
							style={{
								gap: `${zoomGap}rem`,
								// transform: `scale(${zoomLevel})`,
								// transformOrigin: "top left",
							}}
						>
							{Array.from({ length: 25 * 4 }).map((_, index) => (
								<div
									key={index}
									className="w-full border-t-2 border-[#E8E8E8] border-dotted z-10"
								></div>
							))}
						</div>
						{daysOfWeek.map((day) => (
							<div
								key={day}
								style={{
									width: "100%",
									margin: "0 ",
									position: "relative",
									zIndex: "10",
								}}
							>
								<GridLayout
									className="layout pt-[6px] z-10"
									compactType={null}
									layout={initialLayouts[day]}
									cols={1}
									rowHeight={1.5}
									width={150}
									isDraggable={false}
									isResizable={false}
								>
									{initialLayouts[day].map((box) => (
										<div
											key={box.i}
											className={`box relative w-full rounded-md z-10 ${
												box.temperature === false ? "border border-red-500" : ""
											}`}
											style={{
												backgroundColor: handleTempColour(box.temperature),
												color: handleTextColour(box.temperature),
											}}
										>
											<div
												style={{
													padding: "10px 10px",
													position: "relative",
													zIndex: "1",
													fontSize: "12px",
												}}
											>
												{box.temperature !== false ? (
													box.temperature ? (
														`${box.temperature}°C`
													) : (
														"Fill in schedule"
													)
												) : (
													<div>Fill in schedule</div>
												)}
											</div>
										</div>
									))}
								</GridLayout>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default HeatingScheduleTable;
