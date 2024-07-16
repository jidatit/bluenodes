import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { NAVIGATION_PATH } from './globals/navPaths';
import Layout from './UserDashboard/Layout';
import HeatingSchedulePage from './UserDashboard/pages/HeatingSchedule';
import MainPage from './UserDashboard/pages/StatusPage/MainPage';
import OverviewPage from './UserDashboard/pages/OperationalOverview';
import DeviceManagementPage from "./UserDashboard/pages/DeviceManagement";
import Loginpage from './Auth/Loginpage';
import Signuppage from './Auth/SignupPage';
import { useAuth } from './AuthContext';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path={NAVIGATION_PATH.login} element={<Loginpage />} />
            <Route path={NAVIGATION_PATH.signup} element={<Signuppage />} />
            <Route path="*" element={<Navigate to={NAVIGATION_PATH.login} />} />
          </>
        ) : (
          <Route path={NAVIGATION_PATH.statuspage} element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path={NAVIGATION_PATH.heatingprograms} element={<HeatingSchedulePage />} />
            <Route path={NAVIGATION_PATH.operationalOverview} element={<OverviewPage />} />
            <Route path={NAVIGATION_PATH.deviceManagement} element={<DeviceManagementPage />} />
            <Route path="*" element={<Navigate to={NAVIGATION_PATH.statuspage} />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
