import { useCallback, useEffect, useState } from "react";
import {
  Checkbox,
  Table,
  Accordion,
  Select,
  Button,
  Modal,
} from "flowbite-react";
import { customTableTheme } from "../CreateHeating/Steps/ProgramAssignment/AssignmentAccordionTheme";
import { FaCircleCheck } from "react-icons/fa6";
import { errorMessages } from "../../../../globals/errorMessages";
import _ from "lodash";
import customTheme from "../CreateHeating/ModalTheme";
import axios from "axios";
import ApiUrls from "../../../../globals/apiURL.js";
import { useToast } from "../../OperationalOverview/components/ToastContext.jsx";

function AssignRoomsModal({
  openAssignModal,
  handleAssign,
  onUpdate,
  program,
  initialData,
}) {
  const [data, setData] = useState(initialData);
  const [firstData, setFirstData] = useState();
  const { generateToast } = useToast();
  const [initialAssignedRooms, setInitialAssignedRooms] = useState([]);
  const fetchAllLocations = () => {
    axios
      .get(ApiUrls.SMARTHEATING_LOCATIONS.LOCATIONS(true, true, true, true))
      .then((response) => response.data)
      .then((data) => {
        const apiData = {
          buildings: data.map((building) => {
            // Calculate the total rooms in the building
            const totalRooms = building.children.reduce(
              (sum, floor) => sum + floor.children.length,
              0
            );

            return {
              id: building.id,
              name: building.name,
              roomsAssigned: building.assignedNumberOfRooms,
              totalRooms: totalRooms,
              floors: building.children.map((floor) => ({
                id: floor.id,
                name: floor.name,
                roomsAssigned: floor.assignedNumberOfRooms,
                totalRooms: floor.children.length,
                rooms: floor.children.map((room) => ({
                  id: room.id,
                  name: room.name,
                  type: room.type,
                  algorithmOn: false,
                  programAssigned: room.heatingSchedule
                    ? room.heatingSchedule.templateName
                    : null,
                  currentTemperature: room.roomTemperature,
                  assigned:
                    room.assignedNumberOfRooms !== 0 &&
                    room.heatingSchedule.id === program.id,
                })),
              })),
            };
          }),
        };

        setData(apiData);
        setFirstData(apiData);
      })
      .catch((error) => console.error("Error:", error));
  };
  useEffect(() => {
    fetchAllLocations();
  }, [openAssignModal, initialData]);
  const [heatingData, setheatingData] = useState({});

  const [filter, setFilter] = useState("All");
  const handleCloseModal = () => {
    // Reset all the state variables to their initial values
    // setheatingData({});
    setData(initialData);
    setFilter("All");
    setFormData({
      programName: "",
      childSafety: "",
      minTemp: "",
      maxTemp: "",
      applyAlgorithm: "",
    });
    setviewSelected(false);
    setViewAll(false);
    setError(null);
    setNoRoomsError(false);
    handleAssign();
  };

  const [formData, setFormData] = useState({
    programName: "",
    childSafety: "",
    minTemp: "",
    maxTemp: "",
    applyAlgorithm: "",
  });

  // Function to create a mapping of room IDs to their default values
  const createDefaultValuesMap = () => {
    const defaultValuesMap = {};
    const newInitialData = _.cloneDeep(data);
    newInitialData?.buildings?.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.rooms.forEach((room) => {
          defaultValuesMap[room.id] = {
            programAssigned: room.programAssigned,
            algorithmOn: room.algorithmOn,
            assigned: room.assigned,
          };
        });
      });
    });
    return defaultValuesMap;
  };

  const [defaultValuesMap] = useState(createDefaultValuesMap());

  const handleRoomAssignment = (buildingId, floorId, roomId) => {
    const newData = _.cloneDeep(data);
    const building = newData.buildings.find((b) => b.id === buildingId);
    const floor = building.floors.find((f) => f.id === floorId);
    const room = floor.rooms.find((r) => r.id === roomId);

    if (room.assigned) {
      // Reset the room to its default state using the default values map
      const defaultValues = defaultValuesMap[roomId];
      room.programAssigned =
        defaultValues.programAssigned === program.templateName
          ? ""
          : defaultValues.programAssigned;
      room.algorithmOn = defaultValues.algorithmOn;
      room.assigned = false;
      const sameFloor = floor.roomsAssigned;
      const sameBuild = building.roomsAssigned;

      if (defaultValues.programAssigned) {
        if (defaultValues.programAssigned === program.templateName) {
          floor.roomsAssigned = sameFloor - 1;
          building.roomsAssigned = sameBuild - 1;
        } else {
          floor.roomsAssigned = sameFloor;
          building.roomsAssigned = sameBuild;
        }
      } else {
        // Update room and floor assignments count
        floor.roomsAssigned -= 1;
        building.roomsAssigned -= 1;
      }
    } else if (!room.assigned && room.programAssigned !== null) {
      const defaultValues = defaultValuesMap[roomId];
      // Assign the room
      room.programAssigned = program.templateName;
      room.algorithmOn = formData.applyAlgorithm;
      room.assigned = true;
      const sameFloor = floor.roomsAssigned;
      const sameBuild = building.roomsAssigned;

      if (room.programAssigned === defaultValues.programAssigned) {
        // Update room and floor assignments count
        floor.roomsAssigned = sameFloor + 1;
        building.roomsAssigned = sameBuild + 1;
      } else {
        // Update room and floor assignments count
        floor.roomsAssigned = sameFloor;
        building.roomsAssigned = sameBuild;
      }
    } else {
      // Assign the room
      room.programAssigned = program.templateName;
      room.algorithmOn = formData.applyAlgorithm;
      room.assigned = true;

      // Update room and floor assignments count
      floor.roomsAssigned += 1;
      building.roomsAssigned += 1;
    }

    setData(newData);
  };
  const [select, setselect] = useState(true);
  const handleSelectAllRooms = (buildingId, floorId, isSelected) => {
    const newData = _.cloneDeep(firstData);
    const building = newData.buildings.find((b) => b.id === buildingId);
    const floor = building.floors.find((f) => f.id === floorId);
    let count = floor.roomsAssigned;

    floor.rooms.forEach((room) => {
      // Update the room's assigned state and properties
      room.assigned = isSelected;
      if (isSelected) {
        room.programAssigned = program.templateName;
        room.algorithmOn = formData.applyAlgorithm;
      } else {
        const defaultValues = defaultValuesMap[room.id];
        room.programAssigned =
          defaultValues.programAssigned === program.templateName
            ? ""
            : defaultValues.programAssigned;
        room.algorithmOn = defaultValues.algorithmOn;
        if (defaultValues.programAssigned === program.templateName) {
          count = count - 1;
        }
      }
    });

    // Update the assigned counts
    const previouslyAssigned = floor.roomsAssigned;

    const newlyAssigned = isSelected ? floor.totalRooms : count > 0 ? count : 0;
    floor.roomsAssigned = newlyAssigned;

    // Update building assigned count
    const difference = newlyAssigned - previouslyAssigned;
    building.roomsAssigned += difference;

    // Update state
    setData(newData);
  };

  const isAllRoomsSelected = (floor) => {
    return floor.rooms.every((room) => room.assigned);
  };

  const filterRooms = (rooms) => {
    switch (filter) {
      case "Assigned":
        return rooms.filter(
          (room) => room.assigned || room.programAssigned !== null
        );
      case "Selected":
        return rooms.filter((room) => room.assigned);
      case "Unassigned":
        return rooms.filter(
          (room) => !room.assigned && room.programAssigned === null
        );
      default:
        return rooms;
    }
  };

  const [viewSelected, setviewSelected] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const handleViewSelected = () => {
    setFilter("Selected");
    setviewSelected(true);
    setViewAll(true);
  };
  function getRoomIdsByProgram(data) {
    const programName = program.templateName;
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
  const handleViewAll = () => {
    setFilter("All");
    setViewAll(false);
  };

  const [error, setError] = useState();
  const [noRoomsError, setNoRoomsError] = useState(false);

  const [ButtonText, setButtonText] = useState("Fertig");
  // useCallback to memoize handleSubmit function
  const handleSubmit = useCallback(() => {
    const anyRoomSelected = data.buildings.some((building) =>
      building.floors.some((floor) => floor.rooms.some((room) => room.assigned))
    );

    setError("");

    const locationstosend = anyRoomSelected
      ? getRoomIdsByProgram(data.buildings)
      : [];

    axios
      .post(ApiUrls.SMARTHEATING_HEATINGSCHEDULE.ASSIGN_ROOM(program.id), {
        locations: locationstosend,
      })
      .then((response) => {
        const { data } = response;
        generateToast(errorMessages.roomAssignSuccessfull, true);
        onUpdate(data);
        handleAssign();
      })
      .catch((error) => {
        console.error("Error:", error);
        generateToast(errorMessages.roomAssignFailed, false);
        onUpdate("Error");
      });
  }, [data, setNoRoomsError, setError, ButtonText]); // Dependency array

  useEffect(() => {
    const anyRoomSelected = data.buildings.some((building) =>
      building.floors.some((floor) => floor.rooms.some((room) => room.assigned))
    );
    if (!anyRoomSelected) {
      setNoRoomsError(true);
    } else {
      setNoRoomsError(false);
    }
  }),
    [data];

  const resetAssignments = () => {
    setData(_.cloneDeep(initialData));
  };

  return (
    <>
      <Modal
        theme={customTheme}
        size={"7xl"}
        dismissible
        show={openAssignModal}
        onClose={handleAssign}
      >
        <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">
          Räume zuweisen - {program?.templateName}
        </Modal.Header>
        <Modal.Body className="p-5 overflow-hidden  h-auto">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-0 w-full">
              <h3 className="text-[16px] text-gray-500 font-semibold flex items-center gap-2">
                Wählen Sie unten die Räume aus, denen Sie den Heizplan zuweisen
                möchten.
              </h3>
              <div className="w-full flex justify-end">
                {!viewAll ? (
                  <Button
                    onClick={handleViewSelected}
                    className=" hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
                  >
                    Auswahl anzeigen
                  </Button>
                ) : (
                  <Button
                    onClick={handleViewAll}
                    className=" hover:!bg-transparent hover:opacity-80 border-none text-primary bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
                  >
                    Alle anzeigen
                  </Button>
                )}
              </div>
              {noRoomsError && error && (
                <div className="text-red-800 px-4 py-3 bg-[#FDF2F2] w-fit text-[16px] font-semibold flex items-center gap-2">
                  <FaCircleCheck />
                  {error}
                </div>
              )}
            </div>
            <div className=" flex items-center justify-between w-full">
              <div className=" flex items-center gap-1.5">
                <p className=" text-sm font-semibold text-black">
                  Filtern nach:
                </p>
                <Select
                  id="roomFilter"
                  required
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">Alle</option>
                  <option value="Assigned">Zugewiesen</option>
                  <option value="Unassigned">Nicht zugewiesen</option>
                </Select>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="w-[380px] "
              >
                <label
                  htmlFor="default-search"
                  className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                >
                  Suche
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="default-search"
                    className="block w-full p-4 px-4 ps-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
                    placeholder="Suche"
                    required
                  />
                </div>
              </form>
            </div>
            <div className=" flex items-center justify-between gap-2">
              <p className=" text-sm text-gray-500"></p>
              <Button
                onClick={resetAssignments}
                className=" hover:!bg-transparent hover:opacity-80 border-none text-red-600 bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
              >
                Auswahl zurücksetzen
              </Button>
            </div>
            <div className=" flex flex-col gap-0 max-h-[400px] overflow-y-auto">
              {!viewSelected
                ? data.buildings.map((building) => (
                    <Accordion
                      className=" border-none"
                      key={building.id}
                      collapseAll
                    >
                      <Accordion.Panel className="">
                        <Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
                          <p className="text-sm text-gray-900 font-bold">
                            {building.name}
                            <span
                              className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${
                                building.roomsAssigned === building.totalRooms
                                  ? "text-primary"
                                  : "text-indigo-800"
                              } ${
                                building.roomsAssigned === building.totalRooms
                                  ? "bg-primary-200"
                                  : "bg-indigo-100"
                              } rounded-md`}
                            >
                              {building.roomsAssigned}/{building.totalRooms}{" "}
                              Räume zugewiesen
                            </span>
                          </p>
                        </Accordion.Title>
                        <Accordion.Content className=" border !border-b rounded-lg px-4 py-2">
                          {building.floors.map((floor) => (
                            <Accordion
                              className=" border-none"
                              key={floor.id}
                              collapseAll={true}
                            >
                              <Accordion.Panel>
                                <Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
                                  <p className="text-sm text-gray-900 font-bold">
                                    {floor.name}
                                    <span
                                      className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${
                                        floor.roomsAssigned === floor.totalRooms
                                          ? "text-primary"
                                          : "text-indigo-800"
                                      } ${
                                        floor.roomsAssigned === floor.totalRooms
                                          ? "bg-primary-200"
                                          : "bg-indigo-100"
                                      } rounded-md`}
                                    >
                                      {floor.roomsAssigned}/{floor.totalRooms}{" "}
                                      Räume zugewiesen
                                    </span>
                                  </p>
                                </Accordion.Title>
                                <Accordion.Content className=" border rounded-lg px-4 py-2">
                                  {filterRooms(floor.rooms).length === 0 ? (
                                    <p className="text-gray-500">
                                      {filter === "Selected" ||
                                      filter === "Assigned"
                                        ? "Nichts ausgewählt"
                                        : "Alle Räume ausgewählt"}
                                    </p>
                                  ) : (
                                    <Table theme={customTableTheme} hoverable>
                                      <Table.Head className="text-gray-500 [&>tr>th]:font-semibold ">
                                        <Table.HeadCell className="pl-4 ">
                                          <Checkbox
                                            checked={isAllRoomsSelected(floor)}
                                            onChange={(e) =>
                                              handleSelectAllRooms(
                                                building.id,
                                                floor.id,
                                                e.target.checked
                                              )
                                            }
                                          />
                                        </Table.HeadCell>
                                        <Table.HeadCell>Räume</Table.HeadCell>

                                        <Table.HeadCell>
                                          Aktiver Heizplan
                                        </Table.HeadCell>
                                        <Table.HeadCell>
                                          Raumtemperatur
                                        </Table.HeadCell>
                                      </Table.Head>
                                      <Table.Body className="">
                                        {filterRooms(floor.rooms).map(
                                          (room) => (
                                            <Table.Row
                                              key={room.id}
                                              className={`border-t   border-gray-300 ${
                                                room.assigned
                                                  ? "bg-primary-200"
                                                  : "bg-white"
                                              }`}
                                            >
                                              <Table.Cell className="w-[10%] pl-4">
                                                <Checkbox
                                                  checked={room.assigned}
                                                  onChange={() =>
                                                    handleRoomAssignment(
                                                      building.id,
                                                      floor.id,
                                                      room.id
                                                    )
                                                  }
                                                />
                                              </Table.Cell>
                                              <Table.Cell className="w-[30%]  whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                                {room.name}{" "}
                                                <span className=" text-xs font-normal py-0.5 px-2.5 bg-gray-100 rounded-3xl">
                                                  {room.type}
                                                </span>
                                              </Table.Cell>

                                              <Table.Cell className="w-[40%]">
                                                {room.programAssigned ? (
                                                  <span className=" text-primary ">
                                                    {room.programAssigned}
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </Table.Cell>
                                              <Table.Cell className="text-gray-900 w-[20%]">
                                                {room?.currentTemperature?.toFixed(
                                                  1
                                                )}
                                                °C
                                              </Table.Cell>
                                            </Table.Row>
                                          )
                                        )}
                                      </Table.Body>
                                    </Table>
                                  )}
                                </Accordion.Content>
                              </Accordion.Panel>
                            </Accordion>
                          ))}
                        </Accordion.Content>
                      </Accordion.Panel>
                    </Accordion>
                  ))
                : data.buildings.map((building) => (
                    <div key={building.id}>
                      <Accordion
                        className=" border-none"
                        key={building.id}
                        collapseAll={false}
                      >
                        <Accordion.Panel className="">
                          <Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
                            <p className="text-sm text-gray-900 font-bold">
                              {building.name}
                              <span
                                className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${
                                  building.roomsAssigned === building.totalRooms
                                    ? "text-primary"
                                    : "text-indigo-800"
                                } ${
                                  building.roomsAssigned === building.totalRooms
                                    ? "bg-primary-200"
                                    : "bg-indigo-100"
                                } rounded-md`}
                              >
                                {building.roomsAssigned}/{building.totalRooms}{" "}
                                Räume zugewiesen
                              </span>
                            </p>
                          </Accordion.Title>
                          <Accordion.Content className=" border !border-b rounded-lg px-4 py-2">
                            {building.floors.map((floor) => (
                              <Accordion
                                className=" border-none"
                                key={floor.id}
                                collapseAll={!floor.roomsAssigned}
                              >
                                <Accordion.Panel>
                                  <Accordion.Title className=" p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white">
                                    <p className="text-sm text-gray-900 font-bold">
                                      {floor.name}
                                      <span
                                        className={`text-xs font-normal py-0.5 px-2.5 ml-1 ${
                                          floor.roomsAssigned ===
                                          floor.totalRooms
                                            ? "text-primary"
                                            : "text-indigo-800"
                                        } ${
                                          floor.roomsAssigned ===
                                          floor.totalRooms
                                            ? "bg-primary-200"
                                            : "bg-indigo-100"
                                        } rounded-md`}
                                      >
                                        {floor.roomsAssigned}/{floor.totalRooms}{" "}
                                        Räume zugewiesen
                                      </span>
                                    </p>
                                  </Accordion.Title>
                                  <Accordion.Content className=" border rounded-lg px-4 py-2">
                                    {filterRooms(floor.rooms).length === 0 ? (
                                      <p className="text-gray-500">
                                        {filter === "Selected" ||
                                        filter === "Assigned"
                                          ? "Nichts ausgewählt"
                                        : "Alle Räume ausgewählt"}
                                      </p>
                                    ) : (
                                      <Table theme={customTableTheme} hoverable>
                                        <Table.Head className="text-gray-500 [&>tr>th]:font-semibold ">
                                          <Table.HeadCell className="pl-4">
                                            <Checkbox
                                              checked={isAllRoomsSelected(
                                                floor
                                              )}
                                              onChange={(e) =>
                                                handleSelectAllRooms(
                                                  building.id,
                                                  floor.id,
                                                  e.target.checked
                                                )
                                              }
                                            />
                                          </Table.HeadCell>
                                          <Table.HeadCell>Räume</Table.HeadCell>

                                          <Table.HeadCell>
                                            Aktiver Heizplan
                                          </Table.HeadCell>
                                          <Table.HeadCell>
                                            Raumtemperatur
                                          </Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body className="">
                                          {filterRooms(floor.rooms).map(
                                            (room) => (
                                              <Table.Row
                                                key={room.id}
                                                className={`border-t  border-gray-300 ${
                                                  room.assigned
                                                    ? "bg-primary-200"
                                                    : "bg-white"
                                                }`}
                                              >
                                                <Table.Cell className="w-[10%] pl-4">
                                                  <Checkbox
                                                    checked={room.assigned}
                                                    onChange={() =>
                                                      handleRoomAssignment(
                                                        building.id,
                                                        floor.id,
                                                        room.id
                                                      )
                                                    }
                                                  />
                                                </Table.Cell>
                                                <Table.Cell className=" w-[30%] whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                                  {room.name}{" "}
                                                  <span className=" text-xs font-normal py-0.5 px-2.5 bg-gray-100 rounded-3xl">
                                                    {room.type}
                                                  </span>
                                                </Table.Cell>

                                                <Table.Cell className="w-[40%]">
                                                  {room.programAssigned ? (
                                                    <span className=" text-primary">
                                                      {room.programAssigned}
                                                    </span>
                                                  ) : (
                                                    "-"
                                                  )}
                                                </Table.Cell>
                                                <Table.Cell className="text-gray-900 w-[20%]">
                                                  {room?.currentTemperature?.toFixed(
                                                    1
                                                  )}
                                                  °C
                                                </Table.Cell>
                                              </Table.Row>
                                            )
                                          )}
                                        </Table.Body>
                                      </Table>
                                    )}
                                  </Accordion.Content>
                                </Accordion.Panel>
                              </Accordion>
                            ))}
                          </Accordion.Content>
                        </Accordion.Panel>
                      </Accordion>
                    </div>
                  ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleSubmit}
            className={ButtonText === "Fertig" ? `bg-primary` : `bg-green-500`}
          >
            {ButtonText}
          </Button>

          <Button
            className="font-black"
            color="gray"
            onClick={handleCloseModal}
          >
            Schließen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AssignRoomsModal;
