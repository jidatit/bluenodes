import axios from "axios";

export const handleConfirmReplaceHelper = ({
  roomId,
  selectedProgram,
  generateToast,
  setSelectedProgram,
  ApiUrls,
  errors,
  specificCallback,
  handleCloseModal,
  setShowConfirmModal,
  isAssign, // Flag to handle slight variations
}) => {
  axios
    .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(selectedProgram))
    .then((response) => response.data)
    .then((data) => {
      const existingRoomIds = data.locations || [];
      const updatedRoomIds = [...existingRoomIds, roomId];

      return axios.post(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.ASSIGN_ROOM(selectedProgram),
        { locations: updatedRoomIds }
      );
    })
    .then((response) => response.data)
    .then((data) => {
      // Conditional rendering based on the flag or prop
      if (isAssign === true) {
        generateToast(errors.PorgramAssignedSuccessfully, true);
        setSelectedProgram(""); // Specific to the second component
        specificCallback();
      } else {
        console.log("specificCallback", specificCallback);
        generateToast(errors.ProgramReplacedSuccessfully, true);
        specificCallback();
      }

      handleCloseModal();
    })
    .catch((error) => {
      console.error("Error:", error);
      generateToast(errors.ProgramReplacedFailed, false);
    })
    .finally(() => {
      setShowConfirmModal(false);
    });
};
