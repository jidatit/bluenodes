import { useState } from "react";
import { FaRegCopy, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Button, Modal, Tooltip, Accordion } from "flowbite-react";
import { MdNotificationsActive } from "react-icons/md";
import HeatingScheduleTable from "./HeatingScheduleTable";
import AssignRoomsModal from "./AssignRoomsModal";
import { CloneHeatingModal } from "../CloneHeating/CloneHeatingModal";
import { EditHeatingModal } from "../EditHeating/EditHeatingModal";
import { errorMessages } from "../../../../globals/errorMessages";
import { Spinner } from "flowbite-react";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";

const HeatingProgramEntity = ({
  formData,
  onUpdateRooms,
  onCloneProgram,
  onEditProgram,
  onDeleteProgram,
  program,
  fetchAll,
  response2,
  initialData,
}) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAlertDeleteModal, setOpenAlertDeleteModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openCloneModal, setOpenCloneModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [locationDetails, setLocationDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fetched, setfetched] = useState(false);
  const [Loader, setLoader] = useState(true);
  const { generateToast } = useToast();
  const handleAssign = () => {
    setOpenAssignModal(!openAssignModal);
    setResponse(!response);
    fetchDetails();
  };

  const [count, setCount] = useState(0);
  const triggerCount = () => {
    setCount(count + 1);
    if (count % 2 === 0) {
      fetchDetails();
    }
  };
  const handleDelete = async () => {
    fetchDetails();

    const programName = program.templateName;

    const hasMatchingProgram = initialData?.buildings?.some((building) =>
      building.floors?.some((floor) =>
        floor.rooms.some((room) => room.programAssigned === programName)
      )
    );
    if (hasMatchingProgram) {
      setOpenAlertDeleteModal(true);
      return; // Exit the function if there's a matching program
    }
    // If no matching program, proceed to call the delete API
    try {
      const response = await axios.delete(
        ApiUrls.SMARTHEATING_HEATINGSCHEDULE.HEATINGSCHEDULE_ID(program.id)
      );

      if (response.status >= 200 && response.status < 300) {
        // Handle successful delete
        generateToast(errorMessages.deleteSuccessfull, true);
      } else {
        // Handle errors
        const errorData = await response.data;
        console.error("Delete failed", errorData);
        generateToast(errorMessages.deleteFailed, false);
      }
    } catch (error) {
      console.error("Network error", error);
      generateToast(errorMessages.deleteFailed, false);
    }
    setOpenDeleteModal(false);
    onDeleteProgram();
  };

  const [response, setResponse] = useState(false);

  const handleUpdateRoomsAssigned = (data) => {
    if (data) {
      onUpdateRooms(data);
    }

    setResponse(!response);
  };

  const handleCloneHeatingProgram = (data) => {
    if (data) {
      onCloneProgram(data);
    }
    setResponse(!response);
  };

  const handleEditHeatingProgram = (data) => {
    if (data) {
      onEditProgram(data);
    }
    setResponse(!response);
    fetchDetails();
  };

  const handleCloneModal = () => {
    fetchDetails();
    setOpenCloneModal(!openCloneModal);
  };

  const handleEditModal = () => {
    fetchDetails();
    setOpenEditModal(!openEditModal);
  };

  // const fetchDetails = async () => {
  //   try {
  //     const response = await axios.get(
  //       ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(program.id)
  //     );
  //     const data = await response.data;
  //     setLocationDetails(data); // Update the state with the fetched data
  //     setLoader(false);
  //     setfetched(true); // Ensure fetched is set to true only after data is fetched
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  const fetchDetails = () => {
    axios
      .get(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.DETAILS(program.id))
      .then((response) => {
        const data = response.data;
        setLocationDetails(data); // Update the state with the fetched data
        setLoader(false);
        setfetched(true); // Ensure fetched is set to true only after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching heating schedule details:", error);
      });
  };

  // Function to recursively count the rooms
  const countRooms = (node) => {
    if (node.type === "raum") {
      return 1;
    }
    if (node.children && node.children.length > 0) {
      return node.children.reduce((sum, child) => sum + countRooms(child), 0);
    }
    return 0;
  };

  const options = {
    onOpen: (item) => {},
    onClose: (item) => {},
    onToggle: (item) => {},
  };

  const getDate = () => {
    // Input date string
    const dateString = program.updatedAt;
    // Parse the date string into a Date object
    const date = new Date(dateString);
    // Format the date in DD.MM.YYYY HH:MM format
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0"); // 24-hour format
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Create the formatted date string
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <>
      <div
        className={`w-full relative ${
          program.assignedRooms > 0
            ? "border-green-500 border-[2px]"
            : "border-gray-200 border-[1px]"
        } flex flex-col bg-white rounded-[8px] px-4 py-4 justify-center items-center`}
      >
        <div className="flex absolute top-4 right-3 flex-row justify-center items-center gap-3 text-gray-900">
          {program.assignedRooms > 0 && (
            <p className="text-sm text-gray-900 font-bold">
              <span
                className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-green-400 text-white rounded-md`}
              >
                Aktiv
              </span>
            </p>
          )}
          <Tooltip
            className="min-w-[130px] text-center"
            content="Duplizieren"
            style="light"
            animation="duration-500"
          >
            <FaRegCopy
              onClick={handleCloneModal}
              className="cursor-pointer transition-all ease-in-out delay-75 hover:text-[#5a5d65]"
            />
          </Tooltip>
          <Tooltip
            className="min-w-[130px] text-center"
            content="Bearbeiten"
            style="light"
            animation="duration-500"
          >
            <FaEdit
              onClick={handleEditModal}
              className="cursor-pointer transition-all ease-in-out delay-75 hover:text-[#5a5d65]"
            />
          </Tooltip>
          <Tooltip
            className="min-w-[130px] text-center"
            content="Löschen"
            style="light"
            animation="duration-500"
          >
            <RiDeleteBin6Line
              onClick={() => {
                setOpenDeleteModal(true);
                fetchDetails();
              }}
              className="cursor-pointer transition-all ease-in-out delay-75 hover:text-[#b44949]"
            />
          </Tooltip>
        </div>
        <div className="w-full flex flex-row justify-start gap-[10px] items-center text-gray-900">
          <div className="w-[25%] flex flex-col justify-center items-start">
            <p className="text-[16px] font-[700]">{program?.templateName}</p>
            <p className="text-[12px] font-[400] text-gray-500">
              Zuletzt aktualisiert: {getDate()}
            </p>
          </div>
          <div className="w-[15%] flex flex-col justify-center items-start">
            <p className="text-[12px] text-gray-500 font-[500]">
              Kindersicherung
            </p>
            <p className="text-[14px] font-[400]">
              {program?.allowDeviceOverride === true ? "Aus" : "An"}
            </p>
          </div>
          {program?.allowDeviceOverride === true && (
            <>
              <div className="w-[15%] flex flex-col justify-center items-start">
                <p className="text-[12px] text-gray-500 font-[500]">
                  Mindesttemperatur
                </p>
                <p className="text-[14px] font-[400]">
                  {program?.deviceOverrideTemperatureMin}&deg;C
                </p>
              </div>
              <div className="w-[15%] flex flex-col justify-center items-start">
                <p className="text-[12px] text-gray-500 font-[500]">
                  Höchsttemperatur
                </p>
                <p className="text-[14px] font-[400]">
                  {program?.deviceOverrideTemperatureMax}&deg;C
                </p>
              </div>
            </>
          )}
        </div>
        <div className="w-full bg-[#a3a6ad] opacity-40 mt-3 mb-3 h-[1px]"></div>

        <div className="w-full flex flex-row justify-start items-center">
          <Accordion className="w-full border-none" collapseAll>
            <Accordion.Panel isOpen={isOpen} className="">
              <Accordion.Title className=" p-2 mb-1 relative flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white outline-0">
                <div
                  onClick={() => triggerCount()}
                  className="absolute left-0 right-0 bottom-0 top-0 z-50 bg-transparent"
                ></div>
                <p className="text-sm text-gray-900 font-bold">
                  <span
                    className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md`}
                  >
                    {program?.assignedRooms}{" "}
                    {program?.assignedRooms === 1 ? "Raum" : "Räume"}
                  </span>
                </p>
              </Accordion.Title>
              {fetched ? (
                <Accordion.Content className="rounded-lg px-4 py-2 border-none">
                  <div className="flex flex-row justify-between gap-4 items-start w-full p-4">
                    <div className="flex flex-col justify-start items-start w-[25%]">
                      <div className="flex w-full pr-[10px] mt-[0px] mb-[10px] flex-row justify-between items-center">
                        <h2 className="text-gray-500 font-[600]">Zugewiesen</h2>
                        <Button
                          onClick={handleAssign}
                          className="bg-[#0BAAC9] text-white py-2 px-3 [&>*]:p-0"
                        >
                          Raum zuweisen
                        </Button>
                      </div>

                      {locationDetails &&
                        locationDetails.assignedRooms?.map((building) => (
                          <Accordion
                            key={building.id}
                            className="w-full border-none"
                            collapseAll
                          >
                            <Accordion.Panel>
                              <Accordion.Title className="p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white outline-0">
                                <p className="text-[12px] text-gray-900 font-bold">
                                  {building.name}
                                  <span
                                    className={`text-[12px] py-0.5 px-2.5 ml-1 bg-[#E5EDFF] text-[#42389D] font-[500] rounded-md`}
                                  >
                                    {countRooms(building)}{" "}
                                    {countRooms(building) === 1
                                      ? "Raum"
                                      : "Räume"}
                                  </span>
                                </p>
                              </Accordion.Title>
                              <Accordion.Content className=" px-4 pt-0 pb-4 border-none">
                                {building.children.map((floor) => (
                                  <Accordion
                                    key={floor.id}
                                    className="w-full border-none"
                                    collapseAll
                                  >
                                    <Accordion.Panel>
                                      <Accordion.Title className="p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white outline-0">
                                        <p className="text-[12px] text-gray-900 font-bold">
                                          {floor.name}
                                          <span
                                            className={`text-[12px] py-0.5 px-2.5 ml-1 bg-[#E5EDFF] text-[#42389D] font-[500] rounded-md`}
                                          >
                                            {floor.children.length}{" "}
                                            {floor.children.length === 1
                                              ? "Raum"
                                              : "Räume"}
                                          </span>
                                        </p>
                                      </Accordion.Title>
                                      <Accordion.Content className=" pl-10 pt-2 pb-4 border-none">
                                        <ul>
                                          {floor.children.map((room) => (
                                            <li
                                              key={room.id}
                                              className="room-item mb-2"
                                            >
                                              <p className="text-black text-[12px] font-semibold">
                                                {room.name}
                                              </p>
                                            </li>
                                          ))}
                                        </ul>
                                      </Accordion.Content>
                                    </Accordion.Panel>
                                  </Accordion>
                                ))}
                              </Accordion.Content>
                            </Accordion.Panel>
                          </Accordion>
                        ))}
                    </div>
                    <div className="flex flex-col border-l-2 border-l-[#E5E7EB] pl-2 justify-center items-center w-[75%]">
                      {locationDetails && (
                        <HeatingScheduleTable
                          locationDetails={locationDetails}
                        />
                      )}
                    </div>
                  </div>
                </Accordion.Content>
              ) : (
                <Accordion.Content className=" px-4 pt-0 pb-4 border-none">
                  {Loader && (
                    <div className="w-full flex flex-col justify-center items-center">
                      <Spinner
                        aria-label="Extra large spinner example"
                        size="xl"
                      />
                    </div>
                  )}
                </Accordion.Content>
              )}
            </Accordion.Panel>
          </Accordion>
        </div>

        <DeleteModal
          openDeleteModal={openDeleteModal}
          setOpenDeleteModal={setOpenDeleteModal}
          handleDelete={handleDelete}
        />
        <AlertDeleteModal
          openAlertDeleteModal={openAlertDeleteModal}
          setOpenAlertDeleteModal={setOpenAlertDeleteModal}
          setOpenDeleteModal={setOpenDeleteModal}
        />
        {openAssignModal && (
          <AssignRoomsModal
            openAssignModal={openAssignModal}
            handleAssign={handleAssign}
            onUpdate={handleUpdateRoomsAssigned}
            program={program}
            initialData={initialData}
          />
        )}
        {openCloneModal && (
          <CloneHeatingModal
            openCloneModal={openCloneModal}
            handleCloneModal={handleCloneModal}
            onCreate={handleCloneHeatingProgram}
            program={program}
            locationDetails={locationDetails}
          />
        )}
        {openEditModal && (
          <EditHeatingModal
            openEditModal={openEditModal}
            handleEditModal={handleEditModal}
            onEdit={handleEditHeatingProgram}
            program={program}
            locationDetails={locationDetails}
          />
        )}
      </div>
    </>
  );
};

const DeleteModal = ({ openDeleteModal, setOpenDeleteModal, handleDelete }) => {
  return (
    <Modal
      show={openDeleteModal}
      size="lg"
      onClose={() => setOpenDeleteModal(false)}
      popup
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <RiDeleteBin6Line size={30} className="text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Möchten Sie diesen Heizplan wirklich löschen?
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
              Abbrechen
            </Button>
            <Button color="failure" onClick={handleDelete}>
              Löschen
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const AlertDeleteModal = ({
  openAlertDeleteModal,
  setOpenAlertDeleteModal,
  setOpenDeleteModal,
}) => {
  return (
    <Modal
      show={openAlertDeleteModal}
      size="lg"
      onClose={() => {
        setOpenAlertDeleteModal(false);
        setOpenDeleteModal(false);
      }}
      popup
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <MdNotificationsActive
            size={30}
            className="text-[#9CA3AF] mx-auto mb-4"
          />
          <h3 className="mb-1 text-lg font-normal text-gray-500 dark:text-gray-400">
            Das Heizprogramm kann nicht gelöscht werden, da ihm Räume zugewiesen
            sind.
          </h3>
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Weisen Sie die Räume einem anderen Programm zu, bevor Sie mit dem
            Löschen fortfahren.
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              color="gray"
              onClick={() => {
                setOpenAlertDeleteModal(false);
                setOpenDeleteModal(false);
              }}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default HeatingProgramEntity;
