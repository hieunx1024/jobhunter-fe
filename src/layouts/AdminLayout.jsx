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
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="shadow-md z-10">
                <div className="h-16 flex items-center justify-center border-b">
                    <h1 className={`text-xl font-bold text-blue-600 transition-all ${collapsed ? 'scale-0 w-0' : 'scale-100'}`}>
                        JobHunter
                    </h1>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={items}
                    className="border-r-0 mt-2"
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-4 shadow-sm z-10 sticky top-0">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />

                    <div className="flex items-center gap-4 pr-4">
                        <NotificationDropdown />
                        <span className="text-sm font-medium text-gray-600 hidden sm:block">
                            Xin chào, {user?.name || 'Admin'}
                        </span>
                        <Dropdown menu={userMenu} placement="bottomRight">
                            <Avatar
                                style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}
                                icon={<UserOutlined />}
                            >
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflowY: 'auto'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
