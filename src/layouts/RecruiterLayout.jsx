import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
    LayoutDashboard,
    Briefcase,
    Users2,
    Building2,
    CreditCard,
    User,
    LogOut,
    Menu as MenuIcon,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const RecruiterLayout = () => {
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
            key: '/hr',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            onClick: () => navigate('/hr'),
        },
        ...(user?.company ? [
            {
                key: '/hr/jobs',
                icon: <Briefcase size={20} />,
                label: 'Tin tuyển dụng',
                onClick: () => navigate('/hr/jobs'),
            },
            {
                key: '/hr/resumes',
                icon: <Users2 size={20} />,
                label: 'Quản lý Ứng viên',
                onClick: () => navigate('/hr/resumes'),
            },
            {
                key: '/hr/company',
                icon: <Building2 size={20} />,
                label: 'Thông tin Công ty',
                onClick: () => navigate('/hr/company'),
            },
            {
                key: '/hr/pricing',
                icon: <CreditCard size={20} />,
                label: 'Gói dịch vụ',
                onClick: () => navigate('/hr/pricing'),
            }
        ] : [
            {
                key: '/hr/company',
                icon: <Building2 size={20} />,
                label: 'Đăng ký công ty',
                onClick: () => navigate('/hr/company'),
            }
        ]),
    ];

    // Find current selected key (exact match or prefix)
    const selectedKey = items.find(item => location.pathname === item.key || (item.key !== '/hr' && item.key !== '/' && location.pathname.startsWith(item.key)))?.key || '/hr';

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Hồ sơ cá nhân',
                icon: <User size={16} />,
                onClick: () => navigate('/hr/profile'),
            },
            {
                type: 'divider',
            },
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
            <style>
                {`
                .modern-hr-menu .ant-menu-item-selected {
                    background-color: #E6F0FA !important;
                    color: #0A65CC !important;
                    font-weight: 600 !important;
                    border-right: none !important;
                }
                .modern-hr-menu .ant-menu-item-selected .anticon {
                    color: #0A65CC !important;
                }
                .modern-hr-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    color: #111827 !important;
                    background-color: #F9FAFB !important;
                }
                .modern-hr-menu .ant-menu-item {
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
                .modern-hr-menu .ant-menu-title-content {
                    margin-inline-start: 12px !important;
                }
                .modern-sider .ant-layout-sider-children {
                    display: flex;
                    flex-direction: column;
                }
                .hr-main-layout {
                    transition: padding-left 0.2s ease-in-out;
                }
                @media (max-width: 991px) {
                    .hr-main-layout {
                        padding-left: 0 !important;
                    }
                }
                `}
            </style>

            {/* Mobile background overlay */}
            {!collapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-[1000] lg:hidden transition-opacity duration-300"
                    onClick={() => setCollapsed(true)}
                />
            )}

            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                trigger={null}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme="light"
                width={260}
                className="modern-sider shadow-xl z-[1001] border-r border-gray-100"
                style={{
                    background: '#ffffff',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                }}
            >
                <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 bg-white relative">
                    <Link to="/hr" className={`transition-all duration-300 flex items-center gap-3 group ${collapsed ? 'scale-0 w-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}>
                        <img src="/logo.svg" alt="JobHunter" className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
                        <h1 className="text-xl font-black text-gray-900 m-0 tracking-tight group-hover:text-primary transition-colors">JobHunter</h1>
                    </Link>

                    {/* Close button for mobile */}
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="py-6 flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={items}
                        className="modern-hr-menu border-r-0"
                    />
                </div>

                <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
                    <Dropdown menu={userMenu} placement="top" trigger={['click']}>
                        <div className={`flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors duration-200 border border-transparent hover:border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
                            <div className="p-0 flex-shrink-0">
                                <Avatar
                                    size={40}
                                    style={{ background: '#0A65CC', color: '#fff', fontWeight: 'bold' }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="text-sm font-semibold text-gray-900 truncate" title={user?.name}>
                                        {user?.name || 'Recruiter'}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate">
                                        {user?.company ? user.company.name : 'Người tuyển dụng'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Sider>

            <Layout
                className="hr-main-layout min-h-screen bg-background"
                style={{ paddingLeft: collapsed ? 0 : 260 }}
            >
                {/* Header for Desktop & Mobile */}
                <Header
                    style={{
                        padding: '0 24px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        left: collapsed ? 0 : 260,
                        zIndex: 1000,
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'left 0.2s ease-in-out'
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
                        padding: '24px',
                        minHeight: 'calc(100vh - 64px)',
                        marginTop: 64,
                        background: 'transparent',
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

export default RecruiterLayout;
