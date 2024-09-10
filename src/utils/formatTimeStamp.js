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
