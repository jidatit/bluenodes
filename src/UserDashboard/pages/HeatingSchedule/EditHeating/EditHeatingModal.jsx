/* eslint-disable react/prop-types */
// Parent Component
import { Button, Modal } from "flowbite-react";
import customTheme from "../CreateHeating/ModalTheme";
import { useEffect, useRef, useState } from "react";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../CreateHeating/components/ProgressStepper";
import GeneralInformation from "../CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule";

export function EditHeatingModal({
	openEditModal,
	handleEditModal,
	onEdit,
	program,
	locationDetails,
}) {
	//Set token for bearer authorization
	const token = localStorage.getItem("token");

	const [currentStep, setCurrentStep] = useState(1);
	const [formDataApi, setFormDataApi] = useState();
	const [formData, setFormData] = useState({
		programName: "",
		childSafety: "",
		minTemp: "",
		maxTemp: "",
		applyAlgorithm: "",
	});

	const { createdHeatingScheduleNames, setCreatedHeatingScheduleNames } =
		useHeatingSchedule();

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
		if (openEditModal) {
			setFormData({
				programName: program?.templateName || "",
				childSafety: program?.allowDeviceOverride === true ? "No" : "Yes" || "",
				minTemp: program?.deviceOverrideTemperatureMin + "°C" || "",
				maxTemp: program?.deviceOverrideTemperatureMax + "°C" || "",
				applyAlgorithm: "",
			});
			setFormDataApi(program);
		}
	}, [openEditModal, program]);

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
		// Cross-validate minTemp and maxTemp
		if (minTemp !== "" && maxTemp !== "") {
			if (minTemp >= maxTemp) {
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
				const response = await fetch(
					"https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/list",
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				const data = await response.json();
				const templateNames =
					data.length > 0 ? data.map((template) => template.templateName) : [];
				setCreatedHeatingScheduleNames(templateNames);
			} catch (error) {
				console.error("Error:", error);
			}
		};
		fetchHeatingSchedules();

		const programName = formData.programName;
		const isSameAsTemplateName = program.templateName === programName;

		if (!isSameAsTemplateName) {
			createdHeatingScheduleNames?.forEach((name) => {
				if (programName === name) {
					newErrors.programName = errors.ProgramWithNameAlreadyCreated;
				}
			});
		}

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
		}

		// console.log(formData);
		return true;
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

	// const programAssignmentRef = useRef();

	const handleCreate = () => {
		let scheduleDataTemp = {};

		// Save button clicked
		if (currentStep === 2) {
			// Trigger the handleCheck function in the child component
			if (handleCheckRef.current) {
				handleCheckRef.current();
			}
			if (newCheck !== null && !newCheck) {
				setFinalScheduleData(layoutsRef.current);
				scheduleDataTemp = layoutsRef.current;

				// Convert schedule data into API format
				function convertScheduleData(data) {
					// console.log(data)
					const dayMapping = {
						Monday: 1,
						Tuesday: 2,
						Wednesday: 3,
						Thursday: 4,
						Friday: 5,
						Saturday: 6,
						Sunday: 7,
					};

					const result = { days: [] };

					const normalizeTime = (value) => {
						const hours = Math.floor((value * 24) / 96);
						const minutes = Math.floor(((value * 24 * 60) / 96) % 60);
						return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
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

				//Manipulating for API
				let finalObj = {
					templateName: combinedData.formData.programName,
					allowDeviceOverride:
						combinedData.formData.childSafety === "No" ? true : false,
					days: convertScheduleData(scheduleDataTemp),
				};

				if (combinedData.formData.childSafety !== "Yes") {
					finalObj.deviceOverrideTemperatureMin = parseInt(
						combinedData.formData.minTemp,
					);
					finalObj.deviceOverrideTemperatureMax = parseInt(
						combinedData.formData.maxTemp,
					);
				}
				// console.log(combinedData.finalScheduleData);
				// console.log(JSON.stringify(finalObj));

				// Put to API
				fetch(
					`https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/${program.id}`,
					{
						method: "PUT",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify(finalObj),
					},
				)
					.then((response) => response.json())
					.then((data) => {
						// console.log(data);
						if (data.statusCode === 400) {
							onEdit("Error");
						} else {
							onEdit(combinedData);
							handleEditModal();
							resetModalState();
						}
					})
					.catch((error) => console.error("Error:", error));

				// Save button clicked
				// onEdit(combinedData);
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
			applyAlgorithm: "",
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
	};

	const handleCloseModal = () => {
		resetModalState();
		handleEditModal();
	};

	const handleCheckName = () => {
		const fetchHeatingSchedules = async () => {
			try {
				const response = await fetch(
					"https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/list",
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				const data = await response.json();
				const templateNames =
					data.length > 0 ? data.map((template) => template.templateName) : [];
				setCreatedHeatingScheduleNames(templateNames);
				const nameExistsInCreatedSchedules =
					createdHeatingScheduleNames &&
					createdHeatingScheduleNames.includes(formData.programName);
				const isSameAsTemplateName =
					program.templateName === formData.programName;

				if (!isSameAsTemplateName && nameExistsInCreatedSchedules) {
					setErrorMessages((prev) => ({
						...prev,
						programName: errors.ProgramWithNameAlreadyCreated,
					}));
				} else {
					setErrorMessages((prev) => ({
						...prev,
						programName: "",
					}));
				}
			} catch (error) {
				console.error("Error:", error);
			}
		};
		fetchHeatingSchedules();
	};

	return (
		<>
			<Modal
				theme={customTheme}
				size={currentStep === 2 ? "7xl" : "5xl"}
				dismissible
				show={openEditModal}
				onClose={handleCloseModal}
			>
				<Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
					Edit program - {program.templateName}
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col items-center space-y-6">
						<ProgressStepper currentStep={currentStep} editMode={true} />
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
										locationDetails={locationDetails}
									/>
								</div>
							)}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					{currentStep < 2 ? (
						<Button className="bg-primary" onClick={handleNext}>
							Next
						</Button>
					) : (
						<Button className={` bg-primary`} onClick={handleCreate}>
							Save
						</Button>
					)}
					<Button
						className="font-black"
						color="gray"
						onClick={handleCloseModal}
					>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
