import { useCallback, useEffect, useRef, useState } from "react";
import {
  Checkbox,
  Table,
  Accordion,
  Select,
  Button,
  Tooltip,
} from "flowbite-react";
import { customTableTheme } from "./AssignmentAccordionTheme";
import { FaCheck, FaCircleCheck } from "react-icons/fa6";
import _ from "lodash";
import { IoArrowBackCircle } from "react-icons/io5";

const ProgramAssignment = ({
  formData,
  assignmentData,
  setHandleAssignmentRef,
  handlePrev,
  heatingData,
  initialData,
  clone,
  program,
}) => {
  const [data, setData] = useState(
    heatingData && Object.keys(heatingData).length > 0
      ? heatingData
      : _.cloneDeep(initialData)
  );
  const [firstData, setFirstData] = useState(
    heatingData && Object.keys(heatingData).length > 0
      ? heatingData
      : _.cloneDeep(initialData)
  );
  const [filter, setFilter] = useState("All");

  // Function to create a mapping of room IDs to their default values
  const createDefaultValuesMap = () => {
    const defaultValuesMap = {};
    const newInitialData = _.cloneDeep(initialData);
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
      room.programAssigned = defaultValues.programAssigned;
      room.algorithmOn = defaultValues.algorithmOn;
      room.assigned = defaultValues.assigned;
      const sameFloor = floor.roomsAssigned;
      const sameBuild = building.roomsAssigned;

      if (defaultValues.programAssigned) {
        if (defaultValues.programAssigned === formData.programName) {
          // Update room and floor assignments count
          floor.roomsAssigned -= 1;
          building.roomsAssigned -= 1;
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
      // Assign the room
      room.programAssigned = formData.programName;
      room.algorithmOn = formData.applyAlgorithm;
      room.assigned = true;
      const sameFloor = floor.roomsAssigned;
      const sameBuild = building.roomsAssigned;

      // Update room and floor assignments count
      floor.roomsAssigned = sameFloor;
      building.roomsAssigned = sameBuild;
    } else {
      // Assign the room
      room.programAssigned = formData.programName;
      room.algorithmOn = formData.applyAlgorithm;
      room.assigned = true;

      // Update room and floor assignments count
      floor.roomsAssigned += 1;
      building.roomsAssigned += 1;
    }

    setData(newData);
  };

  useEffect(() => {
    const newData = _.cloneDeep(data);

    newData.buildings.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.rooms.forEach((room) => {
          if (
            clone === true &&
            !room.assigned &&
            room.programAssigned !== null &&
            room.programAssigned === program.templateName
          ) {
            room.programAssigned = formData.programName;
            room.algorithmOn = formData.applyAlgorithm;
            room.assigned = true;
          }
        });
      });
    });

    setData(newData);
  }, []);

  // const handleSelectAllRooms = (buildingId, floorId, isSelected) => {
  //   const newData = _.cloneDeep(firstData);
  //   const building = newData.buildings.find((b) => b.id === buildingId);
  //   const floor = building.floors.find((f) => f.id === floorId);
  //   let count = floor.roomsAssigned;
  //   let newVar = 0;

  //   floor.rooms.forEach((room) => {
  //     room.assigned = isSelected;
  //     if (isSelected) {
  //       room.programAssigned = formData.programName;
  //       room.algorithmOn = formData.applyAlgorithm;
  //     } else {
  //       const defaultValues = defaultValuesMap[room.id];
  //       room.programAssigned =
  //         defaultValues.programAssigned === formData.programName
  //           ? ""
  //           : defaultValues.programAssigned;
  //       room.algorithmOn = defaultValues.algorithmOn;
  //       // room.assigned = defaultValues.assigned;
  //       if (defaultValues.programAssigned === formData.programName) {
  //         count = count - 1;
  //       }
  //     }
  //   });

  //   const previouslyAssigned = floor.roomsAssigned;

  //   const newlyAssigned = isSelected ? floor.totalRooms : count > 0 ? count : 0;
  //   floor.roomsAssigned = newlyAssigned;

  //   // Update building assigned count
  //   const difference = newlyAssigned - previouslyAssigned;
  //   building.roomsAssigned += difference;
  //   setData(newData);
  // };

  const handleSelectAllRooms = (buildingId, floorId, isSelected) => {
    const newData = _.cloneDeep(firstData); // Generate newData as before
    const buildingInNewData = newData.buildings.find(
      (b) => b.id === buildingId
    );
    const floorInNewData = buildingInNewData.floors.find(
      (f) => f.id === floorId
    );

    // Make a clone of current data to avoid full replacement
    const updatedData = _.cloneDeep(data);
    const buildingInData = updatedData.buildings.find(
      (b) => b.id === buildingId
    );
    const floorInData = buildingInData.floors.find((f) => f.id === floorId);

    let count = floorInNewData.roomsAssigned;

    floorInNewData.rooms.forEach((newRoom) => {
      const roomInData = floorInData.rooms.find(
        (room) => room.id === newRoom.id
      );

      roomInData.assigned = isSelected;

      if (isSelected) {
        roomInData.programAssigned = formData.programName;
        roomInData.algorithmOn = formData.applyAlgorithm;
      } else {
        const defaultValues = defaultValuesMap[newRoom.id];

        roomInData.programAssigned =
          defaultValues.programAssigned === formData.programName
            ? ""
            : defaultValues.programAssigned;
        roomInData.algorithmOn = defaultValues.algorithmOn;

        if (defaultValues.programAssigned === formData.programName) {
          count -= 1;
        }
      }
    });

    const previouslyAssigned = floorInData.roomsAssigned;
    const newlyAssigned = isSelected
      ? floorInNewData.totalRooms
      : count > 0
      ? count
      : 0;
    floorInData.roomsAssigned = newlyAssigned;

    const difference = newlyAssigned - previouslyAssigned;
    buildingInData.roomsAssigned += difference;

    setData(updatedData); // Only set the updated parts of data
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

  useEffect(() => {
    assignmentData(data);
  }, [data]);

  const [viewSelected, setviewSelected] = useState(false);
  const [viewAll, setViewAll] = useState(false);

  const handleViewSelected = () => {
    setFilter("Selected");
    setviewSelected(true);
    setViewAll(true);
  };

  const handleViewAll = () => {
    setFilter("All");
    setViewAll(false);
    // setviewSelected(false)
  };

  const [error, setError] = useState();
  const [noRoomsError, setNoRoomsError] = useState(false);
  const programAssignmentRef = useRef();

  // useCallback to memoize handleSubmit function
  const handleSubmit = useCallback(() => {
    const anyRoomSelected = data.buildings.some((building) =>
      building.floors.some((floor) => floor.rooms.some((room) => room.assigned))
    );
  }, [data, setNoRoomsError, setError]); // Dependency array

  // Set the handleCheck function in the ref passed from the parent
  useEffect(() => {
    setHandleAssignmentRef(handleSubmit);
  }, [handleSubmit, setHandleAssignmentRef]);

  useEffect(() => {
    const anyRoomSelected = data.buildings.some((building) =>
      building.floors.some((floor) => floor.rooms.some((room) => room.assigned))
    );
    if (!anyRoomSelected) {
      setNoRoomsError(true);
    } else {
      setNoRoomsError(false);
      // Submit the form or perform other actions
    }
  }),
    [data];

  const resetAssignments = () => {
    setData(_.cloneDeep(initialData));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-0 w-full">
        <h3 className="text-[16px] text-gray-500 font-semibold flex items-center gap-2">
          <Tooltip
            className="min-w-[130px]"
            content="Zurück"
            style="light"
            animation="duration-500"
          >
            <IoArrowBackCircle
              onClick={() => handlePrev()}
              className=" text-2xl hover:text-primary cursor-pointer"
            />
          </Tooltip>
          Wählen Sie die Räume aus.
        </h3>

        {noRoomsError && error && (
          <div className="text-red-800 px-4 py-3 bg-[#FDF2F2] w-fit text-[16px] font-semibold flex items-center gap-2">
            <FaCircleCheck />
            {error}
          </div>
        )}
      </div>
      <div className=" flex items-center justify-between w-full">
        <div className=" flex items-center gap-1.5">
          <p className=" text-sm font-semibold text-black">Filtern nach:</p>
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
        <div className="w-fit flex justify-end">
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
        {/* <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="w-[380px] "
        >
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Search
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
        </form> */}
      </div>
      <div className=" flex items-center justify-between gap-2 -mt-2">
        <p className=" text-sm text-gray-500"></p>
        <Button
          onClick={resetAssignments}
          className=" hover:!bg-transparent hover:opacity-80 border-none text-red-600 bg-transparent pr-2 py-0 [&>*]:p-0 focus:ring-transparent"
        >
          Auswahl zurücksetzen
        </Button>
      </div>
      <div className=" flex flex-col gap-0">
        {!viewSelected
          ? data.buildings.map((building) => (
              <Accordion className=" border-none" key={building.id} collapseAll>
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
                        {building.roomsAssigned}/{building.totalRooms} Räume mit
                        Heizplan
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
                                {floor.roomsAssigned}/{floor.totalRooms} Räume
                                mit Heizplan
                              </span>
                            </p>
                          </Accordion.Title>
                          <Accordion.Content className=" border rounded-lg px-4 py-2">
                            {filterRooms(floor.rooms).length === 0 ? (
                              <p className="text-gray-500">
                                {filter === "Selected" || filter === "Assigned"
                                  ? "Nichts ausgewählt"
                                  : "Alle Räume bereits zugewiesen"}
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
                                  <Table.HeadCell>Raum</Table.HeadCell>
                                  <Table.HeadCell>Heizplan</Table.HeadCell>
                                  <Table.HeadCell>
                                    Raumtemperatur
                                  </Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="">
                                  {filterRooms(floor.rooms).map((room) => (
                                    <Table.Row
                                      key={room.id}
                                      className={`border-t w-[10%] border-gray-300 ${
                                        room.assigned
                                          ? "bg-primary-200"
                                          : "bg-white"
                                      }`}
                                    >
                                      <Table.Cell className="pl-4">
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
                                      <Table.Cell className="w-[30%] whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                        {room.name}{" "}
                                        <span className=" text-xs font-normal py-0.5 px-2.5 bg-gray-100 rounded-3xl">
                                          {room.type}
                                        </span>
                                      </Table.Cell>
                                      {/* <Table.Cell className=' text-green-700 text-xl'>{room.algorithmOn ? <FaCheck/>:''}</Table.Cell> */}
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
                                        {room?.currentTemperature?.toFixed(1)}°C
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
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
                          {building.roomsAssigned}/{building.totalRooms} Räume
                          mit Heizplan
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
                                    floor.roomsAssigned === floor.totalRooms
                                      ? "text-primary"
                                      : "text-indigo-800"
                                  } ${
                                    floor.roomsAssigned === floor.totalRooms
                                      ? "bg-primary-200"
                                      : "bg-indigo-100"
                                  } rounded-md`}
                                >
                                  {floor.roomsAssigned}/{floor.totalRooms} Räume
                                  mit Heizplan
                                </span>
                              </p>
                            </Accordion.Title>
                            <Accordion.Content className=" border rounded-lg px-4 py-2">
                              {filterRooms(floor.rooms).length === 0 ? (
                                <p className="text-gray-500">
                                  {filter === "Selected" ||
                                  filter === "Assigned"
                                    ? "Nichts ausgewählt"
                                    : "Alle Räume bereits zugewiesen"}
                                </p>
                              ) : (
                                <Table theme={customTableTheme} hoverable>
                                  <Table.Head className="text-gray-500 [&>tr>th]:font-semibold ">
                                    <Table.HeadCell className="pl-4">
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
                                    <Table.HeadCell></Table.HeadCell>
                                    <Table.HeadCell>
                                      Aktiver Heizplan
                                    </Table.HeadCell>
                                    <Table.HeadCell>
                                      Raumtemperatur
                                    </Table.HeadCell>
                                  </Table.Head>
                                  <Table.Body className="">
                                    {filterRooms(floor.rooms).map((room) => (
                                      <Table.Row
                                        key={room.id}
                                        className={`border-t  border-gray-300 ${
                                          room.assigned
                                            ? "bg-primary-200"
                                            : "bg-white"
                                        }`}
                                      >
                                        <Table.Cell className=" w-[10%] pl-4">
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
                                        <Table.Cell className="w-[20%] whitespace-nowrap font-bold text-gray-900 dark:text-white">
                                          {room.name}{" "}
                                          <span className=" text-xs font-normal py-0.5 px-2.5 bg-gray-100 rounded-3xl">
                                            {room.type}
                                          </span>
                                        </Table.Cell>
                                        <Table.Cell className=" w-[20%] text-green-700 text-xl">
                                          {room.algorithmOn ? <FaCheck /> : ""}
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
                                        <Table.Cell className="  w-[20%] text-gray-900">
                                          {room.currentTemperature}
                                        </Table.Cell>
                                      </Table.Row>
                                    ))}
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
  );
};

export default ProgramAssignment;
