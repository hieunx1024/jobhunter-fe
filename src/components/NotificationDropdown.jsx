import { useState } from 'react';
import { Badge, Popover, List, Typography, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

const { Text } = Typography;

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications-last24h'],
        queryFn: async () => {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api/v1';
            const notificationUrl = baseUrl.replace('/v1', '/notifications/last24h');
            const res = await axiosClient.get(notificationUrl);
            return res.data;
        },
        refetchInterval: 60000 
    });

    const sortedNotifications = notifications ? [...notifications].sort((a, b) => {
        // Just fallback sort if backend didn't sort
        return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 50) : [];

    const content = (
        <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
            ) : (
                <List
                    dataSource={sortedNotifications}
                    renderItem={item => (
                        <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                            <List.Item.Meta
                                avatar={
                                    <div style={{ backgroundColor: '#e6f7ff', padding: '8px', borderRadius: '50%' }}>
                                        <BellOutlined style={{ color: '#1890ff' }} />
                                    </div>
                                }
                                title={<Text strong style={{ fontSize: '14px' }}>{item.message}</Text>}
                                description={
                                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {item.createdBy ? `Bởi: ${item.createdBy}` : ''}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                            {item.createdAt}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: 'Không có thông báo mới trong 24h qua' }}
                />
            )}
        </div>
    );

    return (
        <Popover
            content={content}
            title={<div style={{ padding: '8px 4px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold' }}>Thông báo hệ thống (24h)</div>}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            overlayInnerStyle={{ padding: 0 }}
        >
            <Badge count={notifications?.length || 0} size="small" style={{ marginRight: '16px' }}>
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#595959', marginRight: '16px' }} />
            </Badge>
        </Popover>
    );
};

export default NotificationDropdown;
