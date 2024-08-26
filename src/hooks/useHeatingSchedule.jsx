import { useState, useEffect } from "react";
import ApiUrls from "../globals/apiURL.js";
import axios from "axios";

const useHeatingSchedule = () => {
	const [createdHeatingScheduleNames, setCreatedHeatingScheduleNames] =
		useState([]);

	useEffect(() => {
		const fetchHeatingSchedules = async () => {
			try {
				const response = await axios.get(
					ApiUrls.SMARTHEATING_HEATINGSCHEDULE.LIST
				);
				const data = await response.data
				const templateNames =
					data.length > 0 ? data.map((template) => template.templateName) : [];
				setCreatedHeatingScheduleNames(templateNames);
			} catch (error) {
				console.error("Error:", error);
			}
		};

		fetchHeatingSchedules();
	}, []);

	return { createdHeatingScheduleNames, setCreatedHeatingScheduleNames };
};

export default useHeatingSchedule;
