import { Outlet, Navigate } from "react-router-dom";
import ExampleSidebar from "./components/Sidebar";
import classNames from "classnames";
import { useAuth } from "../AuthContext";
import { NAVIGATION_PATH } from "../globals/navPaths";
import { SidebarProvider, useSidebarContext } from "../context/SidebarContext";

const Loader = () => (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 opacity-75 z-50">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);
const Layout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

const LayoutContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return isAuthenticated ? (
    <div className="w-full flex justify-start items-start min-h-screen relative">
      <div className=" fixed top-0 left-0 bottom-0 z-20">
        <ExampleSidebar />
      </div>
      <MainContent>
        <Outlet />
      </MainContent>
    </div>
  ) : (
    <Navigate to={NAVIGATION_PATH.authLayout} />
  );
};

const MainContent = ({ children }) => {
  const { isCollapsed, isHovered } = useSidebarContext();

  return (
    <main
      className={classNames(
        "overflow-y-auto absolute top-0 left-0 right-0 bottom-0  bg-[#F9FAFB] z-10 p-6",
        !isCollapsed ? "lg:ml-64" : isHovered ? "lg:ml-64" : "lg:ml-16"
      )}
    >
      {children}
    </main>
  );
};

export default Layout;
