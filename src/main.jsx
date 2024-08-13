import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./AuthContext.jsx";
import { HeatingScheduleProvider } from "./hooks/HeatingScheduleContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<AuthProvider>
			<HeatingScheduleProvider>
				<App />
			</HeatingScheduleProvider>
		</AuthProvider>
	</React.StrictMode>,
);
