import React from 'react';
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { SectionHeader, EmptyState } from './SharedUI';

const SettingsView = React.memo(() => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black font-inter">
      <SectionHeader title="Settings" description="Manage your account preferences, goals, and integrations." />
      <EmptyState icon={Cog6ToothIcon} title="Settings Coming Soon!" description="Configure your personal writing environment here." />
    </div>
  );
});

export default SettingsView;