/* eslint-disable no-unused-vars */
import { Button, Toast } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { CreateHeatingModal } from "./CreateHeating/CreateHeatingModal";
import HeatingProgramEntity from "./components/HeatingProgramEntity";
import { errorMessages } from "../../../globals/errorMessages";
import { Spinner } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../../globals/apiURL.js";
import { flushSync } from "react-dom";

function HeatingSchedulePage() {
	// Adding use state React Hooks here
	const [programList, setProgramList] = useState([]);
	const [filteredPrograms, setFilteredPrograms] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("Filter");
	const [isDropdownOpen, setDropdownOpen] = useState(false); // Define state to manage dropdown visibility
	const [openModal, setOpenModal] = useState(false);

	const handleOpenModal = () => {
		setOpenModal(!openModal);
	};

	const handleDropdownToggle = () => setDropdownOpen(!isDropdownOpen);

	const handleFilterChange = (filter) => {
		setSelectedFilter(filter);
		setDropdownOpen(false);

		let filtered;

		const parseDate = (dateString) => new Date(dateString);

		switch (filter) {
			case "Oldest to Newest":
				filtered = [...filteredPrograms].sort(
					(a, b) => parseDate(a.updatedAt) - parseDate(b.updatedAt),
				);
				break;
			case "Newest to Oldest":
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
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(true);

	const handleCreateHeatingProgram = (combinedData) => {
		if (combinedData) {
			if (combinedData === "Error") {
				setToastMessage(errorMessages.FailedCreation);
				setIsSuccess(false);
			} else {
				setToastMessage(errorMessages.successfulCreation);
				setIsSuccess(true);
			}
		} else {
			setToastMessage(errorMessages.FailedCreation);
			setIsSuccess(false);
		}
		setResponse(!response);

		setShowToast(true);

		// Hide the toast after 4 seconds
		setTimeout(() => {
			setShowToast(false);
		}, 4000);
	};

	const handleRoomUpdate = (data) => {
		if (data) {
			if (data === "Error") {
				setToastMessage(errorMessages.roomAssignFailed);
				setIsSuccess(false);
			} else {
				setToastMessage(errorMessages.roomAssignSuccessfull);
				setIsSuccess(true);
			}
		} else {
			setToastMessage(errorMessages.roomAssignFailed);
			setIsSuccess(false);
		}
		setResponse(!response);
		setResponse2(!response2);
		setShowToast(true);
		fetchAllHeatingSchedules();
		// Hide the toast after 4 seconds
		setTimeout(() => {
			setShowToast(false);
		}, 4000);
	};

	const handleCloneProgram = (data) => {
		if (data) {
			if (data === "Error") {
				setToastMessage(errorMessages.cloneFailed);
				setIsSuccess(false);
			} else {
				setToastMessage(errorMessages.cloneSuccessfull);
				setIsSuccess(true);
			}
		} else {
			setToastMessage(errorMessages.cloneFailed);
			setIsSuccess(false);
		}
		setResponse(!response);
		setShowToast(true);

		// Hide the toast after 4 seconds
		setTimeout(() => {
			setShowToast(false);
		}, 4000);
	};

	const handleDeleteProgram = () => {
		setResponse(!response);
		fetchAllHeatingSchedules();
	};

	const handleEditProgram = (data) => {
		if (data) {
			if (data === "Error") {
				setToastMessage(errorMessages.editFailed);
				setIsSuccess(false);
			} else {
				setToastMessage(errorMessages.editSuccessfull);
				setIsSuccess(true);
			}
		} else {
			setToastMessage(errorMessages.editFailed);
			setIsSuccess(false);
		}
		// setResponse(!response);
		fetchAllHeatingSchedules();
		setShowToast(true);

		// Hide the toast after 4 seconds
		setTimeout(() => {
			setShowToast(false);
		}, 4000);
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
									// assigned:
									// 	room.assignedNumberOfRooms !== 0 &&
									// 	room.heatingSchedule.id === program.id,
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

	return (
		<div className="flex flex-col gap-6">
			<h2 className="text-[24px] text-black">Heating programs management</h2>
			<div className="flex items-center justify-between">
				<div className="flex gap-4 items-center">
					<form className="w-[380px]">
						<label
							htmlFor="default-search"
							className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
						>
							Search
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
								placeholder="Search heating program"
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
										onClick={() => handleFilterChange("Oldest to Newest")}
									>
										Oldest to Newest
									</li>
									<li
										className="cursor-pointer block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
										onClick={() => handleFilterChange("Newest to Oldest")}
									>
										Newest to Oldest
									</li>
									<li
										className="cursor-pointer block rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
										onClick={() => handleFilterChange("No filter")}
									>
										No filter
									</li>
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
						Add heating program
					</Button>
				</div>
			</div>
			{filteredPrograms.length > 0 &&
				filteredPrograms.map((program, index) => (
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
			{showToast && (
				<div
					className="fixed top-4 right-4 z-50 transition-transform duration-300 ease-in-out transform translate-x-0"
					style={{ transition: "transform 0.3s ease-in-out" }}
				>
					<Toast className="animate-slideIn">
						{isSuccess ? (
							<div className="flex items-center">
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
								<span className="text-cyan-600 dark:text-cyan-600">
									{toastMessage}
								</span>
							</div>
						) : (
							<div className="flex items-center">
								<div className="text-red-500 dark:text-red-400 mr-2.5">
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
								<span className="text-red-500 dark:text-red-400">
									{toastMessage}
								</span>
							</div>
						)}
					</Toast>
				</div>
			)}
		</div>
	);
}

export default HeatingSchedulePage;
