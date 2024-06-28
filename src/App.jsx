import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NAVIGATION_PATH } from './globals/navPaths';
import Layout from './UserDashboard/Layout';
import HeatingSchedulePage from './UserDashboard/pages/HeatingSchedule';
import MainPage from './UserDashboard/pages/StatusPage/MainPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
         <Route path={NAVIGATION_PATH.userdashboard} element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route exact path={NAVIGATION_PATH.heatingprograms} element={<HeatingSchedulePage/>} />
          </Route>
        {/* Add more routes for additional navigation paths */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
