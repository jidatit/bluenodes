/* eslint-disable no-inner-declarations */
/* eslint-disable no-unused-vars */
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
  //Set token for bearer authorization
  const token = localStorage.getItem('token');

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
    if (openCloneModal) {
      setFormData({
        programName: program?.templateName + ' - Cloned' || "",
        childSafety: program?.allowDeviceOverride === true ? "No" : "Yes" || "",
        minTemp: program?.deviceOverrideTemperatureMin + '°C' || "",
        maxTemp: program?.deviceOverrideTemperatureMax + '°C' || "",
        applyAlgorithm: "",
      });
    }
  }, [openCloneModal, program]);

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
    // if (buttonText === 'Create') {
      if (handleAssignmentRef.current) {
        handleAssignmentRef.current();

        const anyRoomSelected = heatingAssignmentData.buildings.some(building =>
          building.floors.some(floor =>
            floor.rooms.some(room => room.assigned)
          )
        );

        if (!anyRoomSelected && buttonText === 'Create') {
          setButtonText('Confirm');
        } else {
          handleAssignmentData();
          // onCreate(combinedData);
          // Get rooms IDs from the entire Data
          function getRoomIdsByProgram(data) {
            const programName = combinedData.formData.programName;
            const roomIds = [];

            // Loop through each building
            data.forEach(building => {
              // Loop through each floor in the building
              building.floors.forEach(floor => {
                // Loop through each room on the floor
                floor.rooms.forEach(room => {
                  // Check if the programAssigned matches the programName
                  if (room.programAssigned === programName) {
                    roomIds.push(room.id);
                  }
                });
              });
            });

            return roomIds;
          }

          // Convert schedule data into API format 
          function convertScheduleData(data) {
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

          //Manipulating for API
          const finalObj = {
            "templateName": combinedData.formData.programName,
            "allowDeviceOverride": combinedData.formData.childSafety === 'No' ? true : false,
            "deviceOverrideTemperatureMin": parseInt(combinedData.formData.minTemp),
            "deviceOverrideTemperatureMax": parseInt(combinedData.formData.maxTemp),
            ...(anyRoomSelected && { "locations": getRoomIdsByProgram(combinedData.heatingAssignmentData.buildings) }),
            "days": convertScheduleData(combinedData.finalScheduleData)
          }

          handleCloneModal();
          resetModalState();
          // Submit the form or perform other actions

          fetch(`https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalObj)
          })
            .then(response => response.json())
            .then(data => {
              console.log(data)
              if (data.statusCode === 400) {
                onCreate('Error')
              } else {
                onCreate(combinedData)
              }
            })
            .catch(error => {
              console.error('Error:', error);
              onCreate('Error'); // Error occurred: Send 'Error'
            })
        }
      } else {
        console.error('handleAssignmentRef.current is not defined');
      }
    // } 
    // else {
    //   // Confirm button clicked
    //   handleAssignmentData();
    //   // onCreate(combinedData);
    //   handleCloneModal();
    //   setButtonText('Create');
    //   resetModalState();
    // }
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

  const [initialData, setInitialData] = useState({})

  useEffect(() => {
    fetch(`https://api-dev.blue-nodes.app/dev/smartheating/locations?heatingScheduleDetails=true&roomTemperature=true&assignedNumberOfRooms=true&numberOfRooms=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const apiData = {
          buildings: data.map((building) => {
            // Calculate the total rooms in the building
            const totalRooms = building.children.reduce((sum, floor) => sum + floor.children.length, 0);
            const buildingAssignedRooms = building.children.reduce((sum, floor) => {
              // Iterate over each room in the floor and sum the assignedNumberOfRooms values
              const assignedNumberOfRoomsSum = floor.children.reduce((floorSum, room) => {
                return floorSum + (room.assignedNumberOfRooms || 0);
              }, 0);

              return sum + assignedNumberOfRoomsSum;
            }, 0);

            return {
              id: building.id,
              name: building.name,
              roomsAssigned: buildingAssignedRooms,
              totalRooms: totalRooms,
              floors: building.children.map((floor) => (
                {
                  id: floor.id,
                  name: floor.name,
                  roomsAssigned: floor.assignedNumberOfRooms,
                  totalRooms: floor.children.length,
                  rooms: floor.children.map((room) => (
                    {
                      id: room.id,
                      name: room.name,
                      type: room.type,
                      algorithmOn: false,
                      programAssigned: room.heatingSchedule ? room.heatingSchedule.templateName : null,
                      currentTemperature: room.roomTemperature,
                      assigned: false
                    }
                  ))
                }
              ))
            };
          })
        };

        setInitialData(apiData)
      })
      .catch(error => console.error('Error:', error));
  }, [])

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
              Next
            </Button>
          ) : (
            <Button className={` ${buttonText === 'Confirm' ? 'bg-green-400 focus:ring-green-400 focus:bg-green-400 hover:bg-green-400 enabled:hover:bg-green-400' : 'bg-primary'}`} onClick={handleCreate}>{buttonText}</Button>
          )}
          <Button className="font-black" color="gray" onClick={handleCloseModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
