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
                    background-color: #f1f5f9 !important; /* slate-100 */
                    color: #0d9488 !important; /* teal-600 */
                    font-weight: 700;
                    border-right: 4px solid #0d9488;
                }
                .modern-hr-menu .ant-menu-item-selected .anticon {
                    color: #0d9488 !important;
                }
                .modern-hr-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
                    color: #0d9488 !important;
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
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                theme="light" 
                width={260}
                className="modern-sider shadow-sm z-20 border-r border-slate-100"
                style={{ background: '#ffffff', position: 'sticky', top: 0, height: '100vh' }}
            >
                <div className="h-20 flex items-center px-8 border-b border-slate-100 flex-shrink-0">
                    <div className={`transition-all duration-300 flex items-center gap-3 ${collapsed ? 'scale-0 w-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}>
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                            <span className="text-white font-black text-lg">H</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 m-0 tracking-tight">HR Portal</h1>
                    </div>
                    {collapsed && (
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10 mx-auto">
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

                <div className="p-6 border-t border-slate-100 flex-shrink-0 bg-white">

                    <Dropdown menu={userMenu} placement="top" trigger={['click']}>
                        <div className={`flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-[1.25rem] transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
                            <div className="p-0.5 rounded-full bg-slate-100 flex-shrink-0">
                                <Avatar
                                    size={40}
                                    style={{ background: '#0d9488', color: '#fff', fontWeight: 'bold' }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col overflow-hidden text-left">
                                    <span className="text-sm font-bold text-slate-800 truncate" title={user?.name}>
                                        {user?.name || 'Recruiter'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest leading-tight">
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
