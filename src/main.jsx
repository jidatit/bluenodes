import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./AuthContext.jsx";
import axios from "axios";
import ApiUrls from "./globals/apiURL.js";

axios.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token');

		if (token) {
			config.headers['Authorization'] = 'Bearer ' + token;
		}
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);
axios.defaults.baseURL = ApiUrls.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</React.StrictMode>,
);
