/* eslint-disable react/prop-types */
// Parent Component
import { Button, Modal } from "flowbite-react";
import customTheme from "./ModalTheme";
import { useEffect, useRef, useState } from "react";
import ProgressStepper from "./components/ProgressStepper";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import GeneralInformation from "./Steps/GeneralInformation/GeneralInformation";
import ProgramAssignment from "./Steps/ProgramAssignment/ProgramAssignment";
import HeatingSchedule from "./Steps/HeatingSchedule/HeatingSchedule";

export function CreateHeatingModal({ openModal, handleOpenModal, onCreate }) {
  
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    programName: "",
    childSafety: "",
    minTemp: "",
    maxTemp: "",
    applyAlgorithm: "",
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
      const allFieldsFilled = Object.values(formData).every((field) => field !== '');
      if (!allFieldsFilled) {
        setGeneralErrorMessage(errors.allFieldsRequired);
      } else {
        setGeneralErrorMessage('');
      }

      const newErrors = {};

      // Check for empty fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] === '') {
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
      if (id === "minTemp") {
        const minTemp = parseFloat(value);
        if (isNaN(minTemp) || minTemp < 10 || minTemp > 29) {
          error = errors.minTempInvalid;
        } else if (formData.maxTemp && minTemp >= parseFloat(formData.maxTemp)) {
          error = errors.maxTempLowerThanMinTemp;
        }
      }
      if (id === "maxTemp") {
        const maxTemp = parseFloat(value);
        if (isNaN(maxTemp) || maxTemp < 11 || maxTemp > 30) {
          error = errors.maxTempInvalid;
        } else if (formData.minTemp && maxTemp <= parseFloat(formData.minTemp)) {
          error = errors.maxTempLowerThanMinTemp;
        }
      }
    }

    setErrorMessages((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    validateField(id, value);

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

      // Validate layouts for all days
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const allNonEmpty = days.every(day => (day in layoutsRef.current) && layoutsRef.current[day].length > 0);
      if (allNonEmpty) {
        setFinalScheduleData(layoutsRef.current);
        setCurrentStep((prev) => Math.min(prev + 1, 3));
      } else {
        console.log('All layouts are empty. Please fill in the required information.');
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
    // console.log(combinedData);
  }, [formData, heatingAssignmentData, finalScheduleData]);

  // const programAssignmentRef = useRef();
  const [buttonText, setButtonText] = useState('Create');

  const handleCreate = () => {
    if (buttonText === 'Create') {
      if (handleAssignmentRef.current) {
        handleAssignmentRef.current();

        const anyRoomSelected = heatingAssignmentData.buildings.some(building =>
          building.floors.some(floor =>
            floor.rooms.some(room => room.assigned)
          )
        );

        if (!anyRoomSelected) {
          setButtonText('Confirm');
        } else {
          handleAssignmentData();
          onCreate(combinedData);
          handleOpenModal();
          resetModalState();
          // Submit the form or perform other actions
        }
      } else {
        console.error('handleAssignmentRef.current is not defined');
      }
    } else {
      // Confirm button clicked
      handleAssignmentData();
      onCreate(combinedData);
      handleOpenModal();
      setButtonText('Create');
      resetModalState();
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
    setHeatingAssignmentData({});
    setLayouts({});
    setFinalScheduleData({});
    setButtonText('Create');
  };

  const handleCloseModal = () => {
    resetModalState();
    handleOpenModal();
  };

  
  

  return (
    <>
      <Modal theme={customTheme} size={currentStep === 2 ? "7xl" : "5xl"} dismissible show={openModal} onClose={handleCloseModal}>
        <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">Create heating program</Modal.Header>
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
                  />
                </div>
              )}
              {currentStep === 2 && (
                <div>
                  <HeatingSchedule
                    onUpdateLayouts={handleLayoutUpdate}
                    setHandleCheckRef={(func) => handleCheckRef.current = func}
                    handlePrev={handlePrevious}
                    finalScheduleData={finalScheduleData}
                  />
                </div>
              )}
              {currentStep === 3 && (
                <div>
                  <ProgramAssignment
                    formData={formData}
                    setHandleAssignmentRef={(func) => handleAssignmentRef.current = func}
                    assignmentData={handleAssignmentData}
                    handlePrev={handlePrevious}
                    heatingData={heatingAssignmentData}
                  />
                </div>
              )}
            </div>

          </div>
        </Modal.Body>
        <Modal.Footer>
          {currentStep < 3 ? (
            <Button className="bg-primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button className={` ${buttonText === 'Confirm' ? 'bg-green-400 focus:ring-green-400 focus:bg-green-400 hover:bg-green-400 enabled:hover:bg-green-400':'bg-primary'}`} onClick={handleCreate}>{buttonText}</Button>
          )}
          <Button className="font-black" color="gray" onClick={handleCloseModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
