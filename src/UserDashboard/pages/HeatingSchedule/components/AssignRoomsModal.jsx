/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Checkbox,
	Table,
	Accordion,
	Select,
	Button,
	Tooltip,
	Modal,
} from "flowbite-react";
import { customTableTheme } from "../CreateHeating/Steps/ProgramAssignment/AssignmentAccordionTheme";
import { FaCheck, FaCircleCheck } from "react-icons/fa6";
import { errorMessages } from "../../../../globals/errorMessages";
import _ from "lodash";
import { IoArrowBackCircle } from "react-icons/io5";
import customTheme from "../CreateHeating/ModalTheme";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { Toast } from "flowbite-react";

function AssignRoomsModal({
	openAssignModal,
	handleAssign,
	onUpdate,
	program,
	initialData,
}) {
	//Set token for bearer authorization
	const [showToast, setShowToast] = useState(false);
	const [isSuccess, setIsSuccess] = useState(true);
	const [toastMessage, setToastMessage] = useState("");
	const token = localStorage.getItem("token");
	const [data, setData] = useState(initialData);
	const fetchAllLocations = () => {
		axios
			.get(ApiUrls.SMARTHEATING_LOCATIONS.LOCATIONS(true, true, true, true))
			.then((response) => response.data)
			.then((data) => {
				const apiData = {
					buildings: data.map((building) => {
						// Calculate the total rooms in the building
						const totalRooms = building.children.reduce(
							(sum, floor) => sum + floor.children.length,
							0,
						);

						return {
							id: building.id,
							name: building.name,
							roomsAssigned: building.assignedNumberOfRooms,
							totalRooms: totalRooms,
							floors: building.children.map((floor) => ({
								id: floor.id,
								name: floor.name,
								roomsAssigned: floor.assignedNumberOfRooms,
								totalRooms: floor.children.length,
								rooms: floor.children.map((room) => ({
									id: room.id,
									name: room.name,
									type: room.type,
									algorithmOn: false,
									programAssigned: room.heatingSchedule
										? room.heatingSchedule.templateName
										: null,
									currentTemperature: room.roomTemperature,
									assigned:
										room.assignedNumberOfRooms !== 0 &&
										room.heatingSchedule.id === program.id,
								})),
							})),
						};
					}),
				};

				setData(apiData);
			})
			.catch((error) => console.error("Error:", error));
	};
	useEffect(() => {
		fetchAllLocations();
	}, [openAssignModal, initialData]);
	const [heatingData, setheatingData] = useState({});

	// useEffect(() => {
	// 	setData(initialData);
	// }, [openAssignModal, initialData]);
	const [filter, setFilter] = useState("All");
	const handleCloseModal = () => {
		// Reset all the state variables to their initial values
		setheatingData({});
		setData(initialData);
		setFilter("All");
		setFormData({
			programName: "",
			childSafety: "",
			minTemp: "",
			maxTemp: "",
			applyAlgorithm: "",
		});
		setviewSelected(false);
		setViewAll(false);
		setError(null);
		setNoRoomsError(false);

		// Call handleAssign to close the modal
		handleAssign();
	};

	const [formData, setFormData] = useState({
		programName: "",
		childSafety: "",
		minTemp: "",
		maxTemp: "",
		applyAlgorithm: "",
	});

	const assignmentData = (assignmentData) => {
		setheatingData(assignmentData);
	};

	// Function to create a mapping of room IDs to their default values
	const createDefaultValuesMap = () => {
		const defaultValuesMap = {};
		const newInitialData = _.cloneDeep(data);
		newInitialData?.buildings?.forEach((building) => {
			building.floors.forEach((floor) => {
				floor.rooms.forEach((room) => {
					defaultValuesMap[room.id] = {
						programAssigned: room.programAssigned,
						algorithmOn: room.algorithmOn,
						assigned: room.assigned,
					};
				});
			});
		});
		return defaultValuesMap;
	};

	const [defaultValuesMap] = useState(createDefaultValuesMap());

	const handleRoomAssignment = (buildingId, floorId, roomId) => {
		const newData = _.cloneDeep(data);
		const building = newData.buildings.find((b) => b.id === buildingId);
		const floor = building.floors.find((f) => f.id === floorId);
		const room = floor.rooms.find((r) => r.id === roomId);

		if (room.assigned) {
			// Reset the room to its default state using the default values map
			const defaultValues = defaultValuesMap[roomId];
			room.programAssigned =
				defaultValues.programAssigned === program.templateName
					? ""
					: defaultValues.programAssigned;
			room.algorithmOn = defaultValues.algorithmOn;
			room.assigned = false;
			const sameFloor = floor.roomsAssigned;
			const sameBuild = building.roomsAssigned;

			if (defaultValues.programAssigned) {
				if (defaultValues.programAssigned === program.templateName) {
					floor.roomsAssigned = sameFloor - 1;
					building.roomsAssigned = sameBuild - 1;
				} else {
					floor.roomsAssigned = sameFloor;
					building.roomsAssigned = sameBuild;
				}
			} else {
				// Update room and floor assignments count
				floor.roomsAssigned -= 1;
				building.roomsAssigned -= 1;
			}
		} else if (!room.assigned && room.programAssigned !== null) {
			const defaultValues = defaultValuesMap[roomId];
			// Assign the room
			room.programAssigned = program.templateName;
			room.algorithmOn = formData.applyAlgorithm;
			room.assigned = true;
			const sameFloor = floor.roomsAssigned;
			const sameBuild = building.roomsAssigned;

			if (room.programAssigned === defaultValues.programAssigned) {
				// Update room and floor assignments count
				floor.roomsAssigned = sameFloor + 1;
				building.roomsAssigned = sameBuild + 1;
			} else {
				// Update room and floor assignments count
				floor.roomsAssigned = sameFloor;
				building.roomsAssigned = sameBuild;
			}
		} else {
			// Assign the room
			room.programAssigned = program.templateName;
			room.algorithmOn = formData.applyAlgorithm;
			room.assigned = true;

			// Update room and floor assignments count
			floor.roomsAssigned += 1;
			building.roomsAssigned += 1;
		}

		setData(newData);
	};

	const handleSelectAllRooms = (buildingId, floorId, isSelected) => {
		const newData = _.cloneDeep(data);
		const building = newData.buildings.find((b) => b.id === buildingId);
		const floor = building.floors.find((f) => f.id === floorId);
		let newVar = 0;

		floor.rooms.forEach((room) => {
			room.assigned = isSelected;
			if (isSelected) {
				room.programAssigned = program.templateName;
				room.algorithmOn = formData.applyAlgorithm;
				room.assigned = true;
			} else {
				const defaultValues = defaultValuesMap[room.id];
				room.programAssigned = defaultValues.programAssigned;
				room.algorithmOn = defaultValues.algorithmOn;
				room.assigned = defaultValues.assigned;
			}
		});

		// Update rooms assigned count
		const previouslyAssigned = floor.roomsAssigned;
		const newlyAssigned = isSelected ? floor.totalRooms : 0;
		const difference = newlyAssigned - previouslyAssigned;
		floor.roomsAssigned = newlyAssigned;
		building.roomsAssigned += difference;

		// floor.roomsAssigned = isSelected ? floor.totalRooms : floor.rooms.filter(room => room.assigned).length;
		// building.roomsAssigned = newData.buildings.reduce((acc, b) => acc + b.floors.reduce((acc, f) => acc + f.roomsAssigned, 0), 0);

		setData(newData);
	};

	const isAllRoomsSelected = (floor) => {
		return floor.rooms.every((room) => room.assigned);
	};

	const filterRooms = (rooms) => {
		switch (filter) {
			case "Assigned":
				return rooms.filter(
					(room) => room.assigned || room.programAssigned !== null,
				);
			case "Selected":
				return rooms.filter((room) => room.assigned);
			case "Unassigned":
				return rooms.filter(
					(room) => !room.assigned && room.programAssigned === null,
				);
			default:
				return rooms;
		}
	};

	useEffect(() => {
		assignmentData(data);
	}, [data]);

	const [viewSelected, setviewSelected] = useState(false);
	const [viewAll, setViewAll] = useState(false);

	const handleViewSelected = () => {
		setFilter("Selected");
		setviewSelected(true);
		setViewAll(true);
	};
	function getRoomIdsByProgram(data) {
		const programName = program.templateName;
		const roomIds = [];

		// Loop through each building
		data.forEach((building) => {
			// Loop through each floor in the building
			building.floors.forEach((floor) => {
				// Loop through each room on the floor
				floor.rooms.forEach((room) => {
					// Check if the programAssigned matches the programName
					if (room.programAssigned === programName) {
						roomIds.push(room.id);
					}
				});
			});
		});

		return roomIds;
	}
	const handleViewAll = () => {
		setFilter("All");
		setViewAll(false);
		// setviewSelected(false)
	};

	const [error, setError] = useState();
	const [noRoomsError, setNoRoomsError] = useState(false);
	const programAssignmentRef = useRef();

	const [ButtonText, setButtonText] = useState("Fertig");
	// useCallback to memoize handleSubmit function
	const handleSubmit = useCallback(() => {
		const anyRoomSelected = data.buildings.some((building) =>
			building.floors.some((floor) =>
				floor.rooms.some((room) => room.assigned),
			),
		);

		// if (!anyRoomSelected && ButtonText !== "Confirm") {
		// 	setNoRoomsError(true);
		// 	setError(errorMessages.roomSelectionMust);
		// 	setButtonText("Confirm");
		// } else {
		setError("");

		// onUpdate(data)

		// API call
		const locationstosend = anyRoomSelected
			? getRoomIdsByProgram(data.buildings)
			: [];

		axios
			.post(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.ASSIGN_ROOM(program.id), {
				locations: locationstosend,
			})
			.then((response) => {
				const { data, status } = response;
				setShowToast(true);
				setToastMessage(errorMessages.roomAssignFailed);
				setIsSuccess(false);
				onUpdate(data);

				handleAssign();
				setTimeout(() => {
					setShowToast(false);
				}, 3000);
			})
			.catch((error) => {
				setShowToast(true);
				console.error("Error:", error);
				onUpdate("Error");
				setToastMessage(errorMessages.roomAssignFailed);
				setIsSuccess(false);
				setTimeout(() => {
					setShowToast(false);
				}, 3000);
			});
		// }
	}, [data, setNoRoomsError, setError, ButtonText]); // Dependency array

	useEffect(() => {
		const anyRoomSelected = data.buildings.some((building) =>
			building.floors.some((floor) =>
				floor.rooms.some((room) => room.assigned),
			),
		);
		if (!anyRoomSelected) {
			setNoRoomsError(true);
		} else {
			setNoRoomsError(false);
		}
	}),
		[data];

	const resetAssignments = () => {
		setData(_.cloneDeep(initialData));
	};

	return (
		<>
			<Modal
				theme={customTheme}
				size={"7xl"}
				dismissible
				show={openAssignModal}
				onClose={handleAssign}
			>
				<Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
					Räume zuweisen - {program?.templateName}
				</Modal.Header>
				<Modal.Body className="p-5 overflow-hidden  h-auto">
					<div className="flex flex-col gap-4 w-full">
						<div className="flex flex-col gap-0 w-full">
							<h3 className="text-[16px] text-gray-500 font-semibold flex items-center gap-2">
								Wählen Sie unten die Räume aus, denen Sie den Heizplan zuweisen möchten.
							</h3>
							<div className="w-full flex justify-end">
								{!viewAll ? (
									<Button
										onClick={handleViewSelected}
										className=" hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
									>
										Auswahl anzeigen
									</Button>
								) : (
									<Button
										onClick={handleViewAll}
										className=" hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
									>
										Alle anzeigen
									</Button>
								)}
							</div>
							{noRoomsError && error && (
								<div className="text-red-800 px-4 py-3 bg-[#FDF2F2] w-fit text-[16px] font-semibold flex items-center gap-2">
									<FaCircleCheck />
									{error}
								</div>
							)}
						</div>
						<div className=" flex items-center justify-between w-full">
							<div className=" flex items-center gap-1.5">
								<p className=" text-sm font-semibold text-black">
									Filtern nach:
								</p>
								<Select
									id="roomFilter"
									required
									value={filter}
									onChange={(e) => setFilter(e.target.value)}
								>
									<option value="All">Alle</option>
									<option value="Assigned">Zugewiesen</option>
									<option value="Unassigned">Nicht zugewiesen</option>
								</Select>
							</div>
							<form
								onSubmit={(e) => {
									e.preventDefault();
								}}
								className="w-[380px] "
							>
								<label
									htmlFor="default-search"
									className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
								>
									Suche
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
										<svg
											className="w-4 h-4 text-gray-500 dark:text-gray-400"
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 20 20"
										>
											<path
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
											/>
										</svg>
									</div>
									<input
										type="search"
										id="default-search"
										className="block w-full p-4 px-4 ps-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
										placeholder="Suche"
										required
									/>
									{/* <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button> */}
								</div>
							</form>
						</div>
						<div className=" flex items-center justify-between gap-2">
							<p className=" text-sm text-gray-500">
								
							</p>
							<Button
								onClick={resetAssignments}
								className=" hover:!bg-transparent hover:opacity-80 border-none text-red-600 bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
							>
								Auswahl zurücksetzen
							</Button>
						</div>
						<div className=" flex flex-col gap-0 max-h-[400px] overflow-y-auto">
							{!viewSelected
								? data.buildings.map((building) => (
										<Accordion
											className=" border-none"
											key={building.id}
											collapseAll
										>
											<Accordion.Panel className="">
												<Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
													<p className="text-sm text-gray-900 font-bold">
														{building.name}
														<span
															className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${building.roomsAssigned === building.totalRooms ? "text-primary" : "text-indigo-800"} ${building.roomsAssigned === building.totalRooms ? "bg-primary-200" : "bg-indigo-100"} rounded-md`}
														>
															{building.roomsAssigned}/{building.totalRooms}{" "}
															Räume zugewiesen
														</span>
													</p>
												</Accordion.Title>
												<Accordion.Content className=" border !border-b rounded-lg px-4 py-2">
													{building.floors.map((floor) => (
														<Accordion
															className=" border-none"
															key={floor.id}
															collapseAll={true}
														>
															<Accordion.Panel>
																<Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
																	<p className="text-sm text-gray-900 font-bold">
																		{floor.name}
																		<span
																			className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${floor.roomsAssigned === floor.totalRooms ? "text-primary" : "text-indigo-800"} ${floor.roomsAssigned === floor.totalRooms ? "bg-primary-200" : "bg-indigo-100"} rounded-md`}
																		>
																			{floor.roomsAssigned}/{floor.totalRooms}{" "}
																			Räume zugewiesen
																		</span>
																	</p>
																</Accordion.Title>
																<Accordion.Content className=" border rounded-lg px-4 py-2">
																	{filterRooms(floor.rooms).length === 0 ? (
																		<p className="text-gray-500">
																			{filter === "Selected" ||
																			filter === "Assigned"
																				? "No selected room on this floor"
																				: "All rooms selected on this floor"}
																		</p>
																	) : (
																		<Table theme={customTableTheme} hoverable>
																			<Table.Head className="text-gray-500 [&>tr>th]:font-semibold ">
																				<Table.HeadCell className="pl-4 ">
																					<Checkbox
																						checked={isAllRoomsSelected(floor)}
																						onChange={(e) =>
																							handleSelectAllRooms(
																								building.id,
																								floor.id,
																								e.target.checked,
																							)
																						}
																					/>
																				</Table.HeadCell>
																				<Table.HeadCell>Räume</Table.HeadCell>
																				{/* <Table.HeadCell>
																					Algorithmus
																				</Table.HeadCell> */}
																				<Table.HeadCell>
																					Aktiver Heizplan
																				</Table.HeadCell>
																				<Table.HeadCell>
																					Raumtemperatur
																				</Table.HeadCell>
																				{/* <Table.HeadCell>Assignment</Table.HeadCell> */}
																			</Table.Head>
																			<Table.Body className="">
																				{filterRooms(floor.rooms).map(
																					(room) => (
																						<Table.Row
																							key={room.id}
																							className={`border-t border-gray-300 ${room.assigned ? "bg-primary-200" : "bg-white"}`}
																						>
																							<Table.Cell className="pl-4">
																								<Checkbox
																									checked={room.assigned}
																									onChange={() =>
																										handleRoomAssignment(
																											building.id,
																											floor.id,
																											room.id,
																										)
																									}
																								/>
																							</Table.Cell>
																							<Table.Cell className="whitespace-nowrap font-bold text-gray-900 dark:text-white">
																								{room.name}{" "}
																								<span className=" text-xs font-normal py-0.5 px-2.5 bg-gray-100 rounded-3xl">
																									{room.type}
																								</span>
																							</Table.Cell>
																							{/* <Table.Cell className=" text-green-700 text-xl">
																								{room.algorithmOn ? (
																									<FaCheck />
																								) : (
																									""
																								)}
																							</Table.Cell> */}
																							<Table.Cell>
																								{room.programAssigned ? (
																									<span className=" text-primary">
																										{room.programAssigned}
																									</span>
																								) : (
																									"-"
																								)}
																							</Table.Cell>
																							<Table.Cell className="text-gray-900">
																								{room.currentTemperature.toFixed(1)}°C
																							</Table.Cell>
																						</Table.Row>
																					),
																				)}
																			</Table.Body>
																		</Table>
																	)}
																</Accordion.Content>
															</Accordion.Panel>
														</Accordion>
													))}
												</Accordion.Content>
											</Accordion.Panel>
										</Accordion>
									))
								: data.buildings.map((building) => (
										<div key={building.id}>
											<Accordion
												className=" border-none"
												key={building.id}
												collapseAll={false}
											>
												<Accordion.Panel className="">
													<Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
														<p className="text-sm text-gray-900 font-bold">
															{building.name}
															<span
																className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${building.roomsAssigned === building.totalRooms ? "text-primary" : "text-indigo-800"} ${building.roomsAssigned === building.totalRooms ? "bg-primary-200" : "bg-indigo-100"} rounded-md`}
															>
																{building.roomsAssigned}/{building.totalRooms}{" "}
																Räume zugewiesen
															</span>
														</p>
													</Accordion.Title>
													<Accordion.Content className=" border !border-b rounded-lg px-4 py-2">
														{building.floors.map((floor) => (
															<Accordion
																className=" border-none"
																key={floor.id}
																collapseAll={!floor.roomsAssigned}
															>
																<Accordion.Panel>
																	<Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
																		<p className="text-sm text-gray-900 font-bold">
																			{floor.name}
																			<span
																				className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${floor.roomsAssigned === floor.totalRooms ? "text-primary" : "text-indigo-800"} ${floor.roomsAssigned === floor.totalRooms ? "bg-primary-200" : "bg-indigo-100"} rounded-md`}
																			>
																				{floor.roomsAssigned}/{floor.totalRooms}{" "}
																				Räume zugewiesen
																			</span>
																		</p>
																	</Accordion.Title>
																	<Accordion.Content className=" border rounded-lg px-4 py-2">
																		{filterRooms(floor.rooms).length === 0 ? (
																			<p className="text-gray-500">
																				{filter === "Selected" ||
																				filter === "Assigned"
																					? "No selected room on this floor"
																					: "All rooms selected on this floor"}
																			</p>
																		) : (
																			<Table theme={customTableTheme} hoverable>
																				<Table.Head className="text-gray-500 [&>tr>th]:font-semibold ">
																					<Table.HeadCell className="pl-4">
																						<Checkbox
																							checked={isAllRoomsSelected(
																								floor,
																							)}
																							onChange={(e) =>
																								handleSelectAllRooms(
																									building.id,
																									floor.id,
																									e.target.checked,
																								)
																							}
																						/>
																					</Table.HeadCell>
																					<Table.HeadCell>Räume</Table.HeadCell>
																					{/* <Table.HeadCell>
																						Algorithmus
																					</Table.HeadCell> */}
																					<Table.HeadCell>
																						Aktiver Heizplan
																					</Table.HeadCell>
																					<Table.HeadCell>
																						Raumtemperatur
																					</Table.HeadCell>
																					{/* <Table.HeadCell>Assignment</Table.HeadCell> */}
																				</Table.Head>
																				<Table.Body className="">
																					{filterRooms(floor.rooms).map(
																						(room) => (
																							<Table.Row
																								key={room.id}
																								className={`border-t border-gray-300 ${room.assigned ? "bg-primary-200" : "bg-white"}`}
																							>
																								<Table.Cell className="pl-4">
																									<Checkbox
																										checked={room.assigned}
																										onChange={() =>
																											handleRoomAssignment(
																												building.id,
																												floor.id,
																												room.id,
																											)
																										}
																									/>
																								</Table.Cell>
																								<Table.Cell className="whitespace-nowrap font-bold text-gray-900 dark:text-white">
																									{room.name}{" "}
																									<span className=" text-xs font-normal py-0.5 px-2.5 bg-gray-100 rounded-3xl">
																										{room.type}
																									</span>
																								</Table.Cell>
																								{/* <Table.Cell className=" text-green-700 text-xl">
																									{room.algorithmOn ? (
																										<FaCheck />
																									) : (
																										""
																									)}
																								</Table.Cell> */}
																								<Table.Cell>
																									{room.programAssigned ? (
																										<span className=" text-primary">
																											{room.programAssigned}
																										</span>
																									) : (
																										"-"
																									)}
																								</Table.Cell>
																								<Table.Cell className="text-gray-900">
																									{room.currentTemperature.toFixed(1)}°C
																								</Table.Cell>
																							</Table.Row>
																						),
																					)}
																				</Table.Body>
																			</Table>
																		)}
																	</Accordion.Content>
																</Accordion.Panel>
															</Accordion>
														))}
													</Accordion.Content>
												</Accordion.Panel>
											</Accordion>
										</div>
									))}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button
						onClick={handleSubmit}
						className={ButtonText === "Fertig" ? `bg-primary` : `bg-green-500`}
					>
						{ButtonText}
					</Button>

					<Button
						className="font-black"
						color="gray"
						onClick={handleCloseModal}
					>
						Schließen
					</Button>
				</Modal.Footer>
				{showToast && (
					<div
						className="fixed top-4 right-4 z-50 transition-transform duration-1000 ease-in-out transform translate-x-0"
						style={{ transition: "transform 0.3s ease-in-out" }}
					>
						<Toast className="animate-slideIn">
							{isSuccess ? (
								<div className="text-cyan-600 dark:text-cyan-600 mr-2.5">
									{/* Success SVG */}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="27"
										height="27"
										viewBox="0 0 27 27"
										fill="none"
									>
										<path
											d="M19.1213 16.4205L19.8535 14.7761C20.454 13.4263 20.5249 11.8905 20.0539 10.4294C19.583 8.96834 18.5993 7.67189 17.2698 6.76004L17.8636 5.42623C17.9715 5.18394 17.9696 4.90465 17.8583 4.64982C17.747 4.39498 17.5355 4.18547 17.2702 4.06737C17.005 3.94927 16.7077 3.93225 16.4439 4.02007C16.18 4.10789 15.9712 4.29334 15.8633 4.53563L15.2695 5.86944C13.7022 5.49155 12.0805 5.62803 10.6796 6.25572C9.27869 6.88341 8.1848 7.96366 7.58354 9.31317L6.93844 10.7621C6.90978 10.8266 6.88885 10.8944 6.87602 10.9642L6.85302 10.9539C6.50116 11.7045 5.8405 12.2751 5.01303 12.543C4.26214 12.7847 3.64872 13.2814 3.28693 13.9408C3.06607 14.4369 2.39494 15.9442 3.93318 16.6291L6.14153 17.6123C6.06521 18.5639 6.31396 19.5341 6.85197 20.3834C7.38998 21.2326 8.18951 21.9171 9.13549 22.3383C10.0815 22.7595 11.1251 22.8956 12.1162 22.7272C13.1073 22.5588 13.9948 22.0944 14.6509 21.401L16.8592 22.3842C18.3975 23.069 19.0686 21.5617 19.2895 21.0656C19.537 20.3557 19.4956 19.5678 19.1729 18.8484C18.8187 18.0552 18.8002 17.1836 19.1213 16.4205ZM9.94879 20.5116C9.54212 20.33 9.18255 20.0597 8.90179 19.7247C8.62103 19.3897 8.42771 19.0003 8.33888 18.5907L12.4535 20.4226C12.0897 20.6307 11.6709 20.7476 11.2341 20.7632C10.7973 20.7787 10.3559 20.6923 9.94879 20.5116ZM17.2107 20.3513L5.20875 15.0077C5.236 14.9465 5.26406 14.8835 5.28725 14.8314C5.50216 14.6348 5.76072 14.4847 6.04693 14.3902C7.31392 13.9285 8.31686 13.0215 8.85571 11.85L9.58785 10.2055C10.0409 9.18291 10.9061 8.38969 12.0052 7.98941C13.1043 7.58913 14.3535 7.61231 15.4952 8.05417C16.5886 8.60635 17.4428 9.51919 17.8816 10.6043C18.3204 11.6894 18.3102 12.8639 17.8532 13.8855L17.2081 15.3344C17.1796 15.399 17.1584 15.4665 17.1447 15.5361L17.1227 15.5263C16.6126 16.7106 16.6097 18.0629 17.1143 19.3134C17.2356 19.5892 17.2971 19.8819 17.2948 20.1731C17.266 20.2271 17.2379 20.2901 17.2107 20.3513Z"
											fill="#0CB4D5"
										/>
										<path
											d="M6.58338 8.86787C7.3498 7.16476 8.79039 5.83957 10.6184 5.15605C10.878 5.0581 11.0786 4.86424 11.176 4.61714C11.2735 4.37003 11.2598 4.08992 11.138 3.83842C11.0162 3.58692 10.7963 3.38463 10.5266 3.27606C10.2569 3.16749 9.95956 3.16152 9.69997 3.25948C7.37973 4.12878 5.55262 5.81337 4.58306 7.97727C4.47518 8.21956 4.4771 8.49884 4.58839 8.75368C4.69967 9.00852 4.91121 9.21803 5.17647 9.33613C5.44173 9.45423 5.73898 9.47125 6.00282 9.38343C6.26667 9.29561 6.4755 9.11016 6.58338 8.86787Z"
											fill="#0CB4D5"
										/>
										<path
											d="M22.9361 9.15257C22.8861 9.0246 22.8105 8.90546 22.7135 8.80197C22.6164 8.69847 22.5 8.61264 22.3707 8.54938C22.2414 8.48612 22.1018 8.44667 21.9599 8.43327C21.818 8.41988 21.6765 8.4328 21.5436 8.47131C21.4107 8.50982 21.289 8.57316 21.1853 8.65772C21.0817 8.74227 20.9981 8.84638 20.9395 8.9641C20.8808 9.08182 20.8482 9.21085 20.8435 9.34382C20.8388 9.47679 20.8621 9.6111 20.9121 9.73907C21.628 11.5566 21.6064 13.5158 20.8516 15.226C20.7437 15.4683 20.7457 15.7476 20.857 16.0025C20.9683 16.2573 21.1798 16.4668 21.445 16.5849C21.7103 16.7029 22.0076 16.7199 22.2714 16.6321C22.5353 16.5443 22.7441 16.3588 22.852 16.1165C23.9747 13.4288 23.9986 10.3526 22.9361 9.15257Z"
											fill="#0CB4D5"
										/>
									</svg>
								</div>
							) : (
								<div className="text-red-600 dark:text-red-500 mr-2.5">
									{/* Error SVG */}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="27"
										height="27"
										viewBox="0 0 27 27"
										fill="none"
									>
										<path
											d="M13.5 27C20.9558 27 27 20.9558 27 13.5C27 6.04416 20.9558 0 13.5 0C6.04416 0 0 6.04416 0 13.5C0 20.9558 6.04416 27 13.5 27ZM13.5 2.025C19.5456 2.025 24.975 7.45438 24.975 13.5C24.975 19.5456 19.5456 24.975 13.5 24.975C7.45438 24.975 2.025 19.5456 2.025 13.5C2.025 7.45438 7.45438 2.025 13.5 2.025ZM12.1992 13.5V8.74359C12.1992 8.05984 12.759 7.5 13.5 7.5C14.241 7.5 14.8008 8.05984 14.8008 8.74359V13.5C14.8008 14.1832 14.241 14.7436 13.5 14.7436C12.759 14.7436 12.1992 14.1832 12.1992 13.5ZM13.5 19.2266C12.7106 19.2266 12.0742 18.5903 12.0742 17.8008C12.0742 17.0114 12.7106 16.375 13.5 16.375C14.2894 16.375 14.9258 17.0114 14.9258 17.8008C14.9258 18.5903 14.2894 19.2266 13.5 19.2266Z"
											fill="#F35151"
										/>
									</svg>
								</div>
							)}
							<div className="pl-4 text-sm font-normal border-l">
								{toastMessage}
							</div>
						</Toast>
					</div>
				)}
			</Modal>
		</>
	);
}

export default AssignRoomsModal;
