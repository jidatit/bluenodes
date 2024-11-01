import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { NAVIGATION_PATH } from "./globals/navPaths";
import Layout from "./UserDashboard/Layout";
import HeatingSchedulePage from "./UserDashboard/pages/HeatingSchedule";
import MainPage from "./UserDashboard/pages/StatusPage/MainPage";
import OverviewPage from "./UserDashboard/pages/OperationalOverview";
import DeviceManagementPage from "./UserDashboard/pages/DeviceManagement";
import Loginpage from "./Auth/Loginpage";
import Signuppage from "./Auth/SignupPage";
import ALayout from "./Auth/ALayout";
import { AuthProvider } from "./AuthContext";
import Onboarding from "./UserDashboard/pages/OnBoarding";
const STAGE = import.meta.env.VITE_STAGE;
const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path={NAVIGATION_PATH.authLayout} element={<ALayout />}>
          <Route index element={<Loginpage />} />
          <Route path={NAVIGATION_PATH.signup} element={<Signuppage />} />
        </Route>

        <Route path={NAVIGATION_PATH.dashboardLayout} element={<Layout />}>
          <Route index element={<MainPage />} />
          <Route
            path={NAVIGATION_PATH.heatingprograms}
            element={<HeatingSchedulePage />}
          />
          <Route
            path={NAVIGATION_PATH.operationalOverview}
            element={<OverviewPage />}
          />
          <Route
            path={NAVIGATION_PATH.deviceManagement}
            element={<DeviceManagementPage />}
          />
         {STAGE === "dev" && (
          <Route path={NAVIGATION_PATH.onboarding} element={<Onboarding />} />
         )}
          <Route
            path="*"
            element={<Navigate to={NAVIGATION_PATH.statuspage} />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to={NAVIGATION_PATH.authLayout} />}
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
