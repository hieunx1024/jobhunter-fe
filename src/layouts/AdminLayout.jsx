import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    FileText,
    LogOut,
    Menu as MenuIcon,
    Home,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const items = [
        {
            key: '/admin',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            onClick: () => navigate('/admin'),
        },
        {
            key: '/admin/users',
            icon: <Users size={20} />,
            label: 'Người dùng',
            onClick: () => navigate('/admin/users'),
        },
        {
            key: '/admin/companies',
            icon: <Building2 size={20} />,
            label: 'Quản lý Công ty',
            onClick: () => navigate('/admin/companies'),
        },
        {
            key: '/admin/jobs',
            icon: <Briefcase size={20} />,
            label: 'Việc làm',
            onClick: () => navigate('/admin/jobs'),
        },
        {
            key: '/admin/resumes',
            icon: <FileText size={20} />,
            label: 'Hồ sơ ứng tuyển',
            onClick: () => navigate('/admin/resumes'),
        },
    ];

    // Find current selected key
    const selectedKey = items.find(item => location.pathname.startsWith(item.key) && item.key !== '/admin' && item.key !== '/')?.key || location.pathname;

    const userMenu = {
        items: [
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogOut size={16} />,
                danger: true,
                onClick: handleLogout,
            }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Overlay for mobile drawer mode */}
            {!collapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-[1000] lg:hidden transition-opacity duration-300"
                    onClick={() => setCollapsed(true)}
                />
            )}
            <style>
                {`
                .admin-sider .ant-menu-item-selected {
                    background-color: #E6F0FA !important;
                    color: #0A65CC !important;
                    font-weight: 600 !important;
                    border-right: none !important;
                }
                .admin-sider .ant-menu-item-selected .anticon {
                    color: #0A65CC !important;
                }
                .admin-sider .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    color: #111827 !important;
                    background-color: #F9FAFB !important;
                }
                .admin-sider .ant-menu-item {
                    border-radius: 12px !important;
                    margin: 4px 12px !important;
                    width: calc(100% - 24px) !important;
                    transition: all 0.2s ease;
                    height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                    font-weight: 500;
                    color: #4B5563;
                }
                .admin-sider .ant-menu-title-content {
                    margin-inline-start: 12px !important;
                }
                .admin-sider .ant-layout-sider-children {
                    display: flex;
                    flex-direction: column;
                }
                /* Authoritative Table Styles for all Admin pages */
                .ant-table-wrapper .ant-table {
                    background: #ffffff !important;
                    border-radius: 12px !important;
                }
                .ant-table-header .ant-table-cell {
                    background: #f8fafc !important;
                    color: #475569 !important;
                    font-weight: 600 !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                .ant-table-cell {
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                /* Fix Pagination Colors */
                .ant-pagination .ant-pagination-item-active {
                    background-color: #102a43 !important;
                    border-color: #102a43 !important;
                }
                .ant-pagination .ant-pagination-item-active a {
                    color: #ffffff !important;
                }
                .ant-pagination .ant-pagination-item:not(.ant-pagination-item-active):hover {
                    border-color: #102a43 !important;
                }
                .ant-pagination .ant-pagination-item:not(.ant-pagination-item-active):hover a {
                    color: #102a43 !important;
                }
                .admin-main-layout {
                    transition: padding-left 0.2s ease-in-out;
                }
                @media (max-width: 991px) {
                    .admin-main-layout {
                        padding-left: 0 !important;
                    }
                }
                `}
            </style>

            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                collapsedWidth={0}
                breakpoint="lg"
                onCollapse={(value) => setCollapsed(value)}
                theme="light"
                width={260}
                className="admin-sider shadow-xl z-[1001] border-r border-gray-100"
                style={{
                    background: '#ffffff',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    height: '100vh',
                }}
            >
                <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 bg-white relative">
                    <Link to="/admin" className={`transition-all duration-300 flex items-center gap-3 group ${collapsed ? 'scale-0 w-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}>
                        <img src="/logo.svg" alt="Admin" className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
                        <h1 className="text-lg font-black text-gray-900 m-0 tracking-tight whitespace-nowrap group-hover:text-primary transition-colors">Admin Dashboard</h1>
                    </Link>

                    {!collapsed && (
                        <button 
                            onClick={() => setCollapsed(true)}
                            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto overflow-x-hidden py-4">
                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={items}
                        className="border-r-0"
                    />
                </div>

                <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
                    <Dropdown menu={userMenu} placement="topRight" trigger={['click']}>
                        <div className={`flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
                            <Avatar
                                size={40}
                                style={{ background: '#102a43', color: '#fff', fontWeight: 'bold' }}
                                className="shadow-sm border-2 border-white"
                            >
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="text-sm font-bold text-gray-900 truncate">
                                        {user?.name || 'Admin'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                                        Super Admin
                                    </span>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Sider>

            <Layout
                className="admin-main-layout min-h-screen"
                style={{ paddingLeft: collapsed ? 0 : 260 }}
            >
                <Header
                    style={{
                        padding: '0 24px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 64,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        borderBottom: '1px solid #f1f5f9'
                    }}
                >
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={<MenuIcon size={20} />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-gray-500 hover:text-primary hover:bg-gray-100 h-10 w-10 flex items-center justify-center rounded-lg transition-all"
                        />
                        <div className="hidden sm:flex items-center">
                            <span className="text-gray-400 text-sm font-medium italic">Chào mừng trở lại,</span>
                            <span className="text-gray-800 text-sm font-bold ml-1.5">{user?.name}</span>
                        </div>
                    </div>

                </Header>

                <Content
                    style={{
                        padding: '32px',
                        minHeight: 'calc(100vh - 64px)',
                        background: '#f8fafc',
                    }}
                >
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
