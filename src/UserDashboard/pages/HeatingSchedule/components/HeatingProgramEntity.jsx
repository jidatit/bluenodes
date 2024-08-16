/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useDebugValue, useEffect, useRef, useState } from "react";
import { FaRegCopy, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Button, Modal, Tooltip, Accordion } from "flowbite-react";
import { MdNotificationsActive } from "react-icons/md";
import HeatingScheduleTable from "./HeatingScheduleTable";
import AssignRoomsModal from "./AssignRoomsModal";
import { CloneHeatingModal } from "../CloneHeating/CloneHeatingModal";
import { EditHeatingModal } from "../EditHeating/EditHeatingModal";
import { errorMessages } from "../../../../globals/errorMessages";
import { Toast } from "flowbite-react";
import { Spinner } from "flowbite-react";

const HeatingProgramEntity = ({
	formData,
	onUpdateRooms,
	onCloneProgram,
	onEditProgram,
	onDeleteProgram,
	program,
	fetchAll,
}) => {
	const token = localStorage.getItem("token");

	// console.log("static", formData)
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openAlertDeleteModal, setOpenAlertDeleteModal] = useState(false);
	const [openAssignModal, setOpenAssignModal] = useState(false);
	const [openCloneModal, setOpenCloneModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [locationDetails, setLocationDetails] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [fetched, setfetched] = useState(false);
	const [Loader, setLoader] = useState(true);
	const handleToggle = () => {
		setIsOpen(!isOpen);
		if (!isOpen) {
			console.log("fetching");
		}
	};

	const handleAssign = () => {
		setOpenAssignModal(!openAssignModal);
		setResponse(!response);
		fetchDetails();
		fetchAll();
	};

	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(true);
	const [accordianOpened, setaccordianOpened] = useState(true);

	const handleDelete = async () => {
		fetchDetails();

		const programName = program.templateName;

		// Check if any room has a matching programAssigned
		const hasMatchingProgram = initialData.buildings.some((building) =>
			building.floors.some((floor) =>
				floor.rooms.some((room) => room.programAssigned === programName),
			),
		);

		if (hasMatchingProgram) {
			setOpenAlertDeleteModal(true);
			return; // Exit the function if there's a matching program
		}

		// If no matching program, proceed to call the delete API
		try {
			const response = await fetch(
				`https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/${program.id}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`, // Add auth token if needed
					},
				},
			);

			if (response.ok) {
				// Handle successful delete
				console.log("Delete successful");
				setIsSuccess(true);
				setToastMessage(errorMessages.deleteSuccessfull);
				// Perform any state updates or UI changes
			} else {
				// Handle errors
				const errorData = await response.json();
				console.error("Delete failed", errorData);
				setIsSuccess(false);
				setToastMessage(errorMessages.deleteFailed);
			}
		} catch (error) {
			console.error("Network error", error);
		}
		setOpenDeleteModal(false);
		onDeleteProgram();
		setShowToast(true);
		setTimeout(() => {
			setShowToast(false);
		}, 4000);
	};

	const [response, setResponse] = useState(false);

	const handleUpdateRoomsAssigned = (data) => {
		if (data) {
			onUpdateRooms(data);
			fetchAll();
			fetchDetails();
		}
		setResponse(!response);
	};

	const handleCloneHeatingProgram = (data) => {
		if (data) {
			onCloneProgram(data);
		}
		setResponse(!response);
	};

	const handleEditHeatingProgram = (data) => {
		if (data) {
			onEditProgram(data);
		}
		setResponse(!response);
		fetchDetails();
	};

	const handleCloneModal = () => {
		fetchDetails();
		setOpenCloneModal(!openCloneModal);
	};

	const handleEditModal = () => {
		fetchDetails();
		setOpenEditModal(!openEditModal);
	};

	const fetchDetails = async () => {
		try {
			const response = await fetch(
				`https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/${program.id}/details`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const data = await response.json();
			setLocationDetails(data); // Update the state with the fetched data
			setLoader(false);
			setfetched(true); // Ensure fetched is set to true only after data is fetched
		} catch (error) {
			console.error("Error:", error);
		}
	};
	// Function to recursively count the rooms
	const countRooms = (node) => {
		if (node.type === "raum") {
			return 1;
		}
		if (node.children && node.children.length > 0) {
			return node.children.reduce((sum, child) => sum + countRooms(child), 0);
		}
		return 0;
	};
	const options = {
		onOpen: (item) => {
			console.log("accordion item has been shown");
			console.log(item);
		},
		onClose: (item) => {
			console.log("accordion item has been hidden");
			console.log(item);
		},
		onToggle: (item) => {
			console.log("accordion item has been toggled");
			console.log(item);
		},
	};

	const getDate = () => {
		// Input date string
		const dateString = program.updatedAt;

		// Parse the date string into a Date object
		const date = new Date(dateString);

		// Format the date in DD/MM/YYYY HH:MM:SS format
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
		const year = date.getFullYear();
		let hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const ampm = hours >= 12 ? "PM" : "AM";
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		const formattedHours = String(hours).padStart(2, "0");

		// Create the formatted date string
		return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
	};

	const [initialData, setInitialData] = useState({});

	useEffect(() => {
		fetch(
			`https://api-dev.blue-nodes.app/dev/smartheating/locations?heatingScheduleDetails=true&roomTemperature=true&assignedNumberOfRooms=true&numberOfRooms=true`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
			.then((response) => response.json())
			.then((data) => {
				// console.log(data,"from backend")
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

				setInitialData(apiData);
			})
			.catch((error) => console.error("Error:", error));
	}, [response]);

	// console.log(locationDetails)
	return (
		<>
			<div className="w-full relative border-gray-200 border-[1px] flex flex-col bg-white rounded-[8px] px-4 py-4 justify-center items-center">
				<div className="flex absolute top-4 right-3 flex-row justify-center items-center gap-3 text-gray-900">
					<Tooltip
						className="min-w-[130px]"
						content="Clone program"
						style="light"
						animation="duration-500"
					>
						<FaRegCopy
							onClick={handleCloneModal}
							className="cursor-pointer transition-all ease-in-out delay-75 hover:text-[#5a5d65]"
						/>
					</Tooltip>
					<Tooltip
						className="min-w-[130px]"
						content="Edit program"
						style="light"
						animation="duration-500"
					>
						<FaEdit
							onClick={handleEditModal}
							className="cursor-pointer transition-all ease-in-out delay-75 hover:text-[#5a5d65]"
						/>
					</Tooltip>
					<Tooltip
						className="min-w-[130px]"
						content="Delete program"
						style="light"
						animation="duration-500"
					>
						<RiDeleteBin6Line
							onClick={() => {
								setOpenDeleteModal(true);
								fetchDetails();
							}}
							className="cursor-pointer transition-all ease-in-out delay-75 hover:text-[#b44949]"
						/>
					</Tooltip>
				</div>
				<div className="w-full flex flex-row justify-start gap-[10px] items-center text-gray-900">
					<div className="w-[25%] flex flex-col justify-center items-start">
						<p className="text-[16px] font-[700]">{program?.templateName}</p>
						<p className="text-[12px] font-[400] text-gray-500">
							Last updated: {getDate()}
						</p>
					</div>
					<div className="w-[15%] flex flex-col justify-center items-start">
						<p className="text-[12px] text-gray-500 font-[500]">Child safety</p>
						<p className="text-[14px] font-[400]">
							{program?.allowDeviceOverride === true ? "No" : "Yes"}
						</p>
					</div>
					{program?.allowDeviceOverride === true && (
						<>
							<div className="w-[15%] flex flex-col justify-center items-start">
								<p className="text-[12px] text-gray-500 font-[500]">
									Minimum temperature
								</p>
								<p className="text-[14px] font-[400]">
									{program?.deviceOverrideTemperatureMin}&deg;C
								</p>
							</div>
							<div className="w-[15%] flex flex-col justify-center items-start">
								<p className="text-[12px] text-gray-500 font-[500]">
									Maximum temperature
								</p>
								<p className="text-[14px] font-[400]">
									{program?.deviceOverrideTemperatureMax}&deg;C
								</p>
							</div>
						</>
					)}

					{/* <div className='w-[15%] flex flex-col justify-center items-start'>
                        <p className='text-[12px] text-gray-500 font-[500]'>Apply algorithm</p>
                        <p className='text-[14px] font-[400]'>{formData.formData?.applyAlgorithm}</p>
                    </div> */}
				</div>
				<div className="w-full bg-[#a3a6ad] opacity-40 mt-3 mb-3 h-[1px]"></div>

				<div className="w-full flex flex-row justify-start items-center">
					<Accordion
						onClick={fetchDetails}
						className="w-full border-none"
						collapseAll
					>
						<Accordion.Panel isOpen={isOpen} className="">
							<Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white">
								<p className="text-sm text-gray-900 font-bold">
									<span
										className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md`}
									>
										View details - {program?.assignedRooms}{" "}
										{program?.assignedRooms > 1 ? "rooms" : "room"}
									</span>
								</p>
							</Accordion.Title>
							{fetched ? (
								<Accordion.Content className="rounded-lg px-4 py-2 border-none">
									<div className="flex flex-row justify-between gap-4 items-start w-full p-4">
										<div className="flex flex-col justify-start items-start w-[25%]">
											<div className="flex w-full pr-[10px] mt-[0px] mb-[10px] flex-row justify-between items-center">
												<h2 className="text-gray-500 font-[600]">Assigned</h2>
												<Button
													onClick={handleAssign}
													className="bg-[#0BAAC9] text-white py-2 px-3 [&>*]:p-0"
												>
													Assign rooms
												</Button>
											</div>
											{console.log(locationDetails)}
											{locationDetails?.assignedRooms?.map(
												(building, index) => (
													<Accordion
														key={building.id}
														className="w-full border-none"
														collapseAll
													>
														<Accordion.Panel>
															<Accordion.Title className="p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white">
																<p className="text-[12px] text-gray-900 font-bold">
																	{building.name}
																	<span
																		className={`text-[12px] py-0.5 px-2.5 ml-1 bg-[#E5EDFF] text-[#42389D] font-[500] rounded-md`}
																	>
																		{countRooms(building)}{" "}
																		{countRooms(building) > 1
																			? "rooms"
																			: "room"}
																	</span>
																</p>
															</Accordion.Title>
															<Accordion.Content className=" px-4 pt-0 pb-4 border-none">
																{building.children.map((floor, floorIndex) => (
																	<Accordion
																		key={floor.id}
																		className="w-full border-none"
																		collapseAll
																	>
																		<Accordion.Panel>
																			<Accordion.Title className="p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white">
																				<p className="text-[12px] text-gray-900 font-bold">
																					{floor.name}
																					<span
																						className={`text-[12px] py-0.5 px-2.5 ml-1 bg-[#E5EDFF] text-[#42389D] font-[500] rounded-md`}
																					>
																						{floor.children.length}{" "}
																						{floor.children.length > 1
																							? "rooms"
																							: "room"}
																					</span>
																				</p>
																			</Accordion.Title>
																			<Accordion.Content className=" pl-10 pt-2 pb-4 border-none">
																				<ul>
																					{floor.children.map((room) => (
																						<li
																							key={room.id}
																							className="room-item mb-2"
																						>
																							<p className="text-black text-[12px] font-semibold">
																								{room.name}
																							</p>
																						</li>
																					))}
																				</ul>
																			</Accordion.Content>
																		</Accordion.Panel>
																	</Accordion>
																))}
															</Accordion.Content>
														</Accordion.Panel>
													</Accordion>
												),
											)}
										</div>
										<div className="flex flex-col border-l-2 border-l-[#E5E7EB] pl-2 justify-center items-center w-[75%]">
											{locationDetails && (
												<HeatingScheduleTable
													locationDetails={locationDetails}
												/>
											)}
										</div>
									</div>
								</Accordion.Content>
							) : (
								<Accordion.Content className=" px-4 pt-0 pb-4 border-none">
									{Loader && (
										<div className="w-full flex flex-col justify-center items-center">
											<Spinner
												aria-label="Extra large spinner example"
												size="xl"
											/>
										</div>
									)}
								</Accordion.Content>
							)}
						</Accordion.Panel>
					</Accordion>
				</div>

				<DeleteModal
					openDeleteModal={openDeleteModal}
					setOpenDeleteModal={setOpenDeleteModal}
					handleDelete={handleDelete}
				/>
				<AlertDeleteModal
					openAlertDeleteModal={openAlertDeleteModal}
					setOpenAlertDeleteModal={setOpenAlertDeleteModal}
				/>
				{openAssignModal && (
					<AssignRoomsModal
						openAssignModal={openAssignModal}
						handleAssign={handleAssign}
						onUpdate={handleUpdateRoomsAssigned}
						initialData={initialData}
						program={program}
					/>
				)}
				{openCloneModal && (
					<CloneHeatingModal
						openCloneModal={openCloneModal}
						handleCloneModal={handleCloneModal}
						onCreate={handleCloneHeatingProgram}
						program={program}
						locationDetails={locationDetails}
					/>
				)}
				{openEditModal && (
					<EditHeatingModal
						openEditModal={openEditModal}
						handleEditModal={handleEditModal}
						onEdit={handleEditHeatingProgram}
						program={program}
						locationDetails={locationDetails}
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
		</>
	);
};

const DeleteModal = ({ openDeleteModal, setOpenDeleteModal, handleDelete }) => {
	return (
		<Modal
			show={openDeleteModal}
			size="lg"
			onClose={() => setOpenDeleteModal(false)}
			popup
		>
			<Modal.Header />
			<Modal.Body>
				<div className="text-center">
					<RiDeleteBin6Line size={30} className="text-[#9CA3AF] mx-auto mb-4" />
					<h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
						Are you sure you want to delete this heating program?
					</h3>
					<div className="flex justify-center gap-4">
						<Button color="gray" onClick={() => setOpenDeleteModal(false)}>
							Cancel
						</Button>
						<Button color="failure" onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
};

const AlertDeleteModal = ({
	openAlertDeleteModal,
	setOpenAlertDeleteModal,
}) => {
	return (
		<Modal
			show={openAlertDeleteModal}
			size="lg"
			onClose={() => setOpenAlertDeleteModal(false)}
			popup
		>
			<Modal.Header />
			<Modal.Body>
				<div className="text-center">
					<MdNotificationsActive
						size={30}
						className="text-[#9CA3AF] mx-auto mb-4"
					/>
					<h3 className="mb-1 text-lg font-normal text-gray-500 dark:text-gray-400">
						Heating program can’t be deleted as there are rooms assigned to it.
					</h3>
					<h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
						Reassign rooms to different program before proceeding with delete.
					</h3>
					<div className="flex justify-center gap-4">
						<Button color="gray" onClick={() => setOpenAlertDeleteModal(false)}>
							Cancel
						</Button>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default HeatingProgramEntity;
