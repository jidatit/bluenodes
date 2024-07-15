/* eslint-disable react/prop-types */
// Parent Component
import { Button, Modal } from "flowbite-react";
import customTheme from "../CreateHeating/ModalTheme";
import { useEffect, useRef, useState } from "react";
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../CreateHeating/components/ProgressStepper";
import GeneralInformation from "../CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import ProgramAssignment from "../CreateHeating/Steps/ProgramAssignment/ProgramAssignment";

export function CloneHeatingModal({ openCloneModal, handleCloneModal, onCreate, program, locationDetails }) {
  
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    programName: program?.templateName + ' - Cloned' || "",
    childSafety: program?.allowDeviceOverride===true?"No":"Yes" || "",
    minTemp: program?.deviceOverrideTemperatureMin + '°C'||"",
    maxTemp: program?.deviceOverrideTemperatureMax + '°C'||"",
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
      const minTemp = id === "minTemp" ? parseFloat(value) : parseFloat(formData.minTemp);
      const maxTemp = id === "maxTemp" ? parseFloat(value) : parseFloat(formData.maxTemp);
  
      if (id === "minTemp") {
        if (isNaN(minTemp) || minTemp < 10 || minTemp > 29) {
          error = errors.minTempInvalid;
        } else if ( maxTemp !== "" && minTemp >= maxTemp) {
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
        console.log(errorMessages)
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

  useEffect(()=>{
    const minTemp =  parseFloat(formData.minTemp);
    const maxTemp =  parseFloat(formData.maxTemp);
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
  },[formData])

  const handleChange = (e) => {
    const { id, value } = e.target;
  
    validateField(id, value);
    
    // Check if the change is from the radio button groups
    if (id === "childSafetyYes" || id === "childSafetyNo") {
      setFormData((prev) => ({
        ...prev,
        childSafety: value,
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
          handleCloneModal();
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
      handleCloneModal();
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
    handleCloneModal();
  };

  return (
    <>
      <Modal theme={customTheme} size={currentStep === 2 ? "7xl" : "5xl"} dismissible show={openCloneModal} onClose={handleCloseModal}>
        <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">Clone heating program</Modal.Header>
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
                    clone={true}
                    locationDetails={locationDetails}
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
