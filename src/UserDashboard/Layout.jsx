/* eslint-disable react/prop-types */
import { Outlet } from 'react-router-dom';
import ExampleSidebar from './components/Sidebar';
import { SidebarProvider, useSidebarContext } from '../context/SidebarContext';
import classNames from 'classnames';

const Layout = () => {
    return (
        <SidebarProvider>
            <LayoutContent />
        </SidebarProvider>
    );
};

const LayoutContent = () => {

    return (
        <div className='w-full flex justify-start items-start min-h-screen relative'>
            <div className=' fixed top-0 left-0 bottom-0 z-20'>
                <ExampleSidebar />
            </div>
            <MainContent>
                <Outlet />
            </MainContent>
        </div>
    );
};

const MainContent = ({ children }) => {
    const { isCollapsed,isHovered } = useSidebarContext();

    return (
        <main
            className={classNames(
                "overflow-y-auto absolute top-0 left-0 right-0 bottom-0  bg-[#F9FAFB] z-10 p-6",
                !isCollapsed ? 'lg:ml-64' : (isHovered ? 'lg:ml-64' : 'lg:ml-16')
            )}
        >
            {children}
        </main>
    );
};

export default Layout;
