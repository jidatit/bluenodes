/* eslint-disable react/prop-types */
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function HeatingScheduleTable() {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const rowHeight = 20; // Each row represents 70 pixels

    // Dummy data for initial layouts
    const initialLayouts = {
        Monday: [
            { w: 1, h: 24, x: 0, y: 0, i: 'box-Monday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '20' }
        ],
        Tuesday: [
            { w: 1, h: 24, x: 0, y: 0, i: 'box-Tuesday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '22' }
        ],
        Wednesday: [
            { w: 1, h: 24, x: 0, y: 0, i: 'box-Wednesday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '21' }
        ],
        Thursday: [
            { w: 1, h: 24, x: 0, y: 0, i: 'box-Thursday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '19' }
        ],
        Friday: [
            { w: 1, h: 24, x: 0, y: 0, i: 'box-Friday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '18' }
        ],
        Saturday: [
            { w: 1, h: 24, x: 0, y: 0, i: 'box-Saturday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '23' }
        ],
        Sunday: [
            { w: 1, h: 24, x: 0, y: 0, i: 'box-Sunday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '20' }
        ]
    };

  
    const handleTempColour = (temp) => {
      if(temp===null){
        return '#CFF4FB'
      }
      if(temp===false){
        return '#FFFFFF'
      }
      else if(temp<10){
        return '#DEF7EC'
      }
      else if(temp>=10 && temp<20){
        return '#CFF4FB'
      }
      else if(temp>=20 && temp<=25){
        return '#FEECDC'
      }
      else if(temp>25){
        return '#FDE8E8'
      }
      else {
        return '#CFF4FB'
      }
    }
  
    const handleTextColour = (temp) => {
      if(temp===null){
        return '#0BAAC9'
      }
      if(temp===false){
        return '#C81E1E'
      }
      else if(temp<10){
        return '#046C4E'
      }
      else if(temp>=10 && temp<20){
        return '#0BAAC9'
      }
      else if(temp>=20 && temp<=25){
        return '#B43403'
      }
      else if(temp>25){
        return '#C81E1E'
      }
      else {
        return '#0BAAC9'
      }
    }

    return (
        <div className="flex flex-col gap-4 w-full px-2">
            <h3 className="text-[16px] text-gray-500 font-semibold">Heating Schedule</h3>
            <div className=''>
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', marginLeft: '60px', alignItems: 'center', marginBottom: '10px', zIndex: '1000' }}>
                    {daysOfWeek.map((day) => (
                        <div key={day} style={{ width: '100%', textAlign: 'center', position: 'relative', margin: '0' }}>
                            <div className="text-[#0BAAC9] bg-[#E7F9FD] w-full font-medium rounded-lg text-xs px-3 py-2 me-2 mb-2 border border-[#0BAAC9] flex items-center justify-between ">
                                {day}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', zIndex: '10' }}>
                    <div style={{ width: '60px' }}>
                        {Array.from({ length: 24 }).map((_, index) => (
                            <div key={index} style={{ height: `${rowHeight}px`, margin: '4px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                                {`${index.toString().padStart(2, '0')}:00`}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', width: '100%', position: 'relative', zIndex: '10' }}>
                        <div className={`  absolute top-[18px] left-0 bottom-0 right-0 w-full h-full flex flex-col gap-[22px] z-10`}>
                            {Array.from({ length: 24 }).map((_, index) => (
                                <div key={index} className='w-full border-t-2 border-[#E8E8E8] border-dotted z-10'></div>
                            ))}
                        </div>
                        {daysOfWeek.map((day) => (
                            <div key={day} style={{ width: '100%', margin: '0 ', position: 'relative', zIndex: '10' }}>
                                <GridLayout
                                    className="layout pt-[6px] z-10"
                                    compactType={null}
                                    layout={initialLayouts[day]}
                                    cols={1}
                                    rowHeight={14}
                                    width={150}
                                    isDraggable={false}
                                    isResizable={false}
                                >
                                    {initialLayouts[day].map((box) => (
                                        <div
                                            key={box.i}
                                            className={`box relative w-full !important rounded-md z-10 ${
                                              box.temperature === false ? 'border border-red-500' : ''
                                            }`}
                                            style={{
                                              backgroundColor: handleTempColour(box.temperature),
                                              color: handleTextColour(box.temperature),
                                            }}
                                        >
                                            <div style={{ padding: '10px 10px', position: 'relative', zIndex: '1', fontSize: '12px' }}>
                                                {box.temperature !== false ? (
                                                    box.temperature ? (
                                                        `${box.temperature}°C`
                                                    ) : (
                                                        'Fill in schedule'
                                                    )
                                                ) : (
                                                    <div>Fill in schedule</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </GridLayout>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeatingScheduleTable;