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
                    background: linear-gradient(90deg, #eff6ff 0%, #e0e7ff 100%) !important;
                    color: #4f46e5 !important;
                    font-weight: 600;
                    border-right: 3px solid #4f46e5;
                }
                .modern-hr-menu .ant-menu-item-selected .anticon {
                    color: #4f46e5 !important;
                }
                .modern-hr-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    color: #4f46e5 !important;
                    background-color: #f8fafc !important;
                }
                .modern-hr-menu .ant-menu-item {
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
                            <span className="text-white font-black text-xl">H</span>
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent m-0 whitespace-nowrap tracking-tight">
                            HR Portal
                        </h1>
                    </div>
                    {collapsed && (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mt-2">
                            <span className="text-white font-black text-xl">H</span>
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

                <div className="p-4 border-t border-gray-50 flex-shrink-0 bg-white">
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
                                        {user?.name || 'Recruiter'}
                                    </span>
                                    <span className="text-xs font-medium text-indigo-500 truncate" title={user?.company?.name || 'Người tuyển dụng'}>
                                        {user?.company ? user.company.name : 'Người tuyển dụng'}
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

export default RecruiterLayout;
