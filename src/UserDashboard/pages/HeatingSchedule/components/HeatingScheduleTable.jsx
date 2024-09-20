/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { daysOfWeek } from "../../../../globals/daysofWeek";

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
	const rowHeight = 7; // Each row represents 20 pixels

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

	// Helper function to map data by translated day names
	const createLayouts = (groupedData, translatedDays) => {
		const layouts = {};
		
		translatedDays.forEach((day, index) => {
		layouts[day] = groupedData[index + 1].map((item, i) => ({
			w: 1,
			h: item.to - item.from,
			x: 0,
			y: item.from,
			i: `box-${day}-${i + 1}`,
			minW: 1,
			maxW: 2,
			minH: 4,
			maxH: 96,
			moved: false,
			static: false,
			temperature: item.targetTemperature.toString(),
		}));
		});
	
		return layouts;
	};

	const initialLayouts = createLayouts(groupedData, daysOfWeek)

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

	const timeLabels = Array.from({ length: 24 * 4 + 1 }, (_, index) => {
		const totalMinutes = (index % (24 * 4)) * 15; // Wrap around after 24 hours
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		const isFullHour = minutes === 0; // Check if it's a complete hour
	
		const isLastChild = index === 24 * 4; // Check if it is the last child
	
		return (
			<div
				key={index}
				style={{
					height: `${rowHeight}px`, // Consistent height
					margin: "0",
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "flex-start",
					fontSize: "12px",
					marginBottom: (index + 1) % 4 === 0 ? "2px" : "0px", // Apply mb 2px on every 4th child
					marginTop: isLastChild ? "-6px" : (index + 1) % 4 === 0 ? "-2px" : "0px", // Apply mt -6px for the last child
				}}
			>
				<p className={` ${isFullHour? 'mt-[-6px]':''}`}>{isFullHour ? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}` : ""}</p>
			</div>
		);
	});

	const [zoomGap, setZoomGap] = useState(0.58);

	useEffect(() => {
		if (zoomLevel) {
			if (zoomLevel === 1.100000023841858) {
				setZoomGap(0.59);
			} else if (zoomLevel === 1.2) {
				setZoomGap(0.63);
			} else if (zoomLevel === 1.25) {
				setZoomGap(0.605);
			} else if (zoomLevel === 1.5) {
				setZoomGap(0.58);
			} else if (zoomLevel === 1.75) {
				setZoomGap(0.599);
			} else {
				setZoomGap(0.58);
			}
		}
	}, [zoomLevel]);

	return (
		<div
			className={`flex flex-col gap-4 ${props?.noHeading ? "w-[98%]" : "w-full"} px-2`}
		>
			{/* {!props?.noHeading && (
				<h3 className="text-[16px] text-gray-500 font-semibold">
					Heating Schedule
				</h3>
			)} */}

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
							<div className="text-[#0BAAC9] bg-[#E7F9FD] w-full font-medium rounded-lg text-xs px-4 py-2 me-2 mb-2 border border-[#0BAAC9] flex items-center justify-between ">
								{day}
							</div>
						</div>
					))}
				</div>
				<div style={{ display: "flex", zIndex: "10" }} className="">
        {/* Time Labels */}
        <div style={{ width: "50px", gap: `${rowHeight}px` }} className=" flex flex-col">
          {timeLabels}
        </div>
        {/* Lines */}
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
            className="absolute top-[1px] left-0 bottom-0 right-0 w-full h-[102%] flex flex-col"
            style={{
              gap: `${rowHeight}px`, // Use rowHeight to match the height of labels
              zIndex: "10",
            }}
          >
            {Array.from({ length: 24 * 4 + 1 }).map((_, index) => (
              <div
                key={index}
                className="w-full border-t-2 border-[#E8E8E8] border-dotted z-10"
                style={{ height: `${rowHeight}px` }} // Consistent height with labels
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
									className="layout mt-[-4px] w-full z-10"
									compactType={null}
									layout={initialLayouts[day]}
									cols={1}
									rowHeight={4}
									width={150}
									isDraggable={false}
									isResizable={false}
								>
									{initialLayouts[day].map((box) => (
										<div
											key={box.i}
											className={`box relative pb-[3rem] w-full rounded-md z-10 ${
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
													<div>Soll-Temperatur fehlt</div>
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
