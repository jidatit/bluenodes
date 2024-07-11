/* eslint-disable react/prop-types */
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function HeatingScheduleComparison(props) {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const rowHeight = 20; // Each row represents 70 pixels

    // Dummy data for initial layouts
    const initialLayouts = {
        Monday: [{ w: 1, h: 24, x: 0, y: 0, i: 'box-Monday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '20' }],
        Tuesday: [{ w: 1, h: 24, x: 0, y: 0, i: 'box-Tuesday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '22' }],
        Wednesday: [{ w: 1, h: 24, x: 0, y: 0, i: 'box-Wednesday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '21' }],
        Thursday: [{ w: 1, h: 24, x: 0, y: 0, i: 'box-Thursday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '19' }],
        Friday: [{ w: 1, h: 24, x: 0, y: 0, i: 'box-Friday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '18' }],
        Saturday: [{ w: 1, h: 24, x: 0, y: 0, i: 'box-Saturday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '23' }],
        Sunday: [{ w: 1, h: 24, x: 0, y: 0, i: 'box-Sunday-1', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '20' }]
    };

    const initialLayouts2 = {
        Monday: [{ w: 1, h: 24, x: 1, y: 0, i: 'box-Monday-2', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '21' }],
        Tuesday: [{ w: 1, h: 24, x: 1, y: 0, i: 'box-Tuesday-2', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '16' }],
        Wednesday: [{ w: 1, h: 24, x: 1, y: 0, i: 'box-Wednesday-2', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '24' }],
        Thursday: [{ w: 1, h: 24, x: 1, y: 0, i: 'box-Thursday-2', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '10' }],
        Friday: [{ w: 1, h: 24, x: 1, y: 0, i: 'box-Friday-2', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '26' }],
        Saturday: [{ w: 1, h: 24, x: 1, y: 0, i: 'box-Saturday-2', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '2' }],
        Sunday: [{ w: 1, h: 24, x: 1, y: 0, i: 'box-Sunday-2', minW: 1, maxW: 2, minH: 1, maxH: 24, moved: false, static: false, temperature: '28' }]
    };

    const handleTempColour = (temp, lighter = false) => {
        let baseColor;
        if (temp === null) {
            baseColor = '#CFF4FB';
        } else if (temp === false) {
            baseColor = '#FFFFFF';
        } else if (temp < 10) {
            baseColor = '#DEF7EC';
        } else if (temp >= 10 && temp < 20) {
            baseColor = '#CFF4FB';
        } else if (temp >= 20 && temp <= 25) {
            baseColor = '#FEECDC';
        } else if (temp > 25) {
            baseColor = '#FDE8E8';
        } else {
            baseColor = '#CFF4FB';
        }
        return lighter ? `${baseColor}4D` : baseColor; // Add transparency to make it lighter
    };

    const handleTextColour = (temp) => {
        if (temp === null) {
            return '#0BAAC9';
        }
        if (temp === false) {
            return '#C81E1E';
        } else if (temp < 10) {
            return '#046C4E';
        } else if (temp >= 10 && temp < 20) {
            return '#0BAAC9';
        } else if (temp >= 20 && temp <= 25) {
            return '#B43403';
        } else if (temp > 25) {
            return '#C81E1E';
        } else {
            return '#0BAAC9';
        }
    };

    return (
        <div className={`flex flex-col gap-4 ${props.noHeading ? 'w-[98%]' : 'w-full'} px-2`}>
            {!props.noHeading && (
                <h3 className="text-[16px] text-gray-500 font-semibold">Heating Schedule</h3>
            )}
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
                        <div className={`absolute top-[18px] left-0 bottom-0 right-0 w-full h-full flex flex-col gap-[22px] z-10`}>
                            {Array.from({ length: 24 }).map((_, index) => (
                                <div key={index} className='w-full border-t-2 border-[#E8E8E8] border-dotted z-10'></div>
                            ))}
                        </div>
                        {daysOfWeek.map((day) => (
                            <div key={day} style={{ width: '100%', margin: '0 ', position: 'relative', zIndex: '10' }}>
                                <GridLayout
                                    className="layout pt-[6px] z-10 ax"
                                    compactType="horizontal" // Ensure horizontal layout
                                    layout={[...initialLayouts[day], ...initialLayouts2[day]]}
                                    cols={2} // Adjust cols based on number of items to display horizontally
                                    rowHeight={14}
                                    width={54 * 2} // Adjust width based on number of items and desired width
                                    isDraggable={false}
                                    isResizable={false}
                                >
                                    {[...initialLayouts[day], ...initialLayouts2[day]].map((item) => (
                                        <div
                                            key={item.i}
                                            data-grid={item}
                                            style={{
                                                backgroundColor: handleTempColour(item.temperature, item.i.includes('2')),
                                                color: handleTextColour(item.temperature),
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'start',
                                                justifyContent: 'center',
                                                fontSize: '9px',
                                                padding: '8px',
                                                border: item.i.includes('2') ? `1px solid ${handleTextColour(item.temperature)}` : 'none'
                                            }}
                                        >
                                            {item.temperature}°C
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

export default HeatingScheduleComparison;
