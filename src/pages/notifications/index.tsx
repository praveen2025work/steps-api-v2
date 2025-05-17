import { NextPage } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import NotificationsCenter from '@/components/notifications/NotificationsCenter';

const NotificationsPage: NextPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        </div>
        <NotificationsCenter />
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;