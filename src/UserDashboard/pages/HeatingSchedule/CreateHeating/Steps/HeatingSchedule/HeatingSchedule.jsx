/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { IoMdClose } from "react-icons/io";
import { FaCircleCheck } from "react-icons/fa6";
import { errorMessages } from "../../../../../../globals/errorMessages";
import { IoArrowBackCircle } from "react-icons/io5";
import { Tooltip } from "flowbite-react";
import { LuGalleryHorizontal } from "react-icons/lu";

function HeatingSchedule({
	onUpdateLayouts,
	onUpdateCheck,
	setHandleCheckRef,
	handlePrev,
	finalScheduleData,
	clone,
	locationDetails,
}) {
	const daysOfWeek = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];
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
	locationDetails = locationDetails?.days.map((item) => ({
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

	const initialLayouts =
		clone && locationDetails
			? {
					Monday: groupedData[1].map((item, index) => ({
						w: 1,
						h: item.to - item.from,
						x: 0,
						y: item.from,
						i: `box-Monday-${index + 1}`,
						minW: 1,
						maxW: 2,
						minH: 4,
						maxH: 96,
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
						minH: 4,
						maxH: 96,
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
						minH: 4,
						maxH: 96,
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
						minH: 4,
						maxH: 96,
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
						minH: 4,
						maxH: 96,
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
						minH: 4,
						maxH: 96,
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
						minH: 4,
						maxH: 96,
						moved: false,
						static: false,
						temperature: item.targetTemperature.toString(),
					})),
				}
			: {
					Monday: [],
					Tuesday: [],
					Wednesday: [],
					Thursday: [],
					Friday: [],
					Saturday: [],
					Sunday: [],
				};

	const rowHeight = 20; // Each row represents 20 pixels

	// const [layouts, setLayouts] = useState(initialLayouts);
	const [layouts, setLayouts] = useState(
		finalScheduleData && Object.keys(finalScheduleData).length > 0
			? finalScheduleData
			: initialLayouts,
	);
	const [temperatureInputs, setTemperatureInputs] = useState({});
	const [showDropdown, setShowDropdown] = useState(null);
	const [copyTargetDay, setCopyTargetDay] = useState("");
	const [checked, setChecked] = useState(false);
	const [isResizingOrDragging, setIsResizingOrDragging] = useState(false);
	const [copyTargetDays, setCopyTargetDays] = useState([]);
	const [resizingBox, setResizingBox] = useState(null); // State to track which box is currently being resized
	const inputRefs = useRef({});
	const [editableBoxes, setEditableBoxes] = useState({});
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

	const editableBoxesRef = useRef(editableBoxes);
	const temperatureBoxesRef = useRef(temperatureInputs);

	// Update the ref whenever temperatureBoxes changes
	useEffect(() => {
		temperatureBoxesRef.current = temperatureInputs;
	}, [temperatureInputs]);

	// Update the ref whenever editableBoxes changes
	useEffect(() => {
		editableBoxesRef.current = editableBoxes;
	}, [editableBoxes]);

	const adjustLayoutForOverlap = (layout, old, newResize) => {
		// Check if two boxes overlap
		const boxesOverlap = (box1, box2) => {
			return (
				box1.i !== box2.i && // Ensure the boxes are not the same
				box1.y < box2.y + box2.h && // box1 starts before box2 ends
				box1.y + box1.h > box2.y // box1 ends after box2 starts
			);
		};

		// Iterate over the layout and handle overlaps
		return layout
			.map((box) => {
				if (boxesOverlap(box, newResize)) {
					const overlapTop = newResize.y - box.y;
					const overlapBottom = box.y + box.h - (newResize.y + newResize.h);

					if (overlapTop > 0 && overlapBottom > 0) {
						// Box is partially overlapped, adjust height
						if (overlapTop >= overlapBottom) {
							// Adjust height from the top
							return {
								...box,
								h: overlapTop,
							};
						} else {
							// Adjust height from the bottom
							return {
								...box,
								y: newResize.y + newResize.h,
								h: overlapBottom,
							};
						}
					} else if (overlapTop > 0) {
						// Box overlaps from the bottom only, adjust height
						return {
							...box,
							h: overlapTop,
						};
					} else if (overlapBottom > 0) {
						// Box overlaps from the top only, adjust height and position
						return {
							...box,
							y: newResize.y + newResize.h,
							h: overlapBottom,
						};
					} else {
						// Box is completely overlapped, remove it
						return null;
					}
				} else {
					// No overlap, keep the box as is
					return box;
				}
			})
			.filter(Boolean); // Filter out null values (boxes to be removed)
	};

	const handleContainerClick = (event) => {
		if (
			Object.keys(editableBoxes).length > 0 ||
			(Object.keys(editableBoxes).length > 0 && isResizingOrDragging)
		) {
			const boxId = Object.keys(editableBoxes)[0];
			const str = boxId;
			const regex = /^box-(\w+)-\d+$/;
			const match = str.match(regex);

			if (match) {
				const day = match[1]; // Extract the day from the first capturing group

				const inputValue = temperatureInputs[boxId];

				// Check if input is a number and within the range 5 to 30
				if (!isNaN(inputValue) && inputValue >= 5 && inputValue <= 30) {
					setLayouts((prevLayouts) => ({
						...prevLayouts,
						[day]: prevLayouts[day].map((box) =>
							box.i === boxId
								? { ...box, temperature: temperatureInputs[boxId] }
								: box,
						),
					}));
					setEditableBoxes({});
				} else {
					alert("Bitte eine Temperatur zwischen 10 und 30 °C eintragen.");
				}
			}
			return;
		} else if (isResizingOrDragging) {
			// Ignore the click if a resize or drag event is in progress
			return;
		} else if (event.target.closest(".box")) {
			// If the click happened inside a box, do nothing
			return;
		}

		const container = event.currentTarget;
		const rect = container.getBoundingClientRect();
		const xPosition = event.clientX - rect.left;
		const yPosition = (event.clientY - rect.top + container.scrollTop) / (rowHeight + 10);
		const rowIndex = Math.floor(yPosition);
		if (rowIndex >= 24 * 4) return; // Ignore clicks below the 24th row
		const dayIndex = Math.floor(xPosition / (rect.width / daysOfWeek.length));
		const day = daysOfWeek[dayIndex];
		const newBoxId = generateNewBoxId(day, layouts);
		let newBoxLayout;
		if (rowIndex <= 0) {
			return;
		}
		if (rowIndex > 92) {
			newBoxLayout = {
				i: newBoxId,
				x: 0,
				y: rowIndex - (4 - (96 - rowIndex)),
				w: 1,
				h: 4,
				minW: 1,
				maxW: 2,
				minH: 4,
				maxH: 24 * 4,
				temperature: null,
			};
		} else {
			newBoxLayout = {
				i: newBoxId,
				x: 0,
				y: rowIndex - 1,
				w: 1,
				h: 4,
				minW: 1,
				maxW: 2,
				minH: 4,
				maxH: 24 * 4,
				temperature: null,
			};
		}

		setLayouts((prevLayouts) => ({
			...prevLayouts,
			[day]: [...prevLayouts[day], newBoxLayout],
		}));

		// Focus the input after adding the box
		setTimeout(() => {
			if (inputRefs.current[newBoxId]) {
				inputRefs.current[newBoxId].focus();
			}
		}, 0);

		setEditableBoxes((prevEditable) => ({
			// ...prevEditable,
			[newBoxId]: true, // Enter editing mode on click
		}));

		setTemperatureInputs((prevInputs) => ({
			...prevInputs,
			[newBoxId]: "", // Initialize temperature input for the new box
		}));
	};

	const generateNewBoxId = (day, layouts) => {
		const dayLayouts = layouts[day];
		const ids = dayLayouts.map((box) => parseInt(box.i.split("-")[2], 10));
		const maxId = ids.length ? Math.max(...ids) : 0;
		return `box-${day}-${maxId + 1}`;
	};

	const handleTemperatureChange = (event, boxId) => {
		setTemperatureInputs((prevInputs) => ({
			...prevInputs,
			[boxId]: event.target.value,
		}));
	};

	const handleBoxClick = (e, boxId, temperature) => {
		if (isResizingOrDragging) {
		} else if (
			e.target.tagName.toLowerCase() !== "svg" &&
			e.target.tagName.toLowerCase() !== "path"
		) {
			// Focus the input after adding the box
			setTimeout(() => {
				if (inputRefs.current[boxId]) {
					inputRefs.current[boxId].focus();
				}
			}, 0);

			setEditableBoxes((prevEditable) => ({
				// ...prevEditable,
				[boxId]: true, // Enter editing mode on click
			}));
		}

		setTemperatureInputs((prevInputs) => ({
			...prevInputs,
			[boxId]: temperature, // Pre-fill the input with the current temperature
		}));
	};

	const handleTemperatureKeyPress = (event, boxId, day) => {
		if (event.key === "Enter") {
			event.preventDefault();

			const inputValue = temperatureInputs[boxId];
			// Check if input is a number and within the range 10 to 30
			if (!isNaN(inputValue) && inputValue >= 10 && inputValue <= 30) {
			} else {
				alert("Bitte eine Temperatur zwischen 10 und 30 °C eintragen.");
				return;
			}

			setLayouts((prevLayouts) => ({
				...prevLayouts,
				[day]: prevLayouts[day].map((box) =>
					box.i === boxId
						? { ...box, temperature: temperatureInputs[boxId] }
						: box,
				),
			}));
			setEditableBoxes({});
		}
	};

	// Set Box colour change depending on Temperature change here
	const handleHoverColour = (temp) => {
		if (temp === null) {
			return "#9EE9F8";
		}
		if (temp === false) {
			return "#FFFFFF";
		} else if (temp < 10) {
			return "#BCF0DA";
		} else if (temp >= 10 && temp < 20) {
			return "#9EE9F8";
		} else if (temp >= 20 && temp <= 25) {
			return "#FCD9BD";
		} else if (temp > 25) {
			return "#FBD5D5";
		} else {
			return "#9EE9F8";
		}
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

	const handleDeleteBox = (day, boxId) => {
		setLayouts((prevLayouts) => {
			const updatedLayouts = { ...prevLayouts };
			updatedLayouts[day] = updatedLayouts[day].filter(
				(box) => box.i !== boxId,
			);

			// Check if the deleted box is an empty box
			// if (boxId.includes("empty-")) {
			//   Object.keys(updatedLayouts).forEach((dayKey) => {
			//     updatedLayouts[dayKey] = updatedLayouts[dayKey].filter((box) => !box.i.includes("empty-"));
			//   });
			// }

			return updatedLayouts;
		});

		setTemperatureInputs((prevInputs) => {
			const updatedInputs = { ...prevInputs };
			delete updatedInputs[boxId]; // Remove temperature input state for the deleted box
			return updatedInputs;
		});

		setEditableBoxes({});
	};

	const handleCopyClick = (day) => {
		if (showDropdown) {
			setShowDropdown(null);
			setCopyTargetDays([]);
		} else {
			setShowDropdown(day);
		}
	};

	const handleCheckboxChange = (day) => {
		// Toggle selection of the day
		if (copyTargetDays.includes(day)) {
			setCopyTargetDays(copyTargetDays.filter((d) => d !== day));
		} else {
			setCopyTargetDays([...copyTargetDays, day]);
		}
	};

	// unique id for copy
	const generateCopyId = (oldId, newDay) => {
		const idParts = oldId.split("-");
		const newId = `box-${newDay}-${idParts[idParts.length - 1]}`;
		return newId;
	};

	const handleCopySubmit = (event) => {
		event.preventDefault();
		if (copyTargetDays.length > 0 && showDropdown) {
			setLayouts((prevLayouts) => {
				const newLayouts = { ...prevLayouts };
				copyTargetDays.forEach((targetDay) => {
					// Copy the boxes from the day specified in showDropdown
					const copiedBoxes = prevLayouts[showDropdown].map((box) => {
						const newBoxId = generateCopyId(box.i, targetDay); // Generate a unique ID for the copied box
	
						// Set the newly copied box as editable
						setEditableBoxes((prevEditable) => ({
							...prevEditable,
							[newBoxId]: true, // Enter editing mode on the newly copied box
						}));

						// Set temperature for copied boxes
						setTemperatureInputs((prevInputs) => ({
							...prevInputs,
							[newBoxId]: box.temperature, // Initialize temperature input for the new box
						}));
	
						// Return the new box with the generated ID
						return {
							...box,
							i: newBoxId,
						};
					});

					// Check if two boxes overlap
					const boxesOverlap = (box1, box2) => {
						return (
							box1.y < box2.y + box2.h && // box1 starts before box2 ends
							box1.y + box1.h > box2.y // box1 ends after box2 starts
						);
					};

					// Filter out overlapping boxes
					newLayouts[targetDay] = newLayouts[targetDay].filter(
						(targetBox) =>
							!copiedBoxes.some((copiedBox) =>
								boxesOverlap(targetBox, copiedBox),
							),
					);

					// Add the copied boxes to the target day
					newLayouts[targetDay] = [...newLayouts[targetDay], ...copiedBoxes];

				});
				return newLayouts;
			});
		}
		setShowDropdown(null);
		setCopyTargetDays([]);
	};

	const handleCheck = useCallback(() => {

		let newCheck = false;
		let invalidInput = false

		// Generate boxes for empty time slots
		Object.keys(layouts).forEach((day) => {
			const layout = layouts[day];
			// Check if there is any box that does not contain 'empty' in its 'i' property
			if (layout.some((box) => box.i.includes("empty"))) {
				newCheck = true;
			}
			const emptySlots = [];
			for (let y = 0; y < 24 * 4; y++) {
				// Loop through each y value up to 24
				const slot = layout.find((box) => box.y === y);
				if (slot) {
					y = y + slot.h - 1;
				}
				if (!slot) {
					setChecked(true);
					newCheck = true;
					const nextBox = layout.find((box) => box.y > y);
					const height = nextBox ? nextBox.y - y : 24 * 4 - y; // Calculate height up to next box or end of day
					emptySlots.push({
						i: `empty-${day}-${y}`,
						x: 0,
						y: y,
						w: 1,
						h: height, // Set height to calculated value
						minW: 1,
						maxW: 2,
						minH: 1,
						maxH: 24 * 4,
						temperature: false,
					});
					y = nextBox ? nextBox.y - 1 : 97;
				}
			}
			setLayouts((prevLayouts) => ({
				...prevLayouts,
				[day]: [...layout, ...emptySlots],
			}));
			onUpdateLayouts(layouts);
			onUpdateCheck(newCheck);
		});

		const currentEditableBoxes = editableBoxesRef.current;

		const currentTemperatureInputs = temperatureBoxesRef.current;

		let currentLayout = layouts

		if (Object.keys(currentEditableBoxes).length > 0) {

			// Loop through all keys in currentEditableBoxes
			Object.keys(currentEditableBoxes).forEach((boxId) => {
				const str = boxId;
				const regex = /^box-(\w+)-\d+$/;
				const match = str.match(regex);

				if (match) {
					const day = match[1]; // Extract the day from the first capturing group
					const inputValue = currentTemperatureInputs[boxId];


					// Check if input is a number and within the range 5 to 30
					if (!isNaN(inputValue) && inputValue >= 5 && inputValue <= 30) {
						currentLayout = {
							...currentLayout, // assuming `layouts` is the current state
							[day]: layouts[day].map((box) =>
								box.i === boxId
									? { ...box, temperature: currentTemperatureInputs[boxId] }
									: box,
							),
						};
						onUpdateLayouts(currentLayout);
					} else {
						invalidInput = true; // Set the flag if invalid input is found
						newCheck = true;
					}
				}
			});
		}

        Object.keys(currentLayout).forEach((day) => {
            currentLayout[day].forEach((box) => {
                const temperature = box.temperature;
                // Check if temperature is a number and within the range 5 to 30
                if ((!isNaN(temperature) && (temperature < 5 || temperature > 30))) {
                    invalidInput = true;
                }
            });
        });

		// If any invalid input is found, alert once
        if (invalidInput) {
            alert("Bitte eine Temperatur zwischen 10 und 30 °C eintragen.");
            newCheck = true;
			onUpdateCheck(newCheck);
        }

	}, [
		layouts,
		setLayouts,
		checked,
		setChecked,
		onUpdateLayouts,
		onUpdateCheck,
	]);

	// Set the handleCheck function in the ref passed from the parent
	useEffect(() => {
		setHandleCheckRef(handleCheck);
	}, [handleCheck, setHandleCheckRef]);

	const formatTime = (y) => {
		const hours = y;
		return `${hours.toString().padStart(2, "0")}:00`;
	};
	const timeLabels = Array.from({ length: 24 * 4 + 1 }, (_, index) => {
		const totalMinutes = (index % (24 * 4)) * 15; // Wrap around after 24 hours
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		const isFullHour = minutes === 0; // Check if it's a complete hour

		return (
			<div
				key={index}
				style={{
					height: `${rowHeight}px`,
					margin: "10px 0",
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "flex-start",
				}}
			>
				{isFullHour
					? `${hours.toString().padStart(2, "0")}:${minutes
							.toString()
							.padStart(2, "0")}`
					: ""}
			</div>
		);
	});

	const [batteryAlert, setbatteryAlert] = useState(false);

	useEffect(() => {
		let alertNeeded = false;
		Object.keys(layouts).forEach((day) => {
			const dataArray = layouts[day];
			if (dataArray.length > 3) {
				// console.warn(`Warning: ${day} has more than 2 items.`);
				alertNeeded = true;
			}
		});
		setbatteryAlert(alertNeeded);
	}, [layouts]);

	const [hoveredBoxes, setHoveredBoxes] = useState({});

	const handleMouseEnter = (boxId, day) => {
		const uniqueKey = `${day}-${boxId}`;
		setHoveredBoxes((prev) => ({ ...prev, [uniqueKey]: true }));
	};

	const handleMouseLeave = (boxId, day) => {
		const uniqueKey = `${day}-${boxId}`;
		setHoveredBoxes((prev) => ({ ...prev, [uniqueKey]: false }));
	};

	const [zoomGap, setZoomGap] = useState(1.75);

	useEffect(() => {
		if (zoomLevel) {
			if (zoomLevel === 1.100000023841858) {
				setZoomGap(1.76);
			} else if (zoomLevel === 1.2) {
				setZoomGap(1.78);
			} else if (zoomLevel === 1.25) {
				setZoomGap(1.775);
			} else if (zoomLevel === 1.5) {
				setZoomGap(1.75);
			} else if (zoomLevel === 1.75) {
				setZoomGap(1.77);
			} else {
				setZoomGap(1.75);
			}
		}
	}, [zoomLevel]);

	return (
		<div className="flex flex-col gap-4 w-full">
			<h3 className="text-[16px] text-gray-500 font-semibold flex items-center gap-2">
				<Tooltip
					className="min-w-[130px]"
					content="Go to Previous Step"
					style="light"
					animation="duration-500"
				>
					<IoArrowBackCircle
						onClick={() => handlePrev()}
						className=" text-2xl hover:text-primary cursor-pointer"
					/>
				</Tooltip>
				Heizplan
			</h3>
			{batteryAlert && (
				<div className="text-red-800 px-4 py-3 bg-[#FDF2F2] w-fit text-[16px] flex flex-col items-start gap-2">
					<div className=" w-fit font-semibold flex items-center gap-2">
						<FaCircleCheck />
						{errorMessages.batteryLifeAlert}
					</div>
					<div className=" text-sm">
						{errorMessages.batteryLifeAlertMessage}
					</div>
				</div>
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
							<div className="text-[#0BAAC9] bg-[#E7F9FD] w-full font-medium rounded-lg text-sm px-3 py-2 me-2 mb-2 border border-[#0BAAC9] flex items-center justify-between ">
								{day}
								<button
									className=" text-[#111928] hover:text-white"
									onClick={() => handleCopyClick(day)}
								>
									<svg
										className="w-4 h-4 text-gray-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="24"
										fill="none"
										viewBox="0 0 24 24"
									>
										<path
											stroke="currentColor"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M14 4v3a1 1 0 0 1-1 1h-3m4 10v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2m11-3v10a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V7.87a1 1 0 0 1 .24-.65l2.46-2.87a1 1 0 0 1 .76-.35H18a1 1 0 0 1 1 1Z"
										/>
									</svg>
								</button>
							</div>
							{showDropdown === day && (
								<form
									onSubmit={handleCopySubmit}
									className="absolute top-10 left-0 bg-white py-2 px-4 border border-gray-300 shadow rounded z-[100] text-sm text-gray-900"
								>
									<fieldset className=" flex flex-col justify-start items-start gap-3">
										<div className=" font-bold mb-1">Kopieren nach</div>
										{daysOfWeek
											// .filter(d => d !== day) // Filter out the current day
											.map((d) => (
												<label
													key={d}
													className={`${
														d === day ? "text-gray-400" : ""
													} text-xs`}
												>
													<input
														type="checkbox"
														disabled={d === day ? true : false}
														value={d}
														checked={copyTargetDays.includes(d)}
														onChange={() => handleCheckboxChange(d)}
														className={`rounded bg-gray-50 border-gray-300 mr-2 checked:bg-primary checked:ring-primary focus:ring-primary`}
													/>
													{d}
												</label>
											))}
									</fieldset>
									<button
										className=" mt-3 text-xs text-primary rounded-lg px-3 py-2 border border-primary hover:text-white hover:bg-primary transition duration-100"
										type="submit"
									>
										Bestätigen
									</button>
								</form>
							)}
						</div>
					))}
				</div>
				<div style={{ display: "flex", zIndex: "10" }}>
					<div style={{ width: "60px" }}>{timeLabels}</div>
					<div
						style={{
							display: "flex",
							justifyContent: "flex-start",
							gap: "12px",
							width: "100%",
							position: "relative",
							zIndex: "10",
						}}
						onClick={handleContainerClick}
						className="custom"
					>
						<div
							className="absolute top-[22px] left-0 bottom-0 right-0 w-full h-full flex flex-col z-10"
							style={{
								gap: `${zoomGap}rem`,
								// transform: `scale(${zoomLevel})`,
								transformOrigin: "top left",
							}}
						>
							{Array.from({ length: 24 * 4 + 1 }).map((_, index) => (
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
									className="layout pt-[18px] z-10"
									compactType={null}
									layout={layouts[day]}
									cols={1}
									rowHeight={rowHeight}
									width={150}
									resizeHandles={["s", "n"]}
									isDraggable={false}
									isDroppable={false}
									allowOverlap={true}
									// draggableHandle=".box-drag"
									draggableCancel=".box-resize-handle"
									onResizeStart={(layout, oldLayout, newLayout) => {
										setResizingBox(newLayout.i);
										setIsResizingOrDragging(true);
									}}
									onResizeStop={(layout, oldItem, newItem) => {
										if (newItem.y + newItem.h > 96) {
											newItem.h = 96 - newItem.y; // Adjust height to not exceed 24 units
										}
										setResizingBox(null);
										const adjustedLayout = adjustLayoutForOverlap(
											layout,
											oldItem,
											newItem,
										);
										setLayouts((prevLayouts) => {
											const layout = prevLayouts[day];
											adjustedLayout.forEach((newBox) => {
												const existingBox = layout.find(
													(box) => box.i === newBox.i,
												);
												if (existingBox) {
													newBox.temperature = existingBox.temperature; // Preserve temperature value
												}
											});
											return { ...prevLayouts, [day]: adjustedLayout };
										});
										setTimeout(() => {
											setIsResizingOrDragging(false);
										}, 500);
									}}
								>
									{layouts[day].map((box) => (
										<div
											key={box.i}
											data-grid={{
												...box,
												resizeHandles: box.i.startsWith("empty-")
													? []
													: ["s", "n"],
											}}
											className={`box relative w-full !important rounded-md z-10 ${
												box.temperature === false ? "border border-red-500" : ""
											}`}
											style={{
												// backgroundColor: hoveredBoxes[box.i] ? handleHoverColour(box.temperature) : handleTempColour(box.temperature),
												color: handleTextColour(box.temperature),
												background:
													box.temperature === false
														? "linear-gradient(135deg, rgba(255, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 0, 0, 0.1) 50%, rgba(255, 0, 0, 0.1) 75%, transparent 75%, transparent)"
														: hoveredBoxes[`${day}-${box.i}`] === true
															? handleHoverColour(box.temperature)
															: handleTempColour(box.temperature),
												backgroundSize:
													box.temperature === false ? "10px 10px" : "",
												zIndex: box === resizingBox ? 100 : 0,
											}}
											onMouseEnter={() => handleMouseEnter(box.i, day)}
											onMouseLeave={() => handleMouseLeave(box.i, day)}
											onClick={(e) => handleBoxClick(e, box.i, box.temperature)}
										>
											<div
												style={{
													marginTop: "10px",
													padding: "0px 10px",
													position: "relative",
													zIndex: "1",
													fontSize: "14px",
												}}
											>
												{box.temperature !== false ? (
													!editableBoxes[box.i] && box.temperature !== null ? (
														`${box.temperature}°C`
													) : (
														<input
															type="text"
															ref={(el) => (inputRefs.current[box.i] = el)}
															value={temperatureInputs[box.i] || ""}
															onChange={(e) =>
																handleTemperatureChange(e, box.i)
															}
															onKeyDown={(e) =>
																handleTemperatureKeyPress(e, box.i, day)
															}
															placeholder="Insert temp"
															onClick={(e) => e.stopPropagation()} // Prevent click event on input from bubbling up
															style={{
																width: "100%",
																padding: "4px",
																fontSize: "10px",
																border: "none",
																background: "transparent",
																outline: "none", // This removes the default focus ring
															}}
															onFocus={(e) =>
																(e.target.style.boxShadow = "none")
															}
															onBlur={(e) => (e.target.style.boxShadow = "")}
														/>
													)
												) : (
													// If box.temperature is not null, render nothing
													<div>Soll-Temperatur angeben</div>
												)}

												<button
													style={{
														position: "absolute",
														top: "10px",
														right: "10px",
														cursor: "pointer",
														fontSize: "14px", // Adjusted font size for better visibility
														lineHeight: "14px", // Adjusted line height to center the 'x' better
													}}
													className=" text-gray-900"
													onClick={() => handleDeleteBox(day, box.i)}
												>
													<IoMdClose />
												</button>
											</div>
											{/* <div
                          className="box-drag"
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            height: '20px',
                            cursor: 'ns-resize',
                            backgroundColor: '#ccc',
                            zIndex:'0'
                            // backgroundImage: `url(${sep})`,
                            // backgroundPosition: 'center bottom',
                            // backgroundRepeat: 'no-repeat',
                            // backgroundSize: 'contain'
                          }}
                        /> */}
										</div>
									))}
								</GridLayout>
							</div>
						))}
					</div>
				</div>
				{/* <button onClick={handleCheck}>Check</button> */}
			</div>
		</div>
	);
}

export default HeatingSchedule;
