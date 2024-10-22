import { Button, Modal } from "flowbite-react";
import customTheme from "../CreateHeating/ModalTheme";
import { useEffect, useRef, useState } from "react";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../CreateHeating/components/ProgressStepper";
import GeneralInformation from "../CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import ProgramAssignment from "../CreateHeating/Steps/ProgramAssignment/ProgramAssignment";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import useHeatingSchedule from "../../../../hooks/useHeatingSchedule.jsx";
import { daysOfWeek } from "../../../../globals/daysofWeek.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";
import setFormDataHelper from "../../../../shared/helper/formDataHelper.js";
import validateFormData from "../../../../shared/helper/ValidateFormData.js";
import validateFieldHelper from "../../../../shared/helper/ValidateFieldHelper.js";
import validateTemperatureHelper from "../../../../shared/helper/ValidateTemperatureHelper.js";
import handleFormChangeHelper from "../../../../shared/helper/FormChangeValidationCheckHelper.js";
import validateAndSubmit from "../../../../shared/helper/HandleSubmitHelper.js";
import { handleCreateHelper } from "../../../../shared/helper/handleCreateHelper.js";
import handleCheckNameHelper from "../../../../shared/helper/HandleCheckNameHelper.js";
import { processLocationData } from "../../../../shared/helper/ProcessLocationData.js";

export function CloneHeatingModal({
	openCloneModal,
	handleCloneModal,
	onCreate,
	program,
	locationDetails,
}) {
	const { generateToast } = useToast();
	const [currentStep, setCurrentStep] = useState(1);
	const [formDataApi, setFormDataApi] = useState();
	const [formData, setFormData] = useState({
		programName: "",
		childSafety: "",
		minTemp: "",
		maxTemp: "",
		applyAlgorithm: "Yes",
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
	const component = "clone";
	const [generalErrorMessage, setGeneralErrorMessage] = useState(null); // State for general error message
	const [formSubmitted, setFormSubmitted] = useState(false);

	useEffect(() => {
		if (openCloneModal) {
			const formData = setFormDataHelper(program, component); // No clone, so isClone is false or omitted
			setFormData(formData);
			setFormDataApi(program);
		}
	}, [openCloneModal, program]);

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
		validateTemperatureHelper(formData, setErrorMessages, errors, "clone");
	}, [formData]);

	const handleChange = (e) => {
		handleFormChangeHelper(
			e,
			formData,
			setFormData,
			formDataApi,
			validateFieldHelper,
			setErrorMessages,
			errors,
			setGeneralErrorMessage,
			"clone",
		);
	};

	const handleSubmit = () => {
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
			"clone",
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
		newCheck = updatedCheck;
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
		} else if (currentStep === 2) {
			// Trigger the handleCheck function in the child component
			if (handleCheckRef.current) {
				handleCheckRef.current();
			}

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
		handleCloneModal();
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
			"handleOpenModal",
			handleAssignmentRef,
			heatingAssignmentData,
			handleAssignmentData,
			"clone",
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
		setButtonText("Create");
	};

	const handleCheckName = async () => {
		handleCheckNameHelper(
			ApiUrls,
			setCreatedHeatingScheduleNames,
			formData,
			program,
			setErrorMessages,
			errors,
			"clone",
		);
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
	return (
		<>
			<Modal
				theme={customTheme}
				size={currentStep === 2 ? "7xl" : "5xl"}
				dismissible
				show={openCloneModal}
				onClose={handleCloseModal}
			>
				<Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
					Heizplan duplizieren: {program.templateName}
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
										clone={true}
										locationDetails={locationDetails}
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
										clone={false}
										program={program}
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
								buttonText === "Bestätigen"
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
