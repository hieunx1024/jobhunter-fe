import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    BankOutlined,
    FileTextOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AuditOutlined,
    HomeOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
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
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/hr'),
        },
        ...(user?.company ? [
            {
                key: '/hr/jobs',
                icon: <AuditOutlined />,
                label: 'Tin tuyển dụng',
                onClick: () => navigate('/hr/jobs'),
            },
            {
                key: '/hr/resumes',
                icon: <FileTextOutlined />,
                label: 'Quản lý Ứng viên',
                onClick: () => navigate('/hr/resumes'),
            },
            {
                key: '/hr/company',
                icon: <BankOutlined />,
                label: 'Thông tin Công ty',
                onClick: () => navigate('/hr/company'),
            },
            {
                key: '/hr/pricing',
                icon: <CreditCardOutlined />,
                label: 'Gói dịch vụ',
                onClick: () => navigate('/hr/pricing'),
            }
        ] : [
            {
                key: '/hr/company',
                icon: <BankOutlined />,
                label: 'Đăng ký công ty',
                onClick: () => navigate('/hr/company'),
            }
        ]),
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
            onClick: () => navigate('/'),
        }
    ];

    // Find current selected key (exact match or prefix)
    const selectedKey = items.find(item => location.pathname === item.key || (item.key !== '/hr' && item.key !== '/' && location.pathname.startsWith(item.key)))?.key || '/hr';

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Hồ sơ cá nhân',
                icon: <UserOutlined />,
                onClick: () => navigate('/profile'),
            },
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
                .modern-hr-menu .ant-menu-item-selected {
                    background-color: #eff6ff !important; /* blue-50 */
                    color: #2563eb !important; /* blue-600 */
                    font-weight: 700;
                    border-right: 4px solid #3b82f6; /* blue-500 */
                }
                .modern-hr-menu .ant-menu-item-selected .anticon {
                    color: #2563eb !important;
                }
                .modern-hr-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    color: #2563eb !important;
                    background-color: #f8fafc !important;
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
                }
                .modern-sider .ant-layout-sider-children {
                    display: flex;
                    flex-direction: column;
                }
                `}
            </style>

            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme="light"
                width={260}
                className="modern-sider shadow-sm z-50 border-r border-blue-100"
                style={{
                    background: '#ffffff',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    height: '100vh',
                    zIndex: 1000
                }}
            >
                <div className="h-20 flex items-center px-8 border-b border-blue-100 flex-shrink-0">
                    <div className={`transition-all duration-300 flex items-center gap-3 ${collapsed ? 'scale-0 w-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}>
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-black text-lg">H</span>
                        </div>
                        <h1 className="text-xl font-bold text-brand-900 m-0 tracking-tight">HR SITE</h1>
                    </div>
                    {collapsed && (
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto">
                            <span className="text-white font-black text-lg">H</span>
                        </div>
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

                <div className="p-6 border-t border-blue-100 flex-shrink-0 bg-white">

                    <Dropdown menu={userMenu} placement="top" trigger={['click']}>
                        <div className={`flex items-center gap-4 cursor-pointer hover:bg-blue-50 p-2 rounded-[1.25rem] transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
                            <div className="p-0.5 rounded-full bg-blue-100 flex-shrink-0">
                                <Avatar
                                    size={40}
                                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)', color: '#fff', fontWeight: 'bold' }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="text-sm font-bold text-blue-800 truncate" title={user?.name}>
                                        {user?.name || 'Recruiter'}
                                    </span>
                                    <span className="text-[10px] font-bold text-blue-400 truncate uppercase tracking-widest leading-tight">
                                        {user?.company ? user.company.name : 'Người tuyển dụng'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Sider>

            <Layout className="transition-all duration-300" style={{ background: 'transparent', marginLeft: collapsed ? 0 : (window.innerWidth > 992 ? 260 : 0) }}>
                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">H</div>
                        <span className="font-bold text-brand-900">Hr</span>
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

export default RecruiterLayout;
