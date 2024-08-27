import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Label, TextInput } from "flowbite-react";
import { FcGoogle } from "react-icons/fc";
import authImage from "../assets/images/auth-image.png";
import BlueNodeLogo from "../assets/logos/bluenodeslogohigh.png";
import { useAuth } from "../AuthContext";
import ApiUrls from "../globals/apiURL.js";
import axios from "axios";

const Loginpage = () => {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	// useEffect(() => {
	// 	const token = localStorage.getItem("token");
	// 	if (token) {
	// 		navigate("/");
	// 	}
	// }, [navigate]);

	const handleLogin = async () => {
		if (!email || !password) {
			setError("Please fill in both fields.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await axios.post(ApiUrls.AUTH_LOGIN, {
				email: email,
				password: password,
			});
			const data = response.data;
			const token = data.access_token;
			login(token);
			navigate("/dashboard");
		} catch (error) {
			setError("Invalid email or password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full h-screen flex flex-row justify-center items-center">
			<div className="w-[50%] h-full flex flex-col justify-center items-center gap-5 px-24 bg-[#F1F1F1]">
				<img
					src={BlueNodeLogo}
					alt="Blue Node Logo"
					className="w-[35%] h-auto"
				/>
				<h1 className="font-semibold text-4xl mt-3"> Welcome Back </h1>
				<h3 className="text-lg text-gray-700">
					{" "}
					Welcome back! Please enter your details.{" "}
				</h3>
				<div className="w-full flex gap-2 flex-col justify-start items-start">
					<label htmlFor="email" className="font-medium pl-2">
						{" "}
						Email{" "}
					</label>
					<TextInput
						value={email}
						id="email"
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email"
						className="w-full outline-none shadow-2xl"
						type="email"
					/>
					<label htmlFor="password" className="font-medium pl-2">
						{" "}
						Password{" "}
					</label>
					<TextInput
						value={password}
						id="password"
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
						className="w-full outline-none shadow-2xl"
						type="password"
					/>
				</div>
				{error && <div className="text-red-500">{error}</div>}
				{/* <div className="w-full flex flex-row justify-between items-start">
					<div className="flex gap-2 px-2">
						<Checkbox id="agree" className="border border-black" />
						<Label htmlFor="agree" className="flex">
							Remember for 30 days
						</Label>
					</div>
					<h2 className="text-[#0DC8ED] text-base cursor-pointer">
						{" "}
						Forget Password{" "}
					</h2>
				</div> */}
				<button
					onClick={handleLogin}
					className={`w-full py-2 rounded-[10px] bg-[#0BAAC9] text-base font-semibold text-white ${
						loading ? "opacity-50 cursor-not-allowed" : ""
					}`}
					disabled={loading}
				>
					{loading ? "Logging in..." : "Login"}
				</button>
				{/* <button className="w-full flex flex-row justify-center items-center gap-2 py-2 rounded-[10px] bg-[white] border-2 border-[#0BAAC9] text-base font-medium text-black">
					<FcGoogle className="text-3xl" />
					<p>Log in with Google</p>
				</button> */}
				{/* <div className="w-full flex flex-row justify-center items-start gap-1">
					<p className="text-base text-gray-700"> Don’t have an account? </p>
					<h2
						className="text-[#0DC8ED] text-base cursor-pointer font-semibold"
						onClick={() => navigate("/auth/signup")}
					>
						{" "}
						Sign up{" "}
					</h2>
				</div> */}
			</div>

			<div className="w-[50%] h-full flex flex-col justify-center items-center overflow-hidden">
				<img
					src={authImage}
					alt="Login Route Image"
					className="w-full h-full object-cover"
				/>
			</div>
		</div>
	);
};

export default Loginpage;
