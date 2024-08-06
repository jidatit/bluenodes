/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Button, Modal, Radio, Label, Select, Tooltip } from "flowbite-react";
import { IoInformationCircleOutline } from "react-icons/io5";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import HeatingScheduleTableStatic from "../../HeatingSchedule/components/HeatingScheduleTableStatic";
import { EditRoomHeatingSchedule } from './EditRoomHeatingSchedule';
import { errorMessages as errors } from "../../../../globals/errorMessages"; // Import error messages
import ProgressStepper from "../../HeatingSchedule/CreateHeating/components/ProgressStepper";
import GeneralInformation from "../../HeatingSchedule/CreateHeating/Steps/GeneralInformation/GeneralInformation";
import HeatingSchedule from "../../HeatingSchedule/CreateHeating/Steps/HeatingSchedule/HeatingSchedule";
import { Toast } from "flowbite-react";

const EditHeatingProgramModal = ({ openModal, handleOpenModal, room, fetchRoomDetails }) => {
  // console.log(room)
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showError, setShowError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCloseModal = () => {
    handleOpenModal();
    resetModalState();
  };

  const handleActionChange = (event) => {
    setSelectedAction(event.target.value);
  };

  const handleProgramChange = (event) => {
    setSelectedProgram(event.target.value);
    if (event.target.value === '') {
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  const handleDone = () => {
    if (selectedAction === 'replace-room' && !selectedProgram) {
      setShowError(true);
    } else if (selectedAction === 'replace-room' && selectedProgram) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmReplace = () => {
    // handle the submit action here
    // console.log('Action:', selectedAction);
    // console.log('Selected Program:', selectedProgram);
    setShowConfirmModal(false);
    handleCloseModal();
  };

  const handleCancelReplace = () => {
    setShowConfirmModal(false);
  };

  useEffect(() => {
    if (selectedAction === 'replace-room' && !selectedProgram) {
      setShowError(true);
    }
  }, [selectedAction, selectedProgram]);

  const [currentStep, setCurrentStep] = useState(1);
  const token = localStorage.getItem('token');
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
    applyAlgorithm: "",
  });
  const [locationDetails, setLocationDetails] = useState([])
  const fetchHeatingScheduleForRoom = async (heatingScheduleId) => {
    try {
      const resp = await fetch(`https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/${heatingScheduleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await resp.json();
      // console.log("Haeting", data);
      setLocationDetails(data)
      setFormData(prev => ({
        ...prev,
        programName: data.templateName,
        childSafety: data.allowDeviceOverride ? "Yes" : "No",
        minTemp: data.deviceOverrideTemperatureMin,
        maxTemp: data.deviceOverrideTemperatureMax,
        applyAlgorithm: room.algorithm ? "Yes" : "No",
      }));
    } catch (error) {
      console.error('Error fetching heating schedule:', error);
    }
  };

  useEffect(() => {
    if (room) {
      fetchHeatingScheduleForRoom(room.heatingSchedule?.id);
    }
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
  }, [formData])

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


  const [layouts, setLayouts] = useState({}); // State to hold layouts
  const [finalScheduleData, setFinalScheduleData] = useState({});

  const handleCheckRef = useRef(null); // Ref to hold handleCheck function
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
      "Monday": 1,
      "Tuesday": 2,
      "Wednesday": 3,
      "Thursday": 4,
      "Friday": 5,
      "Saturday": 6,
      "Sunday": 7
    };

    const result = { days: [] };

    const normalizeTime = (value) => {
      const hours = Math.floor(value * 24 / 96);
      const minutes = Math.floor((value * 24 * 60 / 96) % 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    for (const [dayName, entries] of Object.entries(data)) {
      const day = dayMapping[dayName];
      entries.forEach(entry => {
        const from = normalizeTime(entry.y);
        let to = normalizeTime(entry.y + entry.h);
        const targetTemperature = parseInt(entry.temperature, 10);

        if (to === "24:00") {
          to = "23:59"
        }

        result.days.push({
          day,
          from,
          to,
          targetTemperature
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

    // Save button clicked
    // Trigger the handleCheck function in the child component
    if (handleCheckRef.current) {
      handleCheckRef.current();
    }

    // Validate layouts for all days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const allNonEmpty = days.every(day => (day in layoutsRef.current) && layoutsRef.current[day].length > 0);
    if (allNonEmpty) {
      setFinalScheduleData(layoutsRef.current);
      scheduleDataTemp = layoutsRef.current;
      // setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      console.log('All layouts are empty. Please fill in the required information.');
      return; // Exit early if validation fails
    }

    const data = convertScheduleData(scheduleDataTemp);

    const requestBody = {
      templateName: combinedData.formData.programName,
      allowDeviceOverride: combinedData.formData.childSafety == "No" ? true : false,
      locations: [room.id],
      days: data
    };

    if (combinedData.formData.childSafety !== 'Yes') {
      requestBody.deviceOverrideTemperatureMin = parseInt(combinedData.formData.minTemp);
      requestBody.deviceOverrideTemperatureMax = parseInt(combinedData.formData.maxTemp);
    }
console.log(requestBody)
    try {
      const resp = await fetch('https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!resp.ok) {
        const errorText = await resp.text(); // Get response text for error details
        throw new Error(`HTTP error! Status: ${resp.status}, Details: ${errorText}`);
      }

      const respData = await resp.json();
      if (respData.active) {
        handleOpenModal();
        resetModalState();
        setIsSuccess(true);
        setToastMessage(errors.heatingScheduleEditedSuccessfull);
        setShowToast(true);
        fetchRoomDetails(room.id)
        setTimeout(() => {
          setShowToast(false);
        }, 4000);
      }
      else {
        setIsSuccess(false);
        setToastMessage(errors.heatingScheduleEditedFailed);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 4000);
      }
    } catch (error) {
      console.error("Error during fetch operation:", error);
    }
  }

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

  return (
    <>
      <Modal theme={customTheme} size={"6xl"} show={openModal} onClose={handleCloseModal}>
        {room && (
          <>
            <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">Edit - Room {room.id}</Modal.Header>
            <Modal.Body className="p-5 overflow-y-auto h-auto">
              <div className='w-full flex flex-col justify-center items-start'>
                <p>Edit room</p>
                <p className='font-semibold mt-3'>Select action</p>
                <div className='w-full flex mt-2 gap-4 flex-row justify-start items-center'>
                  <div className='flex flex-row justify-center items-center gap-2'>
                    <Radio
                      id="edit-room"
                      name="action"
                      value="edit-room"
                      checked={selectedAction === 'edit-room'}
                      onChange={handleActionChange}
                    />
                    <Label htmlFor="edit-room">Edit room heating schedule</Label>
                  </div>
                  <div className='flex flex-row justify-center items-center gap-2'>
                    <Radio
                      id="replace-room"
                      name="action"
                      value="replace-room"
                      checked={selectedAction === 'replace-room'}
                      onChange={handleActionChange}
                    />
                    <Label htmlFor="replace-room">Replace program</Label>
                  </div>
                </div>

                <div className='w-full flex flex-col mt-3 mb-3 justify-center items-center'>
                  {selectedAction === 'edit-room' ? (
                    <div className="flex flex-col items-center space-y-6 w-full">
                      <ProgressStepper currentStep={currentStep} editMode={true} />
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
                              staticTemp={true}
                              locationDetails={locationDetails}
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (selectedAction === 'replace-room' && (
                    <ReplaceProgram
                      selectedProgram={selectedProgram}
                      handleProgramChange={handleProgramChange}
                      showError={showError}
                    />
                  )
                  )}
                </div>

                {selectedAction === 'replace-room' && selectedProgram && (
                  <ViewTableComponent />
                )}
              </div>
            </Modal.Body>

            <Modal.Footer>
              {selectedAction === 'edit-room' ? (
                currentStep < 2 ? (
                  <Button className="bg-primary" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button className="bg-primary" onClick={handleCreate}>
                    Save
                  </Button>
                )
              ) : (
                <Button className="bg-primary" onClick={handleDone}>
                  Done
                </Button>
              )}
              <Button className="font-black" color="gray" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <ConfirmReplaceModal
        show={showConfirmModal}
        onClose={handleCancelReplace}
        onConfirm={handleConfirmReplace}
      />

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

    </>
  );
};


const ReplaceProgram = ({ selectedProgram, handleProgramChange, showError }) => {
  return (
    <div className='w-full flex flex-col md:flex-row justify-start items-start md:items-center gap-4'>
      <div className='flex flex-col justify-start items-start w-full md:w-1/3'>
        <Label htmlFor="program" value="Program" className={`mb-2 text-sm font-semibold ${showError ? "text-red-500" : "text-gray-700"}`} />
        <Select
          id="program"
          required
          className={`w-full ${showError ? 'border-red-500 bg-red-100 text-red-700' : ''}`}
          value={selectedProgram}
          onChange={handleProgramChange}
        >
          <option value="">Select a program</option>
          <option value="p1">Program 1</option>
          <option value="p2">Program 2</option>
          <option value="p3">Program 3</option>
          <option value="p4">Program 4</option>
          <option value="p5">Program 5</option>
        </Select>
        {showError && <p className="text-red-500 text-sm mt-1">A program has to be selected</p>}
      </div>
      <div className='flex flex-col justify-start items-start w-full md:w-2/3'>
        <div className="mb-2 flex items-center gap-2">
          <Label className="text-sm font-semibold text-gray-700" htmlFor="apply-algorithm" value="Apply algorithm?" />
          <Tooltip
            className="px-3 py-1.5 text-center max-w-96"
            content="The minimum temperature that can be manually adjusted on the thermometer by physical means."
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
              <Label className="text-sm text-gray-900" htmlFor="applyAlgorithmYes">Yes</Label>
            </div>
            <div className="flex items-center gap-2">
              <Radio
                id="applyAlgorithmNo"
                name="applyAlgorithm"
                value="No"
                required
              />
              <Label className="text-sm text-gray-900" htmlFor="applyAlgorithmNo">No</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewTableComponent = () => {

  const dummyData = {
    formData: {
      programName: "program test 1",
      childSafety: "Yes",
      minTemp: "20",
      maxTemp: "21",
      applyAlgorithm: "Yes"
    },
    heatingAssignmentData: {
      buildings: [
        {
          id: "building-a",
          name: "Building A",
          roomsAssigned: 7,
          totalRooms: 15,
          floors: [
            {
              id: "floor-1",
              name: "Floor 1",
              roomsAssigned: 5,
              totalRooms: 5,
              rooms: [
                {
                  id: "room-123",
                  name: "Room 123",
                  type: "Room type name",
                  algorithmOn: "Yes",
                  programAssigned: "program test 1",
                  currentTemperature: "20°C",
                  assigned: true
                },
                {
                  id: "room-234",
                  name: "Room 234",
                  type: "Room type name",
                  algorithmOn: "Yes",
                  programAssigned: "program test 1",
                  currentTemperature: "20°C",
                  assigned: true
                },
                {
                  id: "room-345",
                  name: "Room 345",
                  type: "Room type name",
                  algorithmOn: "Yes",
                  programAssigned: "program test 1",
                  currentTemperature: "20°C",
                  assigned: true
                },
                {
                  id: "room-456",
                  name: "Room 456",
                  type: "Room type name",
                  algorithmOn: "Yes",
                  programAssigned: "program test 1",
                  currentTemperature: "20°C",
                  assigned: true
                },
                {
                  id: "room-567",
                  name: "Room 567",
                  type: "Room type name",
                  algorithmOn: "Yes",
                  programAssigned: "program test 1",
                  currentTemperature: "20°C",
                  assigned: true
                }
              ]
            },
            {
              id: "floor-2",
              name: "Floor 2",
              roomsAssigned: 2,
              totalRooms: 5,
              rooms: [
                {
                  id: "room-123",
                  name: "Room 123",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-234",
                  name: "Room 234",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-345",
                  name: "Room 345",
                  type: "Room type name",
                  algorithmOn: "Yes",
                  programAssigned: "program test 1",
                  currentTemperature: "20°C",
                  assigned: true
                },
                {
                  id: "room-456",
                  name: "Room 456",
                  type: "Room type name",
                  algorithmOn: "Yes",
                  programAssigned: "program test 1",
                  currentTemperature: "20°C",
                  assigned: true
                },
                {
                  id: "room-567",
                  name: "Room 567",
                  type: "Room type name",
                  algorithmOn: true,
                  programAssigned: "Program 1",
                  currentTemperature: "20°C",
                  assigned: false
                }
              ]
            },
            {
              id: "floor-3",
              name: "Floor 3",
              roomsAssigned: 0,
              totalRooms: 5,
              rooms: [
                {
                  id: "room-123",
                  name: "Room 123",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-234",
                  name: "Room 234",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-345",
                  name: "Room 345",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-456",
                  name: "Room 456",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-567",
                  name: "Room 567",
                  type: "Room type name",
                  algorithmOn: true,
                  programAssigned: "Program 1",
                  currentTemperature: "20°C",
                  assigned: false
                }
              ]
            }
          ]
        },
        {
          id: "building-b",
          name: "Building B",
          roomsAssigned: 0,
          totalRooms: 15,
          floors: [
            {
              id: "floor-1",
              name: "Floor 1",
              roomsAssigned: 0,
              totalRooms: 5,
              rooms: [
                {
                  id: "room-123",
                  name: "Room 123",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-234",
                  name: "Room 234",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-345",
                  name: "Room 345",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-456",
                  name: "Room 456",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-567",
                  name: "Room 567",
                  type: "Room type name",
                  algorithmOn: true,
                  programAssigned: "Program 1",
                  currentTemperature: "20°C",
                  assigned: false
                }
              ]
            },
            {
              id: "floor-2",
              name: "Floor 2",
              roomsAssigned: 0,
              totalRooms: 5,
              rooms: [
                {
                  id: "room-123",
                  name: "Room 123",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-234",
                  name: "Room 234",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-345",
                  name: "Room 345",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-456",
                  name: "Room 456",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-567",
                  name: "Room 567",
                  type: "Room type name",
                  algorithmOn: true,
                  programAssigned: "Program 1",
                  currentTemperature: "20°C",
                  assigned: false
                }
              ]
            },
            {
              id: "floor-3",
              name: "Floor 3",
              roomsAssigned: 0,
              totalRooms: 5,
              rooms: [
                {
                  id: "room-123",
                  name: "Room 123",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-234",
                  name: "Room 234",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-345",
                  name: "Room 345",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-456",
                  name: "Room 456",
                  type: "Room type name",
                  algorithmOn: false,
                  programAssigned: null,
                  currentTemperature: "20°C",
                  assigned: false
                },
                {
                  id: "room-567",
                  name: "Room 567",
                  type: "Room type name",
                  algorithmOn: true,
                  programAssigned: "Program 1",
                  currentTemperature: "20°C",
                  assigned: false
                }
              ]
            }
          ]
        }
      ]
    }
  };

  return (
    <>
      <div className="p-5 w-full">
        <div className="flex w-full items-start">
          <div className="w-[25%] flex flex-col gap-4">
            <h3 className="text-[16px] text-gray-500 font-semibold">General Information</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-900 font-normal">
              <div className="flex flex-col gap-2">
                <p className=" font-semibold">Program Name</p>
                <p className="">Program 1</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className=" font-semibold">Child Safety</p>
                <p className="">Yes</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className=" font-semibold flex items-center gap-1">
                  Minimum Temperature
                  <Tooltip
                    className="px-3 py-1.5 text-center max-w-96"
                    content="The minimum temperature that can be manually adjusted on the thermometer by physical means."
                    style="light"
                  >
                    <IoInformationCircleOutline color="#6B7280" />
                  </Tooltip>
                </p>
                <p className="">20°C</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className=" font-semibold flex items-center gap-1">
                  Maximum Temperature
                  <Tooltip
                    className="px-3 py-1.5 text-center max-w-96"
                    content="The maximum temperature that can be manually adjusted on the thermometer by physical means."
                    style="light"
                  >
                    <IoInformationCircleOutline color="#6B7280" />
                  </Tooltip>
                </p>
                <p className="">20°C</p>
              </div>
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
                <p className="">Yes</p>
              </div>
            </div>
          </div>
          <div className="w-[75%] border-l flex flex-col gap-4 border-gray-200 pl-4 ">
            <h3 className="text-[16px] text-gray-500 font-semibold">Heating Schedule</h3>
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
              <HeatingScheduleTableStatic initialLayouts={dummyData.finalScheduleData} noHeading={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ConfirmReplaceModal = ({ show, onClose, onConfirm }) => {
  return (
    <Modal show={show} onClose={onClose} size="lg">
      <Modal.Header className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900">Confirm Replace Program</span>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
        </button>
      </Modal.Header>
      <Modal.Body className='text-[#6B7280]'>
        <p>Replacing program will remove all information of the previous program, including the algorithm existed.</p>
        <p className='mt-2'>Are you sure you want to continue?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onConfirm} className="bg-primary">
          Confirm
        </Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EditHeatingProgramModal;