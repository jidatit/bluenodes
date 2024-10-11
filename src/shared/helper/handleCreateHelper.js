/* eslint-disable no-inner-declarations */
import axios from "axios";

export const handleCreateHelper = (
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
  mode
) => {
  if (mode === "create" || mode === "clone") {
    if (handleAssignmentRef.current) {
      handleAssignmentRef.current();

      const anyRoomSelected = heatingAssignmentData?.buildings?.some(
        (building) =>
          building.floors.some((floor) =>
            floor.rooms.some((room) => room.assigned)
          )
      );

      handleAssignmentData();
      // Get rooms IDs from the entire Data
      // eslint-disable-next-line no-inner-declarations
      function getRoomIdsByProgram(data) {
        const programName = combinedData.formData.programName;
        const roomIds = [];

        // Loop through each building
        data.forEach((building) => {
          // Loop through each floor in the building
          building.floors.forEach((floor) => {
            // Loop through each room on the floor
            floor.rooms.forEach((room) => {
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
            const targetTemperature = parseFloat(entry.temperature, 10);

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
      const finalObj = {
        templateName: combinedData.formData.programName,
        allowDeviceOverride:
          combinedData.formData.childSafety === "No" ? true : false,
        ...(anyRoomSelected && {
          locations: getRoomIdsByProgram(
            combinedData.heatingAssignmentData.buildings
          ),
        }),
        days: convertScheduleData(combinedData.finalScheduleData),
      };

      if (combinedData.formData.childSafety !== "Yes") {
        finalObj.deviceOverrideTemperatureMin = parseInt(
          combinedData.formData.minTemp
        );
        finalObj.deviceOverrideTemperatureMax = parseInt(
          combinedData.formData.maxTemp
        );
      }

      axios
        .post(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE, finalObj)
        .then((response) => {
          const { data } = response;
          if (data.status >= 400) {
            generateToast(errors.FailedCreation, false);
            onCreate("Error");
          } else {
            generateToast(errors.successfulCreation, true);
            onCreate(combinedData);
            handleOpenModal();
            resetModalState();
          }
        })
        .catch((error) => {
          if (error.response && error.response.status >= 400) {
            generateToast(errors.FailedCreation, false);
            onCreate("Error");
          } else {
            console.error("Error:", error);
          }
        });
      // }
    } else {
      console.error("handleAssignmentRef.current is not defined");
    }
  }
};

// if (mode === "edit") {
//   let scheduleDataTemp = {};

//   // Save button clicked
//   if (currentStep === 2) {
//     // Trigger the handleCheck function in the child component
//     if (handleCheckRef.current) {
//       handleCheckRef.current();
//     }
//     if (newCheck !== null && !newCheck) {
//       setFinalScheduleData(layoutsRef.current);
//       scheduleDataTemp = layoutsRef.current;

//       // Convert schedule data into API format
//       const convertScheduleData = (data) => {
//         const dayMapping = {
//           [daysOfWeek[0]]: 1,
//           [daysOfWeek[1]]: 2,
//           [daysOfWeek[2]]: 3,
//           [daysOfWeek[3]]: 4,
//           [daysOfWeek[4]]: 5,
//           [daysOfWeek[5]]: 6,
//           [daysOfWeek[6]]: 7,
//         };

//         const result = { days: [] };

//         const normalizeTime = (value) => {
//           const hours = Math.floor((value * 24) / 96);
//           const minutes = Math.floor(((value * 24 * 60) / 96) % 60);
//           return `${hours.toString().padStart(2, "0")}:${minutes
//             .toString()
//             .padStart(2, "0")}`;
//         };

//         for (const [dayName, entries] of Object.entries(data)) {
//           const day = dayMapping[dayName];
//           entries.forEach((entry) => {
//             const from = normalizeTime(entry.y);
//             let to = normalizeTime(entry.y + entry.h);
//             const targetTemperature = parseFloat(entry.temperature, 10);

//             if (to === "24:00") {
//               to = "23:59";
//             }

//             result.days.push({
//               day,
//               from,
//               to,
//               targetTemperature,
//             });
//           });
//         }

//         return result.days;
//       };

//       // Manipulating for API
//       const finalObj = {
//         templateName: combinedData.formData.programName,
//         allowDeviceOverride: combinedData.formData.childSafety === "No",
//         days: convertScheduleData(scheduleDataTemp),
//       };

//       if (combinedData.formData.childSafety !== "Yes") {
//         finalObj.deviceOverrideTemperatureMin = parseInt(
//           combinedData.formData.minTemp
//         );
//         finalObj.deviceOverrideTemperatureMax = parseInt(
//           combinedData.formData.maxTemp
//         );
//       }

//       try {
//         const response = await axios.put(
//           ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(program.id),
//           finalObj
//         );
//         generateToast(errors.editSuccessfull, true);
//         onEdit(combinedData);
//         handleEditModal();
//         resetModalState();
//       } catch (error) {
//         generateToast(errors.editFailed, false);
//         console.error("Error:", error);
//       }
//     }
//   }
// }
