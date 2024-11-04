/* eslint-disable no-inner-declarations */
import { Button, Modal } from "flowbite-react";
import customTheme from "./ModalTheme";
import { useEffect, useRef, useState } from "react";
import ProgressStepper from "./components/ProgressStepper";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import GeneralInformation from "./Steps/GeneralInformation/GeneralInformation";
import ProgramAssignment from "./Steps/ProgramAssignment/ProgramAssignment";
import HeatingSchedule from "./Steps/HeatingSchedule/HeatingSchedule";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule.jsx";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";
import validateFormData from "../../../../shared/helper/ValidateFormData.js";
import validateFieldHelper from "../../../../shared/helper/ValidateFieldHelper.js";
import validateTemperatureHelper from "../../../../shared/helper/ValidateTemperatureHelper.js";
import handleFormChangeHelper from "../../../../shared/helper/FormChangeValidationCheckHelper.js";
import validateAndSubmit from "../../../../shared/helper/HandleSubmitHelper.js";
import { handleCreateHelper } from "../../../../shared/helper/handleCreateHelper.js";
import handleCheckNameHelper from "../../../../shared/helper/HandleCheckNameHelper.js";
import { processLocationData } from "../../../../shared/helper/ProcessLocationData.js";

export function CreateHeatingModal({ openModal, handleOpenModal, onCreate }) {
	const { generateToast } = useToast();
	const [currentStep, setCurrentStep] = useState(1);

	const [formData, setFormData] = useState({
		programName: "",
		childSafety: "",
		minTemp: "",
		maxTemp: "",
		applyAlgorithm: "Yes",
	});

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
			const { allFieldsFilled, errors: newErrors } = validateFormData(
				formData,
				errors,
			);

			if (!allFieldsFilled) {
				setGeneralErrorMessage(errors.allFieldsRequired);
			} else {
				setGeneralErrorMessage("");
			}

			if (Object.keys(newErrors).length > 0 || !allFieldsFilled) {
				setErrorMessages(newErrors);
			} else {
				setErrorMessages({});
			}
		}
	}, [formSubmitted, formData]);

	useEffect(() => {
		validateTemperatureHelper(formData, setErrorMessages, errors, "create");
	}, [formData]);

	const handleChange = (e) => {
		const formDataApi = "";
		handleFormChangeHelper(
			e,
			formData,
			setFormData,
			formDataApi,
			validateFieldHelper,
			setErrorMessages,
			errors,
			setGeneralErrorMessage,
			"create",
		);
	};

	const handleSubmit = () => {
		// return true;
		const program = "";
		const valid = validateAndSubmit(
			formData,
			program,
			errors,
			setCreatedHeatingScheduleNames,
			setErrorMessages,
			handleCheckName,
			setFormSubmitted,
			createdHeatingScheduleNames,
			ApiUrls,
			"create",
		);

		if (!valid) {
			return false; // Form is invalid
		}

		// Proceed with form submission or other logic
		return true; // Form is valid
	};

	// For getting data from heating program assignment
	const [heatingAssignmentData, setHeatingAssignmentData] = useState({});

	const handleAssignmentData = (assignmentData) => {
		setHeatingAssignmentData(assignmentData);
	};

	const [layouts, setLayouts] = useState({}); // State to hold layouts
	const [finalScheduleData, setFinalScheduleData] = useState({});

	const handleCheckRef = useRef(null); // Ref to hold handleCheck function
	const handleAssignmentRef = useRef(null); // Ref to hold handleCheck function
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
		if (currentStep === 2) {
			if (handleCheckRef.current) {
				handleCheckRef.current();
			}
			setFinalScheduleData(layoutsRef.current);
			setCurrentStep((prev) => Math.max(prev - 1, 0));
		} else if (currentStep === 3) {
			setCurrentStep((prev) => Math.max(prev - 1, 0));
		}
	};

	const handleNext = () => {
		if (currentStep === 1) {
			if (handleSubmit()) {
				setCurrentStep((prev) => Math.min(prev + 1, 3));
			}
		} else if (currentStep === 2) {
			// Trigger the handleCheck function in the child component
			if (handleCheckRef.current) {
				handleCheckRef.current();
			}

			// console.log(newCheck, 'whennext');
			if (newCheck !== null && !newCheck) {
				setCurrentStep((prev) => Math.min(prev + 1, 3));
				setFinalScheduleData(layoutsRef.current);
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
		if (formData && heatingAssignmentData && finalScheduleData) {
			setCombinedData({
				formData,
				heatingAssignmentData,
				finalScheduleData,
			});
		}
	}, [formData, heatingAssignmentData, finalScheduleData]);

	const [buttonText, setButtonText] = useState("Create");
	const handleCloseModal = () => {
		resetModalState();
		handleOpenModal();
	};

	const handleCreate = () => {
		handleCreateHelper(
			combinedData,
			daysOfWeek,
			ApiUrls,
			errors,
			generateToast,
			resetModalState,
			onCreate,
			handleOpenModal,
			handleAssignmentRef,
			heatingAssignmentData,
			handleAssignmentData,
			"create",
			handleCloseModal,
		);
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
		setHeatingAssignmentData({});
		setLayouts({});
		setFinalScheduleData({});
		setButtonText("Erstellen");
	};

	const [initialData, setInitialData] = useState({});

	useEffect(() => {
		axios
			.get(ApiUrls.SMARTHEATING_LOCATIONS.LOCATIONS(true, true, true, true))
			.then((response) => response.data)
			.then((data) => {
				const apiData = processLocationData(data); // Call the helper function
				setInitialData(apiData);
			})
			.catch((error) => console.error("Error:", error));
	}, []);
	const { createdHeatingScheduleNames, setCreatedHeatingScheduleNames } =
		useHeatingSchedule();
	const handleCheckName = async () => {
		handleCheckNameHelper(
			ApiUrls,
			setCreatedHeatingScheduleNames,
			formData,
			"program",
			setErrorMessages,
			errors,
			"clone",
		);
	};

	return (
		<>
			<Modal
				theme={customTheme}
				size={currentStep === 2 ? "7xl" : "5xl"}
				dismissible
				show={openModal}
				onClose={handleCloseModal}
				className="z-40"
			>
				<Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
					Heizplan erstellen
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col items-center space-y-6">
						<ProgressStepper currentStep={currentStep} />
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
									/>
								</div>
							)}
							{currentStep === 3 && (
								<div>
									<ProgramAssignment
										formData={formData}
										setHandleAssignmentRef={(func) =>
											(handleAssignmentRef.current = func)
										}
										assignmentData={handleAssignmentData}
										handlePrev={handlePrevious}
										heatingData={heatingAssignmentData}
										initialData={initialData}
									/>
								</div>
							)}
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					{currentStep < 3 ? (
						<Button className="bg-primary" onClick={handleNext}>
							Weiter
						</Button>
					) : (
						<Button
							className={` ${
								buttonText === "Confirm"
									? "bg-green-400 focus:ring-green-400 focus:bg-green-400 hover:bg-green-400 enabled:hover:bg-green-400"
									: "bg-primary"
							}`}
							onClick={handleCreate}
						>
							{buttonText}
						</Button>
					)}
					<Button
						className="font-black"
						color="gray"
						onClick={handleCloseModal}
					>
						Abbrechen
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
