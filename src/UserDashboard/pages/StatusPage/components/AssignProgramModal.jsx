/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Button, Modal, Radio, Label, Select, Tooltip } from "flowbite-react";
import { IoInformationCircleOutline } from "react-icons/io5";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../../HeatingSchedule/CreateHeating/components/ProgressStepper";
import GeneralInformation from "../../HeatingSchedule/CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../../HeatingSchedule/CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import { Toast } from "flowbite-react";
import HeatingScheduleTable from "../../HeatingSchedule/components/HeatingScheduleTable";
import { Dropdown } from "flowbite-react";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";

const AssignProgramModal = ({
	openModal,
	handleOpenModal,
	room,
	fetchList,
	assignSuccess,
	// fetchFloorDetails,
	// updateReplaced,
}) => {
	const [selectedAction, setSelectedAction] = useState("");
	const [selectedProgram, setSelectedProgram] = useState("");
	const [showError, setShowError] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [data, setData] = useState([]);
	// const { createdHeatingScheduleNames, setCreatedHeatingScheduleNames } = useHeatingSchedule();

	const handleCloseModal = () => {
		handleCancelReplace();
		handleOpenModal();
		setSelectedProgram("");
		resetModalState();
		fetchList();
	};

	const handleProgramChange = (event) => {
		setSelectedProgram(event.target.value);
		if (event.target.value === "") {
			setShowError(true);
		} else {
			setShowError(false);
		}
	};

	const handleDone = () => {
		if (!selectedProgram) {
			setShowError(true);
		} else {
			handleConfirmReplace();
		}
	};
	const [updatedR, setupdatedR] = useState(false);
	let replaced = null;

	const handleConfirmReplace = () => {
		const roomId = room.locationId;

		axios
			.get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(selectedProgram))

			.then((response) => response.data)
			.then((data) => {
				const existingRoomIds = data.locations || [];
				const updatedRoomIds = [...existingRoomIds, roomId];
				axios
					.post(
						ApiUrls.SMARTHEATING_HEATINGSCHEDULE.ASSIGN_ROOM(selectedProgram),
						{
							locations: updatedRoomIds,
						},
					)
					.then((response) => response.data)
					.then((data) => {
						// console.log(data);
						// setupdatedR(true);
						setIsSuccess(true);
						setShowToast(true);
						setSelectedProgram("");
						setToastMessage(errors.PorgramAssignedSuccessfully);
						assignSuccess();
						// updateReplaced();

						handleCloseModal();
					})
					.catch((error) => {
						setIsSuccess(false);
						setShowToast(true);
						setToastMessage(errors.PorgramAssignedFailed);
					});

				setShowConfirmModal(false);

				// Corrected prop name usage
			})
			.catch((error) => {
				setIsSuccess(false);
				setShowToast(true);
				console.error("Error fetching existing locations:", error);
				setToastMessage(errors.ProgramReplacedFailed);
			});

		setIsSuccess(true);

		setTimeout(() => {
			setShowToast(false);
			// handleCloseModal();
		}, 3000);
	};
	// if (updatedR !== null && updatedR) {
	// 	replaced = true;
	// 	// updateReplaced(replaced);
	// 	console.log("replaced update child", replaced);
	// }

	const handleCancelReplace = () => {
		setShowConfirmModal(false);
	};

	useEffect(() => {
		if (selectedAction === "replace-room" && !selectedProgram) {
			setShowError(true);
		}
	}, [selectedAction, selectedProgram]);

	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		//   programName: program?.templateName || "",
		//   childSafety: program?.allowDeviceOverride===true?"No":"Yes" || "",
		//   minTemp: program?.deviceOverrideTemperatureMin + '°C'||"",
		//   maxTemp: program?.deviceOverrideTemperatureMax + '°C'||"",
		//   applyAlgorithm: "",
		programName: "",
		childSafety: "",
		minTemp: "",
		maxTemp: "",
		applyAlgorithm: "Yes",
	});
	const [locationDetails, setLocationDetails] = useState([]);
	const [formDataApi, setFormDataApi] = useState();
	const fetchHeatingScheduleForRoom = async (heatingScheduleId) => {
		console.log("id", heatingScheduleId);
		try {
			const resp = await axios.get(
				ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(
					heatingScheduleId,
				),
			);
			const data = await resp.data;
			// console.log("Haeting", data);
			setLocationDetails(data);
			setFormDataApi(data);
			setFormData((prev) => ({
				...prev,
				programName: `${data.templateName} - Room ${room.name}`,
				childSafety: data.allowDeviceOverride ? "No" : "Yes",
				minTemp: data.deviceOverrideTemperatureMin,
				maxTemp: data.deviceOverrideTemperatureMax,
				applyAlgorithm: room.algorithm ? "Yes" : "No",
			}));
		} catch (error) {
			console.error("Error fetching heating schedule:", error);
		}
	};
	useEffect(() => {
		console.log("item", room);
		// if (room) {
		// 	fetchHeatingScheduleForRoom(room.heatingSchedule?.id);
		// }
	}, [room]);

	const [errorMessages, setErrorMessages] = useState({
		programName: "",
		childSafety: "",
		minTemp: "",
		maxTemp: "",
		applyAlgorithm: "",
	});

	const [generalErrorMessage, setGeneralErrorMessage] = useState(null); // State for general error message
	const [formSubmitted, setFormSubmitted] = useState(false);

	useEffect(() => {
		if (formSubmitted) {
			const allFieldsFilled = Object.values(formData).every(
				(field) => field !== "",
			);
			if (!allFieldsFilled) {
				setGeneralErrorMessage(errors.allFieldsRequired);
			} else {
				setGeneralErrorMessage("");
			}

			const newErrors = {};

			// Check for empty fields
			Object.keys(formData).forEach((key) => {
				if (formData[key] === "") {
					newErrors[key] = errors.missingSelectionOrInformation;
				}
			});

			// Validate temperature fields
			const minTemp = parseFloat(formData.minTemp);
			const maxTemp = parseFloat(formData.maxTemp);

			if (!isNaN(minTemp) && (minTemp < 10 || minTemp > 29)) {
				newErrors.minTemp = errors.minTempInvalid;
			}
			if (!isNaN(maxTemp) && (maxTemp < 11 || maxTemp > 30)) {
				newErrors.maxTemp = errors.maxTempInvalid;
			}
			if (!isNaN(minTemp) && !isNaN(maxTemp) && maxTemp <= minTemp) {
				newErrors.maxTemp = errors.maxTempLowerThanMinTemp;
			}

			const programName = formData.programName;
			createdHeatingScheduleNames?.map((name, index) => {
				if (programName == name) {
					newErrors.programName = errors.ProgramWithNameAlreadyCreated;
				}
			});

			if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
				setErrorMessages(newErrors);
			} else {
				setErrorMessages({});
			}
		}
	}, [formSubmitted, formData]);

	const validateField = (id, value) => {
		let error = "";

		if (value === "") {
			error = errors.missingSelectionOrInformation;
		} else {
			const minTemp =
				id === "minTemp" ? parseFloat(value) : parseFloat(formData.minTemp);
			const maxTemp =
				id === "maxTemp" ? parseFloat(value) : parseFloat(formData.maxTemp);

			if (id === "minTemp") {
				if (isNaN(minTemp) || minTemp < 10 || minTemp > 29) {
					error = errors.minTempInvalid;
				} else if (maxTemp !== "" && minTemp >= maxTemp) {
					// Update error state for maxTemp immediately
					setErrorMessages((prev) => ({
						...prev,
						maxTemp: errors.maxTempLowerThanMinTemp,
					}));
				} else {
					// Clear error for maxTemp if minTemp is valid and lower than maxTemp
					setErrorMessages((prev) => ({
						...prev,
						maxTemp: "",
					}));
				}
				// console.log(errorMessages);
			}

			if (id === "maxTemp") {
				if (isNaN(maxTemp) || maxTemp < 11 || maxTemp > 30) {
					error = errors.maxTempInvalid;
				} else if (minTemp !== "" && maxTemp <= minTemp) {
					error = errors.maxTempLowerThanMinTemp;
				}
			}
		}

		// Set error message for the current field
		setErrorMessages((prev) => ({
			...prev,
			[id]: error,
		}));
	};

	useEffect(() => {
		const minTemp = parseFloat(formData.minTemp);
		const maxTemp = parseFloat(formData.maxTemp);

		// Convert minTemp and maxTemp to strings to safely use .includes
		const minTempStr = formData.minTemp?.toString() || "";
		const maxTempStr = formData.maxTemp?.toString() || "";
		// Cross-validate minTemp and maxTemp
		if (minTemp !== "" && maxTemp !== "") {
			if ((minTemp >= maxTemp) && (maxTempStr.length>=2)) {
				// error = errors.maxTempLowerThanMinTemp;
				// Update error state for maxTemp when cross-validation fails
				setErrorMessages((prev) => ({
					...prev,
					maxTemp: errors.maxTempLowerThanMinTemp,
				}));
			} else {
				// Clear error for maxTemp if cross-validation passes
				setErrorMessages((prev) => ({
					...prev,
					maxTemp: "", // Clear the error message for maxTemp
				}));
			}
		}
	}, [formData]);

	const handleChange = (e) => {
		const { id, value } = e.target;

		validateField(id, value);

		// Check if the change is from the radio button groups
		if (id === "childSafetyYes") {
			setFormData((prev) => ({
				...prev,
				childSafety: value,
				minTemp: "min",
				maxTemp: "max",
			}));
		} else if (id === "childSafetyNo") {
			setFormData((prev) => ({
				...prev,
				childSafety: value,
				minTemp: formDataApi.deviceOverrideTemperatureMin,
				maxTemp: formDataApi.deviceOverrideTemperatureMax,
			}));
		} else if (id === "applyAlgorithmYes" || id === "applyAlgorithmNo") {
			setFormData((prev) => ({
				...prev,
				applyAlgorithm: value,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[id]: value,
			}));
		}

		// Re-validate the related temperature field
		if (id === "minTemp" && formData.maxTemp) {
			validateField("maxTemp", formData.maxTemp);
		}
		if (id === "maxTemp" && formData.minTemp) {
			validateField("minTemp", formData.minTemp);
		}

		const allFieldsFilled = Object.values({
			...formData,
			[id]: value,
		}).every((field) => field !== "");

		if (allFieldsFilled) {
			setErrorMessages({});
			setGeneralErrorMessage(""); // Clear general error message if all fields are filled
		}
	};

	const handleSubmit = () => {
		setFormSubmitted(true);

		let allFieldsFilled = true; // Flag to check if all fields are filled
		const newErrors = {};

		// Check for empty fields
		Object.keys(formData).forEach((key) => {
			if (formData[key] === "") {
				newErrors[key] = errors.missingSelectionOrInformation;
				allFieldsFilled = false; // Set flag to false if any field is empty
			}
		});
		const fetchHeatingSchedules = async () => {
			try {
				const response = await axios.get(
					ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST,
				);
				const data = await response.data;
				const templateNames =
					data.length > 0 ? data.map((template) => template.templateName) : [];
				setCreatedHeatingScheduleNames(templateNames);
			} catch (error) {
				console.error("Error:", error);
			}
		};

		fetchHeatingSchedules();
		const programName = formData.programName;
		createdHeatingScheduleNames &&
			createdHeatingScheduleNames.map((name, index) => {
				if (programName == name) {
					newErrors.programName = errors.ProgramWithNameAlreadyCreated;
				}
			});

		// Validate temperature fields

		const minTemp = parseFloat(formData.minTemp);
		const maxTemp = parseFloat(formData.maxTemp);

		if (!isNaN(minTemp) && (minTemp < 10 || minTemp > 29)) {
			newErrors.minTemp = errors.minTempInvalid;
		}
		if (!isNaN(maxTemp) && (maxTemp < 11 || maxTemp > 30)) {
			newErrors.maxTemp = errors.maxTempInvalid;
		}
		if (!isNaN(minTemp) && !isNaN(maxTemp) && maxTemp <= minTemp) {
			newErrors.maxTemp = errors.maxTempLowerThanMinTemp;
		}

		if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
			setErrorMessages(newErrors);
			return false;
		} else {
			return true;
		}
		// console.log(formData);
	};

	const [layouts, setLayouts] = useState({}); // State to hold layouts
	const [finalScheduleData, setFinalScheduleData] = useState({});

	const handleCheckRef = useRef(null); // Ref to hold handleCheck function
	const layoutsRef = useRef(layouts); // Ref to hold the latest layouts value

	// Function to handle layout updates
	const handleLayoutUpdate = (updatedLayouts) => {
		setLayouts(updatedLayouts);
		layoutsRef.current = updatedLayouts;
	};

	let newCheck = null;
	// Function to handle layout updates
	const handleCheckUpdate = (updatedCheck) => {
		// console.log(updatedCheck,"hhihi")
		newCheck = updatedCheck;
		// checkedRef.current = updatedCheck;
	};

	const handlePrevious = () => {
		if (currentStep === 2 || currentStep === 3) {
			setCurrentStep((prev) => Math.max(prev - 1, 0));
		}
	};

	const handleNext = () => {
		// console.log("first step ",formData)
		if (currentStep === 1) {
			if (handleSubmit()) {
				setCurrentStep((prev) => Math.min(prev + 1, 3));
			}
		}
	};

	const [combinedData, setCombinedData] = useState({
		formData: {
			programName: "",
			childSafety: "",
			minTemp: "",
			maxTemp: "",
			applyAlgorithm: "",
		},
		assignmentData: null,
		finalScheduleData: {},
	});

	useEffect(() => {
		if (formData && finalScheduleData) {
			setCombinedData({
				formData,
				finalScheduleData,
			});
		}
		// console.log(combinedData);
	}, [formData, finalScheduleData]);

	function convertScheduleData(data) {
		// console.log(data)
		const dayMapping = {
			[daysOfWeek[0]]: 1,
			[daysOfWeek[1]]: 2,
			[daysOfWeek[2]]: 3,
			[daysOfWeek[3]]: 4,
			[daysOfWeek[4]]: 5,
			[daysOfWeek[5]]: 6,
			[daysOfWeek[6]]: 7,
		};

		const result = { days: [] };

		const normalizeTime = (value) => {
			const hours = Math.floor((value * 24) / 96);
			const minutes = Math.floor(((value * 24 * 60) / 96) % 60);
			return `${hours.toString().padStart(2, "0")}:${minutes
				.toString()
				.padStart(2, "0")}`;
		};

		for (const [dayName, entries] of Object.entries(data)) {
			const day = dayMapping[dayName];
			entries.forEach((entry) => {
				const from = normalizeTime(entry.y);
				let to = normalizeTime(entry.y + entry.h);
				const targetTemperature = parseInt(entry.temperature, 10);

				if (to === "24:00") {
					to = "23:59";
				}

				result.days.push({
					day,
					from,
					to,
					targetTemperature,
				});
			});
		}

		return result.days;
	}

	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(true);

	const handleCreate = async () => {
		let scheduleDataTemp = {};

		if (handleCheckRef.current) {
			handleCheckRef.current();
		}

		if (newCheck !== null && !newCheck) {
			setFinalScheduleData(layoutsRef.current);
			scheduleDataTemp = layoutsRef.current;

			const data = convertScheduleData(scheduleDataTemp);

			const requestBody = {
				templateName: combinedData.formData.programName,
				allowDeviceOverride:
					combinedData.formData.childSafety == "No" ? true : false,
				locations: [room.id],
				days: data,
			};

			if (combinedData.formData.childSafety !== "Yes") {
				requestBody.deviceOverrideTemperatureMin = parseInt(
					combinedData.formData.minTemp,
				);
				requestBody.deviceOverrideTemperatureMax = parseInt(
					combinedData.formData.maxTemp,
				);
			}
			const fetchHeatingSchedules = async () => {
				try {
					const response = await axios.get(
						ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST,
					);
					const data = await response.data;
					const templateNames =
						data.length > 0
							? data.map((template) => template.templateName)
							: [];
					setCreatedHeatingScheduleNames(templateNames);
				} catch (error) {
					console.error("Error:", error);
				}
			};

			try {
				const resp = await axios.post(
					ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_FROM_EDIT,
					requestBody,
				);

				if (resp.status >= 400) {
					const errorText = await resp.data; // Get response text for error details
					throw new Error(
						`HTTP error! Status: ${resp.status}, Details: ${errorText}`,
					);
				}

				const respData = await resp.data;
				if (respData.active) {
					handleOpenModal();
					// updateReplaced();
					resetModalState();
					setIsSuccess(true);
					setToastMessage(errors.heatingScheduleEditedSuccessfull);
					setShowToast(true);
					// if (room) {
					// 	fetchFloorDetails(room.parentId);
					// }
					setTimeout(() => {
						setShowToast(false);
					}, 3000);
					handleCloseModal();
					fetchHeatingSchedules();
				} else {
					setIsSuccess(false);
					setToastMessage(errors.heatingScheduleEditedFailed);
					setShowToast(true);
					setTimeout(() => {
						setShowToast(false);
					}, 3000);
				}
			} catch (error) {
				console.error("Error during fetch operation:", error);
			}
		}
	};

	const resetModalState = () => {
		setCurrentStep(1);
		setFormData({
			programName: "",
			childSafety: "",
			minTemp: "",
			maxTemp: "",
			applyAlgorithm: "Yes",
		});
		setErrorMessages({
			programName: "",
			childSafety: "",
			minTemp: "",
			maxTemp: "",
			applyAlgorithm: "",
		});
		setGeneralErrorMessage(null);
		setFormSubmitted(false);
		setLayouts({});
		setFinalScheduleData({});
		setSelectedAction("");
	};

	const handleCheckName = () => {
		const fetchHeatingSchedules = async () => {
			try {
				const response = await axios.get(
					ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST,
				);
				const data = await response.data;
				const templateNames =
					data.length > 0 ? data.map((template) => template.templateName) : [];
				setCreatedHeatingScheduleNames(templateNames);
			} catch (error) {
				console.error("Error:", error);
			}
		};
		fetchHeatingSchedules();
		const exists =
			createdHeatingScheduleNames &&
			createdHeatingScheduleNames.includes(formData.programName);
		if (exists) {
			setErrorMessages((prev) => ({
				...prev,
				programName: errors.ProgramWithNameAlreadyCreated,
			}));
		}
	};

	return (
		<>
			<Modal
				theme={customTheme}
				size={"6xl"}
				show={openModal}
				onClose={handleCloseModal}
			>
				{room && (
					<>
						<Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
							Heizplan zuweisen - {room.name}
						</Modal.Header>
						<Modal.Body className="p-5 overflow-y-auto h-auto">
							<div className="w-full flex flex-col justify-center items-start">
								<p>Heizplan auswählen</p>
								{/* <p className="font-semibold mt-3 ">Select action</p> */}
								{/* <div className="w-full flex mt-2 gap-4 flex-row justify-start items-center">
									<div
										onClick={() => handleActionChange("edit-room")}
										className="flex cursor-pointer flex-row justify-center items-center gap-2"
									>
										<Radio
											id="edit-room"
											name="action"
											value="edit-room"
											checked={selectedAction === "edit-room"}
											className=" cursor-pointer"
											// onChange={handleActionChange}
										/>
										<Label className=" cursor-pointer" htmlFor="edit-room">
											Edit room heating schedule
										</Label>
									</div>
									<div
										onClick={() => handleActionChange("replace-room")}
										className="flex cursor-pointer flex-row justify-center items-center gap-2"
									>
										<Radio
											id="replace-room"
											name="action"
											value="replace-room"
											checked={selectedAction === "replace-room"}
											className=" cursor-pointer"
											// onChange={handleActionChange}
										/>
										<Label className=" cursor-pointer" htmlFor="replace-room">
											Replace program
										</Label>
									</div>
								</div> */}

								<div className="w-full flex flex-col  mb-3 justify-center items-center">
									{/* {selectedAction === "edit-room" ? (
										<div className="flex flex-col items-center space-y-6 w-full">
											<ProgressStepper
												currentStep={currentStep}
												editMode={true}
											/>
											<div className="w-full">
												{currentStep === 1 && (
													<div>
														<GeneralInformation
															formData={formData}
															handleChange={handleChange}
															errorMessages={errorMessages}
															generalErrorMessage={generalErrorMessage} // Pass general error message to Form1
															checkName={handleCheckName}
														/>
													</div>
												)}
												{currentStep === 2 && (
													<div>
														<HeatingSchedule
															onUpdateLayouts={handleLayoutUpdate}
															onUpdateCheck={handleCheckUpdate}
															setHandleCheckRef={(func) =>
																(handleCheckRef.current = func)
															}
															handlePrev={handlePrevious}
															finalScheduleData={finalScheduleData}
															clone={true}
															staticTemp={true}
															locationDetails={locationDetails}
														/>
													</div>
												)}
											</div>
										</div>
									) : (
										selectedAction === "replace-room" && ( */}
									<ReplaceProgram
										selectedProgram={selectedProgram}
										handleProgramChange={handleProgramChange}
										showError={showError}
										room={room}
									/>
									{/* )
									)} */}
								</div>

								{selectedProgram && (
									<ViewTableComponent selectedProgram={selectedProgram} />
								)}
							</div>
						</Modal.Body>

						<Modal.Footer>
							{selectedAction === "edit-room" ? (
								currentStep < 2 ? (
									<Button className="bg-primary" onClick={handleNext}>
										Weiter
									</Button>
								) : (
									<Button className="bg-primary" onClick={handleCreate}>
										Speichern
									</Button>
								)
							) : (
								<Button className="bg-primary" onClick={handleDone}>
									Fertig
								</Button>
							)}
							<Button
								className="font-black"
								color="gray"
								onClick={handleCloseModal}
							>
								Schließen
							</Button>
						</Modal.Footer>
					</>
				)}
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

			<ConfirmReplaceModal
				show={showConfirmModal}
				onClose={handleCancelReplace}
				onConfirm={handleConfirmReplace}
			/>
		</>
	);
};

const ReplaceProgram = ({
	selectedProgram,
	handleProgramChange,
	showError,
	room,
}) => {
	const [data, setData] = useState([]);

	const fetchAll = () => {
		axios
			.get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST)
			.then((response) => response.data)
			.then((data) => {
				setData(data);
				// console.log("schedule programs", data);
				// setLoader(false);
			})
			.catch((error) => console.error("Error:", error));
	};

	useEffect(() => {
		fetchAll();
	}, []);

	return (
		<div className="w-full flex flex-col md:flex-row justify-start items-start md:items-center gap-4">
			<div className="flex flex-col justify-start items-start w-full md:w-1/3">
				<label
					htmlFor="program"
					value="Program"
					className={`mb-2 text-sm pt-3 font-semibold ${
						showError ? "text-red-500" : "text-gray-700"
					}`}
				>
					{" "}
				</label>
				<select
					id="program"
					required
					className={` mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm`}
					value={selectedProgram}
					onChange={handleProgramChange}
				>
					<option value="">Heizplan auswählen</option>
					{data.map((program) => (
						<option
							// className={`block rounded-lg px-4 py-2 text-sm ${
							// 	program.id === room.heatingSchedule.id
							// 		? "bg-gray-100 text-gray-400 cursor-not-allowed"
							// 		: "hover:bg-blue-100 hover:text-blue-700"
							// }`}
							key={program.id}
							value={program.id}
							// disabled={program.id === room.heatingSchedule.id}
						>
							{program.templateName.length > 50
								? `${program.templateName.slice(0, 50)}...`
								: program.templateName}
						</option>
					))}
				</select>

				{showError && (
					<p className="text-red-500 text-sm mt-1">
						Ein Programm muss ausgewählt werden.
					</p>
				)}
			</div>
			{/* <div className="flex flex-col justify-start items-start w-full md:w-2/3">
				<div className="mb-2 flex items-center gap-2">
					<Label
						className="text-sm font-semibold text-gray-700"
						htmlFor="apply-algorithm"
						value="Algorithmus aktivieren"
					/>
					<Tooltip
						className="px-3 py-1.5 text-center max-w-96"
						content="TDer Algorithmus passt dynamisch den Heizplan an."
						style="light"
					>
						<IoInformationCircleOutline color="#6B7280" className="w-5 h-5" />
					</Tooltip>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Radio
								id="applyAlgorithmYes"
								name="applyAlgorithm"
								value="Yes"
								required
							/>
							<Label
								className="text-sm text-gray-900"
								htmlFor="applyAlgorithmYes"
							>
								Ja
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<Radio
								id="applyAlgorithmNo"
								name="applyAlgorithm"
								value="No"
								required
							/>
							<Label
								className="text-sm text-gray-900"
								htmlFor="applyAlgorithmNo"
							>
								Nein
							</Label>
						</div>
					</div>
				</div>
			</div> */}
		</div>
	);
};

const ViewTableComponent = ({ selectedProgram }) => {
	// Destructure selectedProgram from props
	const [temperatureDetails, setTemperatureDetails] = useState(null);
	const heatingScheduleId = selectedProgram;

	const fetchDetails = () => {
		if (!heatingScheduleId) return;

		axios
			.get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(heatingScheduleId))

			.then((response) => {
				if (response.status >= 400) {
					throw new Error("Network response was not ok");
				}
				return response.data;
			})
			.then((data) => {
				setTemperatureDetails(data);
				// console.log("location details", data);
			})
			.catch((error) => console.error("Error:", error));
	};

	useEffect(() => {
		fetchDetails();
	}, [heatingScheduleId]);

	return (
		<div className="p-5 w-full">
			<div className="flex w-full items-start">
				<div className="w-[25%] flex flex-col gap-4">
					<h3 className="text-[16px] text-gray-500 font-semibold">
						Einstellungen
					</h3>
					<div className="flex flex-col gap-2 text-sm text-gray-900 font-normal">
						<div className="flex flex-col gap-2">
							<p className="font-semibold">Name des Heizplans</p>
							<p>{temperatureDetails?.templateName || "N/A"}</p>{" "}
							{/* Replace hardcoded value */}
						</div>
						<div className="flex flex-col gap-2">
							<p className="font-semibold">Kindersicherung</p>
							<p>{temperatureDetails?.allowDeviceOverride ? "Aus" : "An"}</p>{" "}
							{/* Replace hardcoded value */}
						</div>
						{temperatureDetails?.allowDeviceOverride && (
							<>
								<div className="flex flex-col gap-2">
									<p className="font-semibold flex items-center gap-1">
										Mindesttemperatur
										<Tooltip
											className="px-3 py-1.5 text-center max-w-96"
											content="Die Mindesttemperatur, die am Thermostat manuell eingestellt werden kann."
											style="light"
										>
											<IoInformationCircleOutline color="#6B7280" />
										</Tooltip>
									</p>
									<p>
										{temperatureDetails?.deviceOverrideTemperatureMin || "N/A"}
										°C
									</p>{" "}
									{/* Replace hardcoded value */}
								</div>
								<div className="flex flex-col gap-2">
									<p className="font-semibold flex items-center gap-1">
										Höchsttemperatur
										<Tooltip
											className="px-3 py-1.5 text-center max-w-96"
											content="Die Höchsttemperatur, die am Thermostat manuell eingestellt werden kann."
											style="light"
										>
											<IoInformationCircleOutline color="#6B7280" />
										</Tooltip>
									</p>
									<p>
										{temperatureDetails?.deviceOverrideTemperatureMax || "N/A"}
										°C
									</p>{" "}
									{/* Replace hardcoded value */}
								</div>
							</>
						)}

						<div className="flex flex-col gap-2">
							<p className="font-semibold flex items-center gap-1">
								Algorithmus aktivieren
								<Tooltip
									className="px-3 py-1.5 text-center max-w-96"
									content="Der Algorithmus passt dynamisch den Heizplan an."
									style="light"
								>
									<IoInformationCircleOutline color="#6B7280" />
								</Tooltip>
							</p>
							<p>{temperatureDetails?.applyAlgorithm ? "Ja" : "Nein"}</p>{" "}
							{/* Replace hardcoded value */}
						</div>
					</div>
				</div>
				<div className="w-[75%] border-l flex flex-col gap-4 border-gray-200 pl-4">
					<div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
						{/* {console.log("temp", temperatureDetails)} */}
						{temperatureDetails && (
							<HeatingScheduleTable locationDetails={temperatureDetails} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const ConfirmReplaceModal = ({ show, onClose, onConfirm }) => {
	return (
		<Modal show={show} onClose={onClose} size="lg">
			<Modal.Header className="flex justify-between items-center">
				<span className="text-lg font-semibold text-gray-900">
					Zuweisung des Programms bestätigen
				</span>
				<button
					onClick={onClose}
					className="text-gray-600 hover:text-gray-900"
				></button>
			</Modal.Header>
			<Modal.Body className="text-[#6B7280]">
				<p>
					Das Zuweisen eines Programms wird alle Informationen des vorherigen
					Programms entfernen.
				</p>
				<p className="mt-2">Sind Sie sicher, dass Sie fortfahren möchten?</p>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={onConfirm} className="bg-primary">
					Ja
				</Button>
				<Button color="gray" onClick={onClose}>
					Abbrechen
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default AssignProgramModal;
