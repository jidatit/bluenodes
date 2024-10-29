const formatTimestamp = (timestamp) => {
	if (!timestamp) return "--";

	const date = new Date(timestamp);

	// Get individual components for formatting
	const day = String(date.getDate()).padStart(2, "0"); // DD
	const month = String(date.getMonth() + 1).padStart(2, "0"); // MM (month is zero-based)
	const year = String(date.getFullYear()).slice(-2); // YY
	const hours = String(date.getHours()).padStart(2, "0"); // HH
	const minutes = String(date.getMinutes()).padStart(2, "0"); // MM

	// Format the timestamp as DD.MM.YY HH:MM
	return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export default formatTimestamp;

const convertUTCToGermanTime = (utcDateTimeString) => {
	const date = new Date(utcDateTimeString);

	// Manually format the date and time in German timezone
	const options = {
		timeZone: "Europe/Berlin",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	};

	// Extract year, month, day, hour, minute, second using Intl.DateTimeFormat
	const dateFormatter = new Intl.DateTimeFormat("de-DE", options);
	const parts = dateFormatter.formatToParts(date);

	const year = parts.find((part) => part.type === "year").value;
	const month = parts.find((part) => part.type === "month").value;
	const day = parts.find((part) => part.type === "day").value;
	const hour = parts.find((part) => part.type === "hour").value;
	const minute = parts.find((part) => part.type === "minute").value;
	const second = parts.find((part) => part.type === "second").value;

	// Extract milliseconds from the original UTC string
	const milliseconds = utcDateTimeString.split(".")[1].replace("Z", "");

	// Construct the final date-time string in ISO format
	const formattedDateTime = `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}Z`;
	return formattedDateTime;
};
