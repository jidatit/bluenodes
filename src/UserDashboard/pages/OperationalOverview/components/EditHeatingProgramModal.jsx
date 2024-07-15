import React, { useState, useEffect } from 'react';
import { Button, Modal, Radio, Label, Select, Tooltip } from "flowbite-react";
import { IoInformationCircleOutline } from "react-icons/io5";
import customTheme from "../../HeatingSchedule/CreateHeating/ModalTheme";
import HeatingScheduleTableStatic from "../../HeatingSchedule/components/HeatingScheduleTableStatic";

const EditHeatingProgramModal = ({ openModal, handleOpenModal }) => {
    const [selectedAction, setSelectedAction] = useState('edit-room');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [showError, setShowError] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleCloseModal = () => {
        handleOpenModal();
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
        console.log('Action:', selectedAction);
        console.log('Selected Program:', selectedProgram);
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

    return (
        <>
            <Modal theme={customTheme} size={"6xl"} show={openModal} onClose={handleCloseModal}>
                <Modal.Header className=" text-lg text-gray-900 [&>*]:font-semibold">Edit - Room 123</Modal.Header>
                <Modal.Body className="p-5 overflow-hidden h-auto">
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
                                <EditRoomHeatingSchedule />
                            ) : (
                                <ReplaceProgram
                                    selectedProgram={selectedProgram}
                                    handleProgramChange={handleProgramChange}
                                    showError={showError}
                                />
                            )}
                        </div>

                        {selectedAction === 'replace-room' && selectedProgram && (
                            <ViewTableComponent />
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button className="bg-primary" onClick={handleDone}>
                        Done
                    </Button>
                    <Button className="font-black" color="gray" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmReplaceModal 
                show={showConfirmModal} 
                onClose={handleCancelReplace} 
                onConfirm={handleConfirmReplace} 
            />
        </>
    );
};

const EditRoomHeatingSchedule = () => {
    return (
        <div className='w-full flex justify-start items-center'>
            <p>EditRoomHeatingSchedule</p>
        </div>
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
            <div className="p-5 h-[300px] overflow-y-auto w-full">
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

const ConfirmReplaceModal = ({show, onClose, onConfirm }) => {
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