import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextInput } from "flowbite-react";
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

  const handleLogin = async (e) => {
    e.preventDefault();

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
        <h1 className="font-semibold text-4xl mt-3">Willkommen!</h1>
        <h3 className="text-lg text-gray-700">
          Bitte nutzen Sie Ihre E-Mail Adresse und Ihr Passwort, um sich
          einzuloggen.
        </h3>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="w-full flex gap-2 flex-col justify-start items-start">
            <label htmlFor="email" className="font-medium pl-2">
              E-Mail
            </label>
            <TextInput
              value={email}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail-Adresse eingeben"
              className="w-full outline-none shadow-2xl"
              type="email"
            />
            <label htmlFor="password" className="font-medium pl-2">
              Passwort
            </label>
            <TextInput
              value={password}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="w-full outline-none shadow-2xl"
              type="password"
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className={`w-full py-2 rounded-[10px] bg-[#0BAAC9] text-base font-semibold text-white ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
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
