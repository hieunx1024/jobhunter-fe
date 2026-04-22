import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    BankOutlined,
    FileProtectOutlined,
    AuditOutlined,
    FileTextOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined
} from '@ant-design/icons';
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
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/admin'),
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'Users',
            onClick: () => navigate('/admin/users'),
        },
        {
            key: '/admin/companies',
            icon: <BankOutlined />,
            label: 'Companies',
            onClick: () => navigate('/admin/companies'),
        },
        {
            key: '/admin/company-approvals',
            icon: <FileProtectOutlined />,
            label: 'Approvals',
            onClick: () => navigate('/admin/company-approvals'),
        },
        {
            key: '/admin/jobs',
            icon: <AuditOutlined />,
            label: 'Jobs',
            onClick: () => navigate('/admin/jobs'),
        },
        {
            key: '/admin/resumes',
            icon: <FileTextOutlined />,
            label: 'Resumes',
            onClick: () => navigate('/admin/resumes'),
        },
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
            onClick: () => navigate('/'),
        },
    ];

    // Find current selected key
    const selectedKey = items.find(item => location.pathname.startsWith(item.key) && item.key !== '/admin' && item.key !== '/')?.key || location.pathname;

    const userMenu = {
        items: [
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout,
            }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Custom CSS overrides for AntD Menu to match the new gradient theme */}
            <style>
                {`
                .modern-admin-menu .ant-menu-item-selected {
                    background: linear-gradient(90deg, #eff6ff 0%, #e0e7ff 100%) !important;
                    color: #4f46e5 !important;
                    font-weight: 600;
                    border-right: 3px solid #4f46e5;
                }
                .modern-admin-menu .ant-menu-item-selected .anticon {
                    color: #4f46e5 !important;
                }
                .modern-admin-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    color: #4f46e5 !important;
                    background-color: #f8fafc !important;
                }
                .modern-admin-menu .ant-menu-item {
                    border-radius: 0 16px 16px 0 !important;
                    margin-right: 16px !important;
                    width: calc(100% - 16px) !important;
                    transition: all 0.3s ease;
                }
                .modern-sider .ant-layout-sider-children {
                    display: flex;
                    flex-direction: column;
                }
                `}
            </style>
            
            <Sider 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                theme="light" 
                width={260}
                className="modern-sider shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 border-r border-gray-100"
                style={{ background: '#ffffff', position: 'sticky', top: 0, height: '100vh' }}
            >
                <div className="h-24 flex items-center justify-center border-b border-gray-50 flex-shrink-0">
                    <div className={`transition-all duration-300 flex items-center gap-3 ${collapsed ? 'scale-0 w-0 opacity-0 hidden' : 'scale-100 opacity-100 px-4 mt-2'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-black text-xl">A</span>
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent m-0 whitespace-nowrap tracking-tight">
                            Admin Portal
                        </h1>
                    </div>
                    {collapsed && (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mt-2">
                            <span className="text-white font-black text-xl">A</span>
                        </div>
                    )}
                </div>
                
                <div className="py-6 flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={items}
                        className="modern-admin-menu border-r-0"
                    />
                </div>

                <div className="p-4 border-t border-gray-50 flex-shrink-0 bg-white">
                    <div className="mb-2 flex justify-center">
                        <NotificationDropdown />
                    </div>
                    <Dropdown menu={userMenu} placement="top" trigger={['click']}>
                        <div className={`flex items-center gap-3 cursor-pointer hover:bg-indigo-50 p-2 rounded-2xl transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
                            <div className="p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm flex-shrink-0">
                                <Avatar
                                    size={38}
                                    style={{ background: '#fff', color: '#4f46e5', fontWeight: 'bold' }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-gray-800 truncate" title={user?.name}>
                                        {user?.name || 'Admin'}
                                    </span>
                                    <span className="text-xs font-medium text-indigo-500 truncate" title="Hệ thống">
                                        Quản trị viên
                                    </span>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Sider>
            
            <Layout style={{ background: 'transparent' }}>
                <Content
                    style={{
                        margin: '32px',
                        padding: 0,
                        minHeight: 280,
                        background: 'transparent',
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
