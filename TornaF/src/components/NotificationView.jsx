import React from 'react';
import { BellIcon } from "@heroicons/react/24/outline";
import { SectionHeader, EmptyState } from './SharedUI';

const NotificationsView = React.memo(() => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black font-inter">
      <SectionHeader title="Your Notifications" description="Catch up on all your alerts, updates, and collaborative activities." />
      <EmptyState icon={BellIcon} title="All Caught Up!" description="No new notifications. Your inbox is clean!" />
    </div>
  );
});

export default NotificationsView;