import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import ApiUrls from "./globals/apiURL.js";

const AuthContext = createContext();

export const useAuth = () => {
	return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	const isTokenValid = async (token) => {
		try {
			const resp = await axios.get(ApiUrls.USER.PROFILE, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return resp.status === 200;
		} catch (error) {
			console.error("Token validation error:", error.message);
			return false;
		}
	};

	const validateAndSetAuth = async (currentToken) => {
		if (currentToken) {
			const valid = await isTokenValid(currentToken);
			if (valid) {
				setToken(currentToken);
				setIsAuthenticated(true);
			} else {
				logout();
			}
		} else {
			setIsAuthenticated(false);
		}
		setLoading(false);
	};

	// Validate the token on initial load
	useEffect(() => {
		validateAndSetAuth(token);
	}, []);

	// Listen for token changes
	useEffect(() => {
		const handleStorageChange = (event) => {
			if (event.key === "token") {
				validateAndSetAuth(event.newValue);
			}
		};

		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	useEffect(() => {
		if (token !== localStorage.getItem("token")) {
			validateAndSetAuth(token);
		}
	}, [token]);

	const login = (newToken) => {
		localStorage.setItem("token", newToken);
		setToken(newToken);
		setIsAuthenticated(true);
		setLoading(false);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider
			value={{ token, isAuthenticated, login, logout, loading }}
		>
			{children}
		</AuthContext.Provider>
	);
};
