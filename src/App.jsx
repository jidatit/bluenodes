import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NAVIGATION_PATH } from './globals/navPaths';
import Layout from './UserDashboard/Layout';
import HeatingSchedulePage from './UserDashboard/pages/HeatingSchedule';
import MainPage from './UserDashboard/pages/StatusPage/MainPage';
import OverviewPage from './UserDashboard/pages/OperationalOverview';
import DeviceManagementPage from "./UserDashboard/pages/DeviceManagement"
import Loginpage from './Auth/Loginpage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
         <Route path={NAVIGATION_PATH.statuspage} element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route exact path={NAVIGATION_PATH.heatingprograms} element={<HeatingSchedulePage/>} />
            <Route exact path={NAVIGATION_PATH.operationalOverview} element={<OverviewPage/>} />
            <Route exact path={NAVIGATION_PATH.deviceManagement} element={<DeviceManagementPage/>} />
          </Route>
         <Route path={NAVIGATION_PATH.login} element={<Loginpage />} />
        {/* Add more routes for additional navigation paths */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
