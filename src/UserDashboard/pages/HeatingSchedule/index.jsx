/* eslint-disable no-unused-vars */
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { CreateHeatingModal } from "./CreateHeating/CreateHeatingModal";
import HeatingProgramEntity from "./components/HeatingProgramEntity";
import { Spinner } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../../globals/apiURL.js";

function HeatingSchedulePage() {
	// Adding use state React Hooks here
	const [programList, setProgramList] = useState([]);
	const [filteredPrograms, setFilteredPrograms] = useState([]);
	const [isFiltered, setIsFiltered] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("Neueste zuerst");
	const [isDropdownOpen, setDropdownOpen] = useState(false); // Define state to manage dropdown visibility
	const [openModal, setOpenModal] = useState(false);

	const handleOpenModal = () => {
		setOpenModal(!openModal);
	};

	const handleDropdownToggle = () => setDropdownOpen(!isDropdownOpen);

	const handleFilterChange = (filter) => {
		setIsFiltered(true);
		setSelectedFilter(filter);
		setDropdownOpen(false);

		let filtered;

		const parseDate = (dateString) => new Date(dateString);

		switch (filter) {
			case "Älteste zuerst":
				filtered = [...filteredPrograms].sort(
					(a, b) => parseDate(a.updatedAt) - parseDate(b.updatedAt),
				);
				break;
			case "Neueste zuerst":
				filtered = [...filteredPrograms].sort(
					(a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt),
				);
				break;
			default:
				filtered = programList;
		}

		setFilteredPrograms(filtered);
	};

	const [response, setResponse] = useState(false);
	const [response2, setResponse2] = useState(false);
	const [key, setKey] = useState(0);

	const handleCreateHeatingProgram = (combinedData) => {
		setResponse(!response);
		fetchAllHeatingSchedules();
		setKey((prevKey) => prevKey + 1);
	};

	const handleRoomUpdate = (data) => {
		setResponse(!response);
		setResponse2(!response2);
		fetchAllHeatingSchedules();
		setKey((prevKey) => prevKey + 1);
	};

	const handleCloneProgram = (data) => {
		setResponse(!response);
		fetchAllHeatingSchedules();
	};

	const handleDeleteProgram = () => {
		setResponse(!response);
		fetchAllHeatingSchedules();
	};

	const handleEditProgram = (data) => {
		setResponse(!response);
		fetchAllHeatingSchedules();
	};
	const [Loader, setLoader] = useState(true);

	const fetchAllHeatingSchedules = async () => {
		await axios
			.get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST)
			.then((response) => response.data)
			.then((data) => {
				setProgramList(data);
				setFilteredPrograms(data);

				setLoader(false);
			})
			.catch((error) => console.error("Error:", error))
			.finally(() => setLoader(false));
	};

	useEffect(() => {
		fetchAllHeatingSchedules();
	}, [response]);

	useEffect(() => {
		if (searchQuery) {
			const filtered = programList.filter((program) =>
				program?.templateName.toLowerCase().includes(searchQuery.toLowerCase()),
			);
			setFilteredPrograms(filtered);
		} else {
			setFilteredPrograms(programList);
		}
	}, [searchQuery, programList]);
	const [initialData, setInitialData] = useState({});
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
								})),
							})),
						};
					}),
				};

				setInitialData(apiData);
			})
			.catch((error) => console.error("Error:", error));
	};
	useEffect(() => {
		fetchAllLocations();
	}, [response, response2]);

	const handleKeyDown = (e) => {
		if (e.keyCode === 13) {
			e.preventDefault(); // Prevent the default action of Enter key
		}
	};
	const [isInitialRender, setIsInitialRender] = useState(true);
	useEffect(() => {
		// Set initial render to false after first render
		setIsInitialRender(false);
	}, []);
	const sortedPrograms = () => {
		if (filteredPrograms && filteredPrograms.length > 0) {
			return filteredPrograms.sort((a, b) => {
				// Prioritize programs with rooms assigned (assignedRooms > 0)
				if (a.assignedRooms === 0 && b.assignedRooms > 0) {
					return 1; // Move programs with no assigned rooms down
				} else if (a.assignedRooms > 0 && b.assignedRooms === 0) {
					return -1; // Move programs with assigned rooms up
				} else {
					if (selectedFilter === "Neueste zuerst" || isInitialRender) {
						return new Date(b.updatedAt) - new Date(a.updatedAt);
					}
				}
			});
		}
		return [];
	};

	return (
		<div className="flex flex-col gap-6">
			<h2 className="text-[24px] text-black">Heizpläne</h2>
			<div className="flex items-center justify-between">
				<div className="flex gap-4 items-center">
					<form className="w-[380px]">
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
								placeholder="Heizplan suchen"
								required
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={handleKeyDown}
							/>
						</div>
					</form>
					<div className="relative">
						<div
							className="flex items-center justify-center gap-1.5 text-[#6B7280] cursor-pointer"
							onClick={handleDropdownToggle}
						>
							<FaFilter />
							<p className="text-sm">{selectedFilter}</p>
						</div>
						{isDropdownOpen && (
							<div className="left-10 absolute end-0 z-10 mt-4 w-56 divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg">
								<ul className="list-none p-2">
									<li
										className="cursor-pointer block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
										onClick={() => handleFilterChange("Neueste zuerst")}
									>
										Neueste zuerst
									</li>
									<li
										className="cursor-pointer block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
										onClick={() => handleFilterChange("Älteste zuerst")}
									>
										Älteste zuerst
									</li>

									{/* <li
										className="cursor-pointer block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
										onClick={() => handleFilterChange("Kein Filter")}
									>
										Kein Filter
									</li> */}
								</ul>
							</div>
						)}
					</div>
				</div>
				<div>
					<Button
						as="span"
						onClick={handleOpenModal}
						className="bg-primary text-white rounded-lg text-sm cursor-pointer"
					>
						<GoPlus className="mr-2 h-5 w-5" />
						Heizplan erstellen
					</Button>
				</div>
			</div>
			<div key={key} className="flex flex-col gap-6">
				{sortedPrograms().map((program, index) => (
					<HeatingProgramEntity
						key={index}
						onUpdateRooms={handleRoomUpdate}
						onCloneProgram={handleCloneProgram}
						onEditProgram={handleEditProgram}
						onDeleteProgram={handleDeleteProgram}
						program={program}
						fetchAll={fetchAllHeatingSchedules}
						response2={response2}
						initialData={initialData}
					/>
				))}
			</div>

			{Loader && (
				<div className="w-full flex flex-col justify-center items-center">
					<Spinner aria-label="Extra large spinner example" size="xl" />
				</div>
			)}
			<div>
				{openModal && (
					<CreateHeatingModal
						openModal={openModal}
						handleOpenModal={handleOpenModal}
						onCreate={handleCreateHeatingProgram}
					/>
				)}
			</div>
		</div>
	);
}

export default HeatingSchedulePage;
