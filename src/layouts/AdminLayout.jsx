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
        <Layout style={{ minHeight: '100vh', background: '#f5f7f9' }}>
            <style>
                {`
                .admin-sider .ant-menu {
                    background: transparent !important;
                    border-inline-end: none !important;
                }
                .admin-sider .ant-menu-item {
                    height: 48px !important;
                    line-height: 48px !important;
                    margin-block: 4px !important;
                    border-radius: 8px !important;
                    width: calc(100% - 16px) !important;
                    margin-inline: 8px !important;
                    color: #94a3b8 !important;
                }
                .admin-sider .ant-menu-item.ant-menu-item-selected {
                    background-color: #2563eb !important; /* blue-600 */
                    color: #ffffff !important;
                    font-weight: 600;
                }
                .admin-sider .ant-menu-item-selected .anticon {
                    color: #ffffff !important;
                }
                .admin-sider .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    color: #f1f5f9 !important;
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
                    border-bottom: 1px solid #e0e0e0 !important; /* Managed Grey Lines */
                }
                `}
            </style>
            
            <Sider 
                breakpoint="lg"
                collapsedWidth="0"
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                theme="dark" 
                width={260}
                className="admin-sider shadow-2xl"
                style={{ 
                    background: '#0f172a', 
                    position: 'fixed', 
                    left: 0, 
                    top: 0, 
                    height: '100vh',
                    zIndex: 1000 
                }}
            >
                <div className="h-20 flex items-center px-6 border-b border-white/5 mb-6">
                    <div className={`transition-all duration-300 flex items-center gap-3 ${collapsed ? 'scale-0 w-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}>
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                            <span className="text-brand-900 font-bold text-lg">A</span>
                        </div>
                        <h1 className="text-lg font-bold text-white m-0 tracking-tight">Admin Portal</h1>
                    </div>
                    {collapsed && (
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mx-auto">
                            <span className="text-brand-900 font-bold text-lg">A</span>
                        </div>
                    )}
                </div>
                
                <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={items}
                        className="border-r-0"
                    />
                </div>

                <div className="p-4 border-t border-white/5 bg-[#0f172a]">
                    <div className="mb-4 flex justify-center">
                        <NotificationDropdown />
                    </div>
                    <Dropdown menu={userMenu} placement="top" trigger={['click']}>
                        <div className={`flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}>
                            <Avatar
                                size={32}
                                className="bg-blue-700 text-white font-bold"
                            >
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            {!collapsed && (
                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className="text-sm font-semibold text-blue-200 truncate">
                                        {user?.name || 'Admin'}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-brand-900 tracking-wider">
                                        QUẢN TRỊ VIÊN
                                    </span>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Sider>
            
            <Layout className="transition-all duration-300" style={{ background: 'transparent', marginLeft: collapsed ? 0 : (window.innerWidth > 992 ? 260 : 0) }}>
                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-[#0f172a] shadow-md flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-900 font-black text-xs">A</div>
                        <span className="font-bold text-white uppercase tracking-wider text-sm">Admin Portal</span>
                    </div>
                </div>

                <Content
                    style={{
                        margin: window.innerWidth > 768 ? '32px' : '16px',
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
