import { useState, useEffect } from 'react';

const useHeatingSchedule = () => {
  const [createdHeatingScheduleNames, setCreatedHeatingScheduleNames] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHeatingSchedules = async () => {
      try {
        const response = await fetch(
          'https://api-dev.blue-nodes.app/dev/smartheating/heatingschedule/list',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const templateNames =
          data.length > 0
            ? data.map((template) => template.templateName)
            : [];
        setCreatedHeatingScheduleNames(templateNames);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchHeatingSchedules();
  }, []);

  return { createdHeatingScheduleNames };
};

export default useHeatingSchedule;