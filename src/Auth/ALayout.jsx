import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { NAVIGATION_PATH } from "../globals/navPaths";
const ALayout = () => {
  const { isAuthenticated, loading } = useAuth();

  const Loader = () => (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 opacity-75 z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
    </div>
  );

  if (loading) {
    return <Loader />;
  }

  return !isAuthenticated ? (
    <div className="w-full relative min-h-screen flex flex-col justify-center items-center bg-[#003049]">
      <Outlet />
    </div>
  ) : (
    <Navigate to={NAVIGATION_PATH.dashboardLayout} />
  );
};

export default ALayout;
