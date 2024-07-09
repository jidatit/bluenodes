import React from 'react';

// Dummy data representing temperature changes
const temperatureData = [
  { startTime: '00:00', endTime: '08:00', temp: 15, color: 'bg-blue-400', labelColor: 'text-blue-400' },
  { startTime: '08:00', endTime: '12:00', temp: 24, color: 'bg-green-400', labelColor: 'text-green-400' },
  { startTime: '12:00', endTime: '18:00', temp: 30, color: 'bg-red-400', labelColor: 'text-red-400' },
  { startTime: '18:00', endTime: '23:00', temp: 27, color: 'bg-orange-400', labelColor: 'text-orange-400' },
];

// Dummy data representing manual changes
const manualChanges = [
  { time: '02:00' },
  { time: '06:00' },
  { time: '10:00' },
  { time: '21:00' },
  { time: '23:00' },
];

const parseTimeToPercentage = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return ((hours * 60 + minutes) / 1380) * 100;
};

const TemperatureSchedule = () => {
  return (
    <div className="w-full p-4 relative rounded-lg border border-gray-200">
      <div className="flex items-center mb-4">
        <div className=' flex items-center gap-1'>
          <span className="text-lg font-bold">Room 123</span>
          <span className={`text-xs font-normal py-0.5 px-2.5 ml-1 bg-gray-200 text-gray-900 rounded-md`}>
              Resident
          </span>
        </div>
      </div>
      {/* <div className="flex items-center mb-2">
        <span className="text-sm text-gray-500">Today 00:00</span>
      </div> */}
      <div className='w-full relative px-4'>
              {/* Render dots for manual changes outside the h-4 container */}
        <div className=' w-full relative'>

          {manualChanges.map((change, index) => (
            <div
              key={`dot-${index}`}
              className="absolute w-2 h-2 bg-gray-400 rounded-full"
              style={{
                left: `calc(${parseTimeToPercentage(change.time)}% - 0.375rem)`,
                top: `-12px`,
                zIndex: '1', // Ensure dots are above the temperature line
              }}
            />
          ))}
        </div>
        <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-transparent">
        {temperatureData.map((data, index) => (
          <div
            key={index}
            className={`absolute h-1.5 ${data.color} rounded-full`}
            style={{
              left: `${parseTimeToPercentage(data.startTime)}% `,
              width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}% - 0.225rem)`,
              marginLeft: index === 0 ? '0' : '0.25rem',
              marginRight: index === temperatureData.length - 1 ? '0' : '0.45rem',
            }}
          />
        ))}
        </div>
        <div className=' w-full absolute left-0 right-0 px-3 flex gap-1'             style={{
              // bottom: 'calc(50% - 0.8rem)'
              top:`-5px`
            }}>
        {temperatureData.map((data, index) => (       
          <div key={`separator-parent-${index}`} style={{width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}% - 0.275rem)`,}} className=' flex justify-start '>
            <div
              key={`separator-${index}`}
              className=" w-1 h-4 bg-gray-200"

            />
          </div>
        ))}
        {/* Render an additional div after the last index */}
        <div
          key={`separator-${temperatureData.length}`}
          className="w-1 h-4 bg-gray-200"
        />

        </div>

        {/* Temperature labels */}
        <div className="flex justify-between mt-1 text-sm text-gray-500">
        {temperatureData.map((data, index) => (
          <>
          <span
          style={{width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}%)`,}} key={`time-${index}`}>
            {data.startTime}
          </span>
          {index === temperatureData.length-1 && (
            <span key={`time-${index}`}>
              {data.endTime}
            </span>

          )}
          </>
        ))}
        </div>
        <div className="flex justify-between mt-[-10px] text-sm">
        {temperatureData.map((data, index) => (
          <span style={{width: `calc(${parseTimeToPercentage(data.endTime) - parseTimeToPercentage(data.startTime)}%)`,}} key={`temp-${index}`} className={`${data.labelColor} flex justify-center`}>
            {data.temp}°C
          </span>
        ))}
        </div>
      </div>

    </div>
  );
};

export default TemperatureSchedule;
