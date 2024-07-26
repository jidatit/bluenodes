import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
	return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setloading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			setToken(token);
			setIsAuthenticated(true);
		}
		setloading(false);
	}, []);

	const login = (token) => {
		localStorage.setItem("token", token);
		setToken(token);
		setIsAuthenticated(true);
		setloading(false);
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
