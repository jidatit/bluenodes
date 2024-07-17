/* eslint-disable no-unused-vars */
import { Button, Toast } from "flowbite-react"
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa"
import { GoPlus } from "react-icons/go"
import { CreateHeatingModal } from "./CreateHeating/CreateHeatingModal";
import HeatingProgramEntity from "./components/HeatingProgramEntity";
import { errorMessages } from "../../../globals/errorMessages";

function HeatingSchedulePage() {

  const token = localStorage.getItem('token');

  //Adding use state React Hooks here
  const [programList, setProgramList] = useState([])

  // Get list of heating schedule
  useEffect(()=>{
    fetch('https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/list', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
      setProgramList(data)
    })
    .catch(error => console.error('Error:', error));
  },[])

  // dummyData.js
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

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(!openModal)
  }
const [response, setResponse] = useState(200);
const [showToast, setShowToast] = useState(false);
const [toastMessage, setToastMessage] = useState('');
const [isSuccess, setIsSuccess] = useState(true);

const handleCreateHeatingProgram = (combinedData) => {
  if (combinedData) {
    // Assuming the response status is set here based on an API call or some logic
    if (response === 200) {
      setToastMessage(errorMessages.successfulCreation);
      setIsSuccess(true);
    } else {
      setToastMessage(errorMessages.FailedCreation);
      setIsSuccess(false);
    }
  } else {
    setToastMessage(errorMessages.FailedCreation);
    setIsSuccess(false);
  }
  setShowToast(true);

      // Hide the toast after 2 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);

  // Handle combinedData here
  // console.log('Combined Data:', combinedData);
};

const handleRoomUpdate = (data) => {
  if (data) {
    // Assuming the response status is set here based on an API call or some logic
    if (response === 200) {
      setToastMessage(errorMessages.roomAssignSuccessfull);
      setIsSuccess(true);
    } else {
      setToastMessage(errorMessages.roomAssignFailed);
      setIsSuccess(false);
    }
  } else {
    setToastMessage(errorMessages.roomAssignFailed);
    setIsSuccess(false);
  }
  setShowToast(true);

      // Hide the toast after 2 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);

  // Handle combinedData here
  // console.log('Combined Data:', combinedData);
};

const handleCloneProgram = (data) => {
  if (data) {
    // Assuming the response status is set here based on an API call or some logic
    if (response === 200) {
      setToastMessage(errorMessages.cloneSuccessfull);
      setIsSuccess(true);
    } else {
      setToastMessage(errorMessages.cloneFailed);
      setIsSuccess(false);
    }
  } else {
    setToastMessage(errorMessages.cloneFailed);
    setIsSuccess(false);
  }
  setShowToast(true);

      // Hide the toast after 2 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);

  // Handle combinedData here
  // console.log('Combined Data:', combinedData);
};

const handleEditProgram = (data) => {
  if (data) {
    // Assuming the response status is set here based on an API call or some logic
    if (response === 200) {
      setToastMessage(errorMessages.editSuccessfull);
      setIsSuccess(true);
    } else {
      setToastMessage(errorMessages.editFailed);
      setIsSuccess(false);
    }
  } else {
    setToastMessage(errorMessages.editFailed);
    setIsSuccess(false);
  }
  setShowToast(true);

      // Hide the toast after 2 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);

  // Handle combinedData here
  // console.log('Combined Data:', combinedData);
};

  return (
    <div className=" flex flex-col gap-6">
      <h2 className=" text-[24px] text-black">Heating programs management</h2>
      <div className=" flex items-center justify-between">
        <div className=" flex gap-4 items-center">
          <form className="w-[380px] ">
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input type="search" id="default-search" className="block w-full p-4 px-4 ps-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary" placeholder="Search heating program" required />
              {/* <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button> */}
            </div>
          </form>
          <div className=" flex items-center justify-center gap-1.5 text-[#6B7280] cursor-pointer">
            <FaFilter />
            <p className=" text-sm">Filter</p>
          </div>
        </div>
        <div>
          <Button as="span" onClick={handleOpenModal} className=" bg-primary text-white rounded-lg text-sm cursor-pointer">
            <GoPlus className="mr-2 h-5 w-5" />
            Add heating program
          </Button>
        </div>
      </div>
      {/* here  */}
      {programList.length>0 && 
      programList.map((program,index)=>(
        (<HeatingProgramEntity key={index} formData={dummyData} onUpdateRooms={handleRoomUpdate} onCloneProgram={handleCloneProgram} onEditProgram={handleEditProgram} program={program} />)
      ))
      }
      <div><CreateHeatingModal openModal={openModal} handleOpenModal={handleOpenModal} onCreate={handleCreateHeatingProgram} /></div>
      {showToast && (
        <div className="fixed top-4 right-4 z-50 transition-transform duration-300 ease-in-out transform translate-x-0" style={{ transition: 'transform 0.3s ease-in-out' }}>
          <Toast className="animate-slideIn">
            {isSuccess ? (
              <div className=" text-cyan-600 dark:text-cyan-600 mr-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
                  <path d="M19.1213 16.4205L19.8535 14.7761C20.454 13.4263 20.5249 11.8905 20.0539 10.4294C19.583 8.96834 18.5993 7.67189 17.2698 6.76004L17.8636 5.42623C17.9715 5.18394 17.9696 4.90465 17.8583 4.64982C17.747 4.39498 17.5355 4.18547 17.2702 4.06737C17.005 3.94927 16.7077 3.93225 16.4439 4.02007C16.18 4.10789 15.9712 4.29334 15.8633 4.53563L15.2695 5.86944C13.7022 5.49155 12.0805 5.62803 10.6796 6.25572C9.27869 6.88341 8.1848 7.96366 7.58354 9.31317L6.93844 10.7621C6.90978 10.8266 6.88885 10.8944 6.87602 10.9642L6.85302 10.9539C6.50116 11.7045 5.8405 12.2751 5.01303 12.543C4.26214 12.7847 3.64872 13.2814 3.28693 13.9408C3.06607 14.4369 2.39494 15.9442 3.93318 16.6291L6.14153 17.6123C6.06521 18.5639 6.31396 19.5341 6.85197 20.3834C7.38998 21.2326 8.18951 21.9171 9.13549 22.3383C10.0815 22.7595 11.1251 22.8956 12.1162 22.7272C13.1073 22.5588 13.9948 22.0944 14.6509 21.401L16.8592 22.3842C18.3975 23.069 19.0686 21.5617 19.2895 21.0656C19.537 20.3557 19.4956 19.5678 19.1729 18.8484C18.8187 18.0552 18.8002 17.1836 19.1213 16.4205ZM9.94879 20.5116C9.54212 20.33 9.18255 20.0597 8.90179 19.7247C8.62103 19.3897 8.42771 19.0003 8.33888 18.5907L12.4535 20.4226C12.0897 20.6307 11.6709 20.7476 11.2341 20.7632C10.7973 20.7787 10.3559 20.6923 9.94879 20.5116ZM17.2107 20.3513L5.20875 15.0077C5.236 14.9465 5.26406 14.8835 5.28725 14.8314C5.50216 14.6348 5.76072 14.4847 6.04693 14.3902C7.31392 13.9285 8.31686 13.0215 8.85571 11.85L9.58785 10.2055C10.0409 9.18291 10.9061 8.38969 12.0052 7.98941C13.1043 7.58913 14.3535 7.61231 15.4952 8.05417C16.5886 8.60635 17.4428 9.51919 17.8816 10.6043C18.3204 11.6894 18.3102 12.8639 17.8532 13.8855L17.2081 15.3344C17.1796 15.399 17.1584 15.4665 17.1447 15.5361L17.1227 15.5263C16.6126 16.7106 16.6097 18.0629 17.1143 19.3134C17.2356 19.5892 17.2971 19.8819 17.2948 20.1731C17.266 20.2271 17.2379 20.2901 17.2107 20.3513Z" fill="#0CB4D5"/>
                  <path d="M6.58338 8.86787C7.3498 7.16476 8.79039 5.83957 10.6184 5.15605C10.878 5.0581 11.0786 4.86424 11.176 4.61714C11.2735 4.37003 11.2598 4.08992 11.138 3.83842C11.0162 3.58692 10.7963 3.38463 10.5266 3.27606C10.2569 3.16749 9.95956 3.16152 9.69997 3.25948C7.37973 4.12878 5.55262 5.81337 4.58306 7.97727C4.47518 8.21956 4.4771 8.49884 4.58839 8.75368C4.69967 9.00852 4.91121 9.21803 5.17647 9.33613C5.44173 9.45423 5.73898 9.47125 6.00282 9.38343C6.26667 9.29561 6.4755 9.11016 6.58338 8.86787Z" fill="#0CB4D5"/>
                  <path d="M22.9361 9.15257C22.8861 9.0246 22.8105 8.90546 22.7135 8.80197C22.6164 8.69847 22.5 8.61264 22.3707 8.54938C22.2414 8.48612 22.1018 8.44667 21.9599 8.43327C21.818 8.41988 21.6765 8.4328 21.5436 8.47131C21.4107 8.50982 21.289 8.57316 21.1853 8.65772C21.0817 8.74227 20.9981 8.84638 20.9395 8.9641C20.8808 9.08182 20.8482 9.21085 20.8435 9.34382C20.8388 9.47679 20.8621 9.6111 20.9121 9.73907C21.628 11.5566 21.6064 13.5158 20.8516 15.226C20.7437 15.4683 20.7457 15.7475 20.8569 16.0024C20.9682 16.2572 21.1798 16.4667 21.445 16.5848C21.7103 16.7029 22.0075 16.7199 22.2714 16.6321C22.5352 16.5443 22.7441 16.3589 22.8519 16.1166C23.8132 13.9471 23.8433 11.4602 22.9361 9.15257Z" fill="#0CB4D5"/>
                </svg>
              </div>
            ) : (
              <div className=" text-red-600 dark:text-red-500 mr-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
                  <path d="M19.1213 16.4205L19.8535 14.7761C20.454 13.4263 20.5249 11.8905 20.0539 10.4294C19.583 8.96834 18.5993 7.67189 17.2698 6.76004L17.8636 5.42623C17.9715 5.18394 17.9696 4.90465 17.8583 4.64982C17.747 4.39498 17.5355 4.18547 17.2702 4.06737C17.005 3.94927 16.7077 3.93225 16.4439 4.02007C16.18 4.10789 15.9712 4.29334 15.8633 4.53563L15.2695 5.86944C13.7022 5.49155 12.0805 5.62803 10.6796 6.25572C9.27869 6.88341 8.1848 7.96366 7.58354 9.31317L6.93844 10.7621C6.90978 10.8266 6.88885 10.8944 6.87602 10.9642L6.85302 10.9539C6.50116 11.7045 5.8405 12.2751 5.01303 12.543C4.26214 12.7847 3.64872 13.2814 3.28693 13.9408C3.06607 14.4369 2.39494 15.9442 3.93318 16.6291L6.14153 17.6123C6.06521 18.5639 6.31396 19.5341 6.85197 20.3834C7.38998 21.2326 8.18951 21.9171 9.13549 22.3383C10.0815 22.7595 11.1251 22.8956 12.1162 22.7272C13.1073 22.5588 13.9948 22.0944 14.6509 21.401L16.8592 22.3842C18.3975 23.069 19.0686 21.5617 19.2895 21.0656C19.537 20.3557 19.4956 19.5678 19.1729 18.8484C18.8187 18.0552 18.8002 17.1836 19.1213 16.4205ZM9.94879 20.5116C9.54212 20.33 9.18255 20.0597 8.90179 19.7247C8.62103 19.3897 8.42771 19.0003 8.33888 18.5907L12.4535 20.4226C12.0897 20.6307 11.6709 20.7476 11.2341 20.7632C10.7973 20.7787 10.3559 20.6923 9.94879 20.5116ZM17.2107 20.3513L5.20875 15.0077C5.236 14.9465 5.26406 14.8835 5.28725 14.8314C5.50216 14.6348 5.76072 14.4847 6.04693 14.3902C7.31392 13.9285 8.31686 13.0215 8.85571 11.85L9.58785 10.2055C10.0409 9.18291 10.9061 8.38969 12.0052 7.98941C13.1043 7.58913 14.3535 7.61231 15.4952 8.05417C16.5886 8.60635 17.4428 9.51919 17.8816 10.6043C18.3204 11.6894 18.3102 12.8639 17.8532 13.8855L17.2081 15.3344C17.1796 15.399 17.1584 15.4665 17.1447 15.5361L17.1227 15.5263C16.6126 16.7106 16.6097 18.0629 17.1143 19.3134C17.2356 19.5892 17.2971 19.8819 17.2948 20.1731C17.266 20.2271 17.2379 20.2901 17.2107 20.3513Z" fill="#E02424"/>
                  <path d="M6.58338 8.86787C7.3498 7.16476 8.79039 5.83957 10.6184 5.15605C10.878 5.0581 11.0786 4.86424 11.176 4.61714C11.2735 4.37003 11.2598 4.08992 11.138 3.83842C11.0162 3.58692 10.7963 3.38463 10.5266 3.27606C10.2569 3.16749 9.95956 3.16152 9.69997 3.25948C7.37973 4.12878 5.55262 5.81337 4.58306 7.97727C4.47518 8.21956 4.4771 8.49884 4.58839 8.75368C4.69967 9.00852 4.91121 9.21803 5.17647 9.33613C5.44173 9.45423 5.73898 9.47125 6.00282 9.38343C6.26667 9.29561 6.4755 9.11016 6.58338 8.86787Z" fill="#E02424"/>
                  <path d="M22.9361 9.15257C22.8861 9.0246 22.8105 8.90546 22.7135 8.80197C22.6164 8.69847 22.5 8.61264 22.3707 8.54938C22.2414 8.48612 22.1018 8.44667 21.9599 8.43327C21.818 8.41988 21.6765 8.4328 21.5436 8.47131C21.4107 8.50982 21.289 8.57316 21.1853 8.65772C21.0817 8.74227 20.9981 8.84638 20.9395 8.9641C20.8808 9.08182 20.8482 9.21085 20.8435 9.34382C20.8388 9.47679 20.8621 9.6111 20.9121 9.73907C21.628 11.5566 21.6064 13.5158 20.8516 15.226C20.7437 15.4683 20.7457 15.7475 20.8569 16.0024C20.9682 16.2572 21.1798 16.4667 21.445 16.5848C21.7103 16.7029 22.0075 16.7199 22.2714 16.6321C22.5352 16.5443 22.7441 16.3589 22.8519 16.1166C23.8132 13.9471 23.8433 11.4602 22.9361 9.15257Z" fill="#E02424"/>
                </svg>
              </div>
            )}
            <div className="pl-4 text-sm font-normal border-l">{toastMessage}</div>
          </Toast>
        </div>
      )}

    </div>
  )
}

export default HeatingSchedulePage