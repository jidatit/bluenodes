/* eslint-disable no-unused-vars */
import { Button, Toast } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { CreateHeatingModal } from "./CreateHeating/CreateHeatingModal";
import HeatingProgramEntity from "./components/HeatingProgramEntity";
import { errorMessages } from "../../../globals/errorMessages";

function HeatingSchedulePage() {
	const token = localStorage.getItem("token");

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
		setShowToast(true);

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
		setResponse(!response);
		setShowToast(true);

		// Hide the toast after 4 seconds
		setTimeout(() => {
			setShowToast(false);
		}, 4000);
	};

	useEffect(() => {
		fetch(
			"https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/list",
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
			.then((response) => response.json())
			.then((data) => {
				setProgramList(data);
				setFilteredPrograms(data);
			})
			.catch((error) => console.error("Error:", error));
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
						program={program}
					/>
				))}
			<div>
				<CreateHeatingModal
					openModal={openModal}
					handleOpenModal={handleOpenModal}
					onCreate={handleCreateHeatingProgram}
				/>
			</div>
			{showToast && (
				<div
					className="fixed top-4 right-4 z-50 transition-transform duration-300 ease-in-out transform translate-x-0"
					style={{ transition: "transform 0.3s ease-in-out" }}
				>
					<Toast className="animate-slideIn">
						{isSuccess ? (
							<div className="text-cyan-600 dark:text-cyan-600 mr-2.5">
								{/* Success SVG */}
							</div>
						) : (
							<div className="text-red-600 dark:text-red-500 mr-2.5">
								{/* Error SVG */}
							</div>
						)}
						<div className="pl-4 text-sm font-normal border-l">
							{toastMessage}
						</div>
					</Toast>
				</div>
			)}
		</div>
	);
}

export default HeatingSchedulePage;
