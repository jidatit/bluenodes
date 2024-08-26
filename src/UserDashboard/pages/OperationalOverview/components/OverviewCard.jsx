/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaRegCopy, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
	Button,
	Modal,
	Tooltip,
	Accordion,
	Progress,
	List,
} from "flowbite-react";
import { MdNotificationsActive } from "react-icons/md";
import HeatingScheduleTable from "../../HeatingSchedule/components/HeatingScheduleTable";
import bimg from "../../../../assets/images/Image.png";
import TemperatureSchedule from "./TemperatureSchedule";
import { FaCircleExclamation } from "react-icons/fa6";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import React, { memo } from "react";

const OverviewCard = ({ formData }) => {
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openAlertDeleteModal, setOpenAlertDeleteModal] = useState(false);
	const [buildError, setBuildError] = useState(true);
	const [accordianOpened, setaccordianOpened] = useState(false);
	const [accordianOpened2, setaccordianOpened2] = useState(false);

	const [opened, setOpened] = useState(false);
	const handleDelete = () => {
		setOpenDeleteModal(false);
		if (formData.children.some((child) => child.roomsAssigned !== 0)) {
			setOpenAlertDeleteModal(true);
		}
	};
	const [count, setCount] = useState(0);
	const [indexCount, setIndexCount] = useState();

	const triggerCount = () => {
		setCount(count + 1);
		if (count % 2 === 0) {
			setaccordianOpened(true);
		}
	};
	const [openedIndex, setOpenedIndex] = useState(null);

	const triggerCount2 = (index) => {
		if (openedIndex === index) {
			setOpenedIndex(null);
			setaccordianOpened2(false);
		} else {
			setOpenedIndex(index);
			setaccordianOpened2(true);
		}
	};

	return (
		<>
			<div className="w-full relative flex flex-col border-gray-200 border-[1px] bg-white rounded-[8px] px-4 py-4 justify-center items-center">
				<div className="flex items-start gap-4 w-full">
					<div className="w-[55px] h-[90px] rounded-md">
						<img
							src={bimg || "default-image-url"}
							className="w-full h-full"
							alt="Building"
						/>
					</div>
					<div className="w-full h-full">
						<div className="w-full flex flex-row justify-start gap-[10px] items-end text-gray-900">
							<div className="w-[60%] flex flex-col justify-center items-start gap-2">
								<div className="flex items-center gap-1">
									<p className="text-[16px] font-[700]">{formData.name}</p>
									{/* {buildError && (
										<Tooltip
											className={`px-3 py-1.5 text-center text-gray-900 max-w-[356px]`}
											// content={`Window: ${target.temp}`}
											content={
												<div className=" flex flex-col items-start justify-start">
													<h3 className=" text-lg font-semibold">Errors</h3>
													<div className=" text-gray-900 text-sm text-start p-1">
														<List>
															<List.Item className=" flex items-start gap-1 justify-start">
																<span className=" text-base">&#8226;</span>
																{errors.maxTempInvalid}
															</List.Item>
															<List.Item className=" flex items-start gap-1 justify-start">
																<span className=" text-base">&#8226;</span>
																{errors.maxTempInvalid}
															</List.Item>
															<List.Item className=" flex items-start gap-1 justify-start">
																<span className=" text-base">&#8226;</span>
																{errors.maxTempInvalid}
															</List.Item>
														</List>
													</div>
												</div>
											}
											style="light"
										>
											<FaCircleExclamation className="text-red-700" />
										</Tooltip>
									)} */}
								</div>
								<p className="text-[12px] font-[400] text-gray-500">
									Devices Online
								</p>
								<p className="text-[14px] font-[400]">
									{formData.numberOfDevicesOnline}/{formData.numberOfDevices}
								</p>
							</div>
							<div className="w-[20%] flex flex-col justify-center items-start gap-1">
								<p className="text-[12px] font-[400] text-gray-500">
									Room Assigned Rate
								</p>
								<p className="text-[14px] font-[400]">
									{formData.assignedNumberOfRooms}/{formData.numberOfRooms}
								</p>
							</div>
							<div className="w-[25%] flex flex-col justify-end items-end gap-1">
								<p className="text-[12px] text-gray-500 font-[500]">
									{(
										(formData.assignedNumberOfRooms / formData.numberOfRooms) *
										100
									).toFixed(0)}
									% rooms assigned
								</p>
								<div className="w-full max-w-[212px]">
									<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
										<div
											className="bg-green-500 h-2.5 rounded-full"
											style={{
												width: `${
													(formData.assignedNumberOfRooms /
														formData.numberOfRooms) *
													100
												}%`,
											}}
										></div>
									</div>
								</div>
							</div>
						</div>
						<div className="w-full bg-[#a3a6ad] opacity-40 mt-3 mb-3 h-[1px]"></div>
						<div className="w-full flex flex-row justify-start items-center">
							<Accordion className="w-full border-none" collapseAll>
								<Accordion.Panel>
									<Accordion.Title className="p-2 mb-1 flex-row-reverse items-center justify-end gap-1 border-none relative hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white outline-0">
										<div
											onClick={() => triggerCount()}
											className="absolute left-0 right-0 bottom-0 top-0 z-50 bg-transparent"
										></div>
										<p className="text-sm text-gray-900 font-bold">
											<span className="text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md">
												{formData.numberOfFloors} floors
											</span>
										</p>
									</Accordion.Title>
									<Accordion.Content className="rounded-lg p-[16px]">
										<div className="flex flex-row justify-between gap-4 items-start w-full">
											<div className="flex flex-col justify-start items-start w-full">
												<Accordion className="w-full border-none" collapseAll>
													{formData.children.map((child, index) => (
														<Accordion.Panel key={index}>
															<Accordion.Title className="w-full relative p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white outline-0 [&>h2]:w-full">
																<div
																	onClick={() => {
																		triggerCount2(index);
																	}}
																	className="absolute left-0 right-0 bottom-0 top-0 z-50 bg-transparent"
																></div>
																<div className="w-full flex justify-between items-center">
																	<p className="text-sm w-full text-gray-900 font-bold">
																		{child.name}
																		<span className="text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md">
																			{child.numberOfRooms} Rooms
																		</span>
																	</p>
																	<div className="w-[25%] flex flex-col justify-end items-end gap-1">
																		<p className="text-[12px] text-gray-500 font-[500]">
																			{(
																				(child.assignedNumberOfRooms /
																					child.numberOfRooms) *
																				100
																			).toFixed(0)}
																			% rooms assigned
																		</p>
																		<div className="w-full max-w-[212px]">
																			<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
																				<div
																					className="bg-green-500 h-2.5 rounded-full"
																					style={{
																						width: `${
																							(child.assignedNumberOfRooms /
																								child.numberOfRooms) *
																							100
																						}%`,
																					}}
																				></div>
																			</div>
																		</div>
																	</div>
																</div>
															</Accordion.Title>
															<Accordion.Content className="px-4 pt-0 pb-4 border-none">
																<div className="w-full bg-[#a3a6ad] opacity-40 mt-3 mb-5 h-[1px]"></div>
																<div className="px-7 flex flex-col gap-5 w-full">
																	<TemperatureSchedule
																		accordianOpened2={accordianOpened2}
																		setaccordianOpened2={setaccordianOpened2}
																		accordianOpened={accordianOpened}
																		setaccordianOpened={setaccordianOpened}
																		floorId={child.id}
																	/>
																</div>
															</Accordion.Content>
														</Accordion.Panel>
													))}
												</Accordion>
											</div>
										</div>
									</Accordion.Content>
								</Accordion.Panel>
							</Accordion>
						</div>
					</div>
				</div>
			</div>
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

export default OverviewCard;
