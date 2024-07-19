/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useDebugValue, useEffect, useRef, useState } from "react";
import { FaRegCopy, FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Button, Modal, Tooltip, Accordion } from "flowbite-react";
import { MdNotificationsActive } from "react-icons/md";
import HeatingScheduleTable from './HeatingScheduleTable';
import AssignRoomsModal from './AssignRoomsModal';
import { CloneHeatingModal } from '../CloneHeating/CloneHeatingModal';
import { EditHeatingModal } from '../EditHeating/EditHeatingModal';

const HeatingProgramEntity = ({ formData,onUpdateRooms,onCloneProgram, onEditProgram,program }) => {

    const token = localStorage.getItem('token');

    // console.log("static", formData)
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openAlertDeleteModal, setOpenAlertDeleteModal] = useState(false);
    const [openAssignModal, setOpenAssignModal] = useState(false);
    const [openCloneModal, setOpenCloneModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [locationDetails, setLocationDetails] = useState(null)

    const handleAssign = () => {
        setOpenAssignModal(!openAssignModal)
      }

      const handleCloneModal = () => {
        setOpenCloneModal(!openCloneModal)
      }

      const handleEditModal = () => {
        setOpenEditModal(!openEditModal)
      }

      const handleDelete = async () => {
        setOpenDeleteModal(false);

        const programName = program.templateName;

        // Check if any room has a matching programAssigned
        const hasMatchingProgram = initialData.buildings.some(building => 
            building.floors.some(floor => 
                floor.rooms.some(room => 
                    room.programAssigned === programName
                )
            )
        );

        if (hasMatchingProgram) {
            setOpenAlertDeleteModal(true);
            return; // Exit the function if there's a matching program
        }

        // If no matching program, proceed to call the delete API
        try {
            const response = await fetch(`https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/${program.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add auth token if needed
                },
            });

            if (response.ok) {
                // Handle successful delete
                console.log('Delete successful');
                // Perform any state updates or UI changes
            } else {
                // Handle errors
                const errorData = await response.json();
                console.error('Delete failed', errorData);
            }
        } catch (error) {
            console.error('Network error', error);
        }
        
      };
    
    

    const handleUpdateRoomsAssigned = (data) => {
        if (data) {
            onUpdateRooms(data)
        }
      };

      const handleCloneHeatingProgram = (data) => {
        if (data) {
            onCloneProgram(data)
        }
      };

      const handleEditHeatingProgram = (data) => {
        if (data) {
            onEditProgram(data)
        }
      };

    // Get heating schedule details by id
    useEffect(()=>{
        fetch(`https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/${program.id}/details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
          setLocationDetails(data)
        })
        .catch(error => console.error('Error:', error));
      },[])

    // Function to recursively count the rooms
    const countRooms = (node) => {
        if (node.type === 'raum') {
        return 1;
        }
        if (node.children && node.children.length > 0) {
        return node.children.reduce((sum, child) => sum + countRooms(child), 0);
        }
        return 0;
    };

    const getDate = () => {
        // Input date string
        const dateString = program.updatedAt;

        // Parse the date string into a Date object
        const date = new Date(dateString);

        // Format the date in DD/MM/YYYY HH:MM:SS format
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const formattedHours = String(hours).padStart(2, '0');

        // Create the formatted date string
        return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
    }

    const [initialData, setInitialData] = useState({})

    useEffect(()=>{
      fetch(`https://api-dev.blue-nodes.app/dev/smartheating/locations?heatingScheduleDetails=true&roomTemperature=true&assignedPrograms=true&numberOfRooms=true`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      })
      .then(response => response.json())
      .then(data => {
        // console.log(data,"from backend")
        const apiData = {
          buildings: data.map((building) => {
            // Calculate the total rooms in the building
            const totalRooms = building.children.reduce((sum, floor) => sum + floor.children.length, 0);
        
            return {
              id: building.id,
              name: building.name,
              roomsAssigned: building.assignedPrograms,
              totalRooms: totalRooms,
              floors: building.children.map((floor) => (
                {
                  id: floor.id,
                  name: floor.name,
                  roomsAssigned: floor.assignedPrograms,
                  totalRooms: floor.children.length,
                  rooms: floor.children.map((room) => (
                    {
                      id: room.id,
                      name: room.name,
                      type: room.type,
                      algorithmOn: false,
                      programAssigned:  room.heatingSchedule ? room.heatingSchedule.templateName : null,
                      currentTemperature: room.roomTemperature,
                      assigned: room.assignedPrograms !== 0 && room.heatingSchedule.id === program.id
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
    },[])

    // console.log(locationDetails)
    return (
        <>
            <div className='w-full relative flex flex-col bg-white rounded-[8px] px-4 py-4 justify-center items-center'>
                <div className='flex absolute top-4 right-3 flex-row justify-center items-center gap-3 text-gray-900'>
                    <Tooltip className='min-w-[130px]' content="Clone program" style="light" animation="duration-500">
                        <FaRegCopy onClick={handleCloneModal} className='cursor-pointer transition-all ease-in-out delay-75 hover:text-[#5a5d65]' />
                    </Tooltip>
                    <Tooltip className='min-w-[130px]' content="Edit program" style="light" animation="duration-500">
                        <FaEdit onClick={handleEditModal} className='cursor-pointer transition-all ease-in-out delay-75 hover:text-[#5a5d65]' />
                    </Tooltip>
                    <Tooltip className='min-w-[130px]' content="Delete program" style="light" animation="duration-500">
                        <RiDeleteBin6Line onClick={() => setOpenDeleteModal(true)} className='cursor-pointer transition-all ease-in-out delay-75 hover:text-[#b44949]' />
                    </Tooltip>
                </div>
                <div className='w-full flex flex-row justify-start gap-[10px] items-center text-gray-900'>
                    <div className='w-[25%] flex flex-col justify-center items-start'>
                        <p className='text-[16px] font-[700]'>{program?.templateName}</p>
                        <p className='text-[12px] font-[400] text-gray-500'>Last updated: {getDate()}</p>
                    </div>
                    <div className='w-[15%] flex flex-col justify-center items-start'>
                        <p className='text-[12px] text-gray-500 font-[500]'>Child safety</p>
                        <p className='text-[14px] font-[400]'>{program?.allowDeviceOverride===true?"No":"Yes"}</p>
                    </div>
                    <div className='w-[15%] flex flex-col justify-center items-start'>
                        <p className='text-[12px] text-gray-500 font-[500]'>Minimum temperature</p>
                        <p className='text-[14px] font-[400]'>{program?.deviceOverrideTemperatureMin}&deg;C</p>
                    </div>
                    <div className='w-[15%] flex flex-col justify-center items-start'>
                        <p className='text-[12px] text-gray-500 font-[500]'>Maximum temperature</p>
                        <p className='text-[14px] font-[400]'>{program?.deviceOverrideTemperatureMax}&deg;C</p>
                    </div>
                    {/* <div className='w-[15%] flex flex-col justify-center items-start'>
                        <p className='text-[12px] text-gray-500 font-[500]'>Apply algorithm</p>
                        <p className='text-[14px] font-[400]'>{formData.formData?.applyAlgorithm}</p>
                    </div> */}
                </div>
                <div className='w-full bg-[#a3a6ad] opacity-40 mt-3 mb-3 h-[1px]'></div>
                <div className='w-full flex flex-row justify-start items-center'>
                    <Accordion className='w-full border-none' collapseAll>
                        <Accordion.Panel className=''>
                            <Accordion.Title className=' p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white'>
                                <p className="text-sm text-gray-900 font-bold">
                                    <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md`}>
                                        View details - {program?.assignedRooms} {program?.assignedRooms>1?"rooms":"room"}
                                    </span>
                                </p>
                            </Accordion.Title>
                            <Accordion.Content className='rounded-lg px-4 py-2 border-none'>
                                <div className='flex flex-row justify-between gap-4 items-start w-full p-4'>
                                    <div className='flex flex-col justify-start items-start w-[25%]'>
                                        <div className='flex w-full pr-[10px] mt-[0px] mb-[10px] flex-row justify-between items-center'>
                                            <h2 className='text-gray-500 font-[600]'>Assigned</h2>
                                            <Button onClick={handleAssign} className='bg-[#0BAAC9] text-white py-2 px-3 [&>*]:p-0'>Assign rooms</Button>
                                        </div>


                                        {locationDetails?.assignedRooms?.map((building) => (
                                            <Accordion key={building.id} className='w-full border-none' collapseAll>
                                                <Accordion.Panel>
                                                    <Accordion.Title className='p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white'>
                                                        <p className="text-sm text-gray-900 font-bold">
                                                            {building.name}
                                                            <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-indigo-100 rounded-md`}>
                                                                {countRooms(building)} {countRooms(building)>1?"rooms":"room"}
                                                            </span>
                                                        </p>
                                                    </Accordion.Title>
                                                    <Accordion.Content className=' px-4 pt-0 pb-4 border-none'>
                                                        {building.children.map((floor, floorIndex) => (
                                                            <Accordion key={floor.id} className='w-full border-none' collapseAll>
                                                                <Accordion.Panel>
                                                                    <Accordion.Title className='p-2 mb-1 flex-row-reverse items-center justify-end gap-3 border-none hover:bg-white focus:ring-none focus:ring-white bg-white focus:bg-white'>
                                                                        <p className="text-sm text-gray-900 font-bold">
                                                                            {floor.name}
                                                                            <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-indigo-100 rounded-md`}>
                                                                                {floor.children.length} {floor.children.length>1?"rooms":"room"}
                                                                            </span>
                                                                        </p>
                                                                    </Accordion.Title>
                                                                    <Accordion.Content className=' pl-10 pt-2 pb-4 border-none'>
                                                                        <ul>
                                                                            {floor.children.map((room) => (
                                                                                (
                                                                                    <li key={room.id} className='room-item mb-2'>
                                                                                        <p className='text-black text-sm font-semibold'>{room.name}</p>
                                                                                    </li>
                                                                                )
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
                                    <div className='flex flex-col border-l-2 border-l-[#E5E7EB] pl-2 justify-center items-center w-[75%]'>
                                        {locationDetails && (<HeatingScheduleTable props={formData.finalScheduleData} locationDetails={locationDetails} />)}
                                    </div>
                                </div>
                            </Accordion.Content>
                        </Accordion.Panel>
                    </Accordion>
                </div>
                <DeleteModal openDeleteModal={openDeleteModal} setOpenDeleteModal={setOpenDeleteModal} handleDelete={handleDelete} />
                <AlertDeleteModal openAlertDeleteModal={openAlertDeleteModal} setOpenAlertDeleteModal={setOpenAlertDeleteModal} />
                {openAssignModal && (<AssignRoomsModal openAssignModal={openAssignModal} handleAssign={handleAssign} onUpdate={handleUpdateRoomsAssigned} initialData={initialData} program={program} />)}
                <CloneHeatingModal openCloneModal={openCloneModal} handleCloneModal={handleCloneModal} onCreate={handleCloneHeatingProgram} program={program} locationDetails={locationDetails} />
                <EditHeatingModal openEditModal={openEditModal} handleEditModal={handleEditModal} onEdit={handleEditHeatingProgram} program={program} locationDetails={locationDetails} />
            </div>
        </>
    )
}

const DeleteModal = ({ openDeleteModal, setOpenDeleteModal, handleDelete }) => {
    return (
        <Modal show={openDeleteModal} size="lg" onClose={() => setOpenDeleteModal(false)} popup>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <RiDeleteBin6Line size={30} className="text-[#9CA3AF] mx-auto mb-4" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this heating program?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button color="failure" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

const AlertDeleteModal = ({ openAlertDeleteModal, setOpenAlertDeleteModal }) => {
    return (
        <Modal show={openAlertDeleteModal} size="lg" onClose={() => setOpenAlertDeleteModal(false)} popup>
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <MdNotificationsActive size={30} className="text-[#9CA3AF] mx-auto mb-4" />
                    <h3 className="mb-1 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Heating program can’t be deleted as there are rooms assigned to it.
                    </h3>
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        Reassign rooms to different program before proceeding with delete.
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="gray" onClick={() => setOpenAlertDeleteModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default HeatingProgramEntity;
