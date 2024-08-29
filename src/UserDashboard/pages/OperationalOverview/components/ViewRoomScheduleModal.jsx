/* eslint-disable react/prop-types */
// Parent Component
import { Button, Modal, ToggleSwitch, Tooltip } from "flowbite-react";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import HeatingScheduleTable from "../../HeatingSchedule/components/HeatingScheduleTable";
import HeatingScheduleComparison from "./HeatingScheduleComparison";
import HeatingScheduleTableStatic from "../../HeatingSchedule/components/HeatingScheduleTableStatic";
import { Spinner } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";

export function ViewRoomScheduleModal({
	openModal,
	handleOpenModal,
	algo,
	heatingScheduleId,
	roomName,
	handleOpenEditModal,
	room,
}) {
	const [switch1, setSwitch1] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [locationDetails, setLocationDetails] = useState(null);
	const [loading, setloading] = useState(false);

	const handleCheckboxChange = () => {
		setIsChecked(!isChecked);
	};
	const handleCloseModal = () => {
		handleOpenModal();
	};

	useEffect(() => {
		if (heatingScheduleId !== null) {
			setloading(true);
			axios
				.get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(heatingScheduleId))

				.then((response) => response.data)
				.then((data) => {
					setLocationDetails(data);
				})
				.catch((error) => console.error("Error:", error))
				.finally(() => setloading(false)); // Corrected here
		}
	}, [heatingScheduleId]);

	return (
		<>
			<Modal
				theme={customTheme}
				size={"7xl"}
				show={openModal}
				onClose={handleCloseModal}
			>
				{loading && (
					<Modal.Body className="p-5 flex flex-col justify-center items-center overflow-hidden h-auto">
						<Spinner />
					</Modal.Body>
				)}
				{locationDetails && (
					<>
						<Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
							{roomName}
						</Modal.Header>
						<Modal.Body className="p-5 overflow-hidden  h-auto">
							<div className=" flex items-start">
								<div className=" w-1/3 flex flex-col gap-4">
									<h3 className="text-[16px] text-gray-500 font-semibold">
										General Information
									</h3>
									<div className="flex flex-col gap-2 text-sm text-gray-900 font-normal">
										<div className="flex flex-col gap-2">
											<p className=" font-semibold">Program Name</p>
											<p className="">{locationDetails.templateName}</p>
										</div>
										<div className="flex flex-col gap-2">
											<p className=" font-semibold">Child Safety</p>
											<p className="">
												{locationDetails.allowDeviceOverride ? "No" : "Yes"}
											</p>
										</div>

										{locationDetails.allowDeviceOverride && (
											<>
												<div className="flex flex-col gap-2">
													<p className="font-semibold flex items-center gap-1">
														Minimum Temperature
														<Tooltip
															className="px-3 py-1.5 text-center max-w-96"
															content="The minimum temperature that can be manually adjusted on the thermometer by physical means."
															style="light"
														>
															<IoInformationCircleOutline color="#6B7280" />
														</Tooltip>
													</p>
													<p className="">
														{locationDetails.deviceOverrideTemperatureMin}°C
													</p>
												</div>
												<div className="flex flex-col gap-2">
													<p className="font-semibold flex items-center gap-1">
														Maximum Temperature
														<Tooltip
															className="px-3 py-1.5 text-center max-w-96"
															content="The maximum temperature that can be manually adjusted on the thermometer by physical means."
															style="light"
														>
															<IoInformationCircleOutline color="#6B7280" />
														</Tooltip>
													</p>
													<p className="">
														{locationDetails.deviceOverrideTemperatureMax}°C
													</p>
												</div>
											</>
										)}

										<div className="flex flex-col gap-2">
											<p className=" font-semibold  flex items-center gap-1">
												Apply Algorithm?
												<Tooltip
													className="px-3 py-1.5 text-center max-w-96"
													content="The minimum temperature that can be manually adjusted on the thermometer by physical means."
													style="light"
												>
													<IoInformationCircleOutline color="#6B7280" />
												</Tooltip>
											</p>
											<p className="">{algo ? "Yes" : "No"}</p>
										</div>
									</div>
								</div>
								<div className=" w-full border-l flex flex-col gap-4 border-gray-200 pl-4 ">
									<h3 className="text-[16px] text-gray-500 font-semibold">
										Heating Schedule
									</h3>
									{/* <ToggleSwitch checked={switch1} label="Toggle me" onChange={setSwitch1} /> */}
									<div>
										<label className="flex cursor-pointer select-none items-center gap-2">
											<div className="relative">
												<input
													type="checkbox"
													checked={isChecked}
													onChange={handleCheckboxChange}
													className="sr-only"
												/>
												<div
													className={`box block h-5 !w-10 rounded-full ${
														isChecked ? "bg-primary" : " bg-gray-200"
													}`}
												></div>
												<div
													className={`absolute left-1 top-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${
														isChecked ? "translate-x-full" : ""
													}`}
												></div>
											</div>
											{!isChecked ? (
												<div className=" text-sm text-gray-900 font-medium">
													View schedule adjusted by algorithm
												</div>
											) : (
												<div className=" text-sm text-gray-900 font-medium">
													View original schedule
												</div>
											)}
										</label>
									</div>
									{!isChecked ? (
										<div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
											{locationDetails && (
												<HeatingScheduleTableStatic
													locationDetails={locationDetails}
													// noHeading={true}
												/>
											)}
										</div>
									) : (
										<div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
											<HeatingScheduleComparison
												initialLayouts={locationDetails}
												noHeading={true}
											/>
										</div>
									)}
								</div>
							</div>
						</Modal.Body>
						<Modal.Footer>
							<Button
								onClick={() => {
									if (room.heatingSchedule !== null) {
										handleCloseModal();
										handleOpenEditModal(room ? room : null);
									}
								}}
								className="bg-primary"
							>
								Edit
							</Button>

							<Button
								className="font-black"
								color="gray"
								onClick={handleCloseModal}
							>
								Close
							</Button>
						</Modal.Footer>
					</>
				)}
			</Modal>
		</>
	);
}
