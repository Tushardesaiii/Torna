import React from 'react';
import { TrophyIcon } from "@heroicons/react/24/outline";
import { SectionHeader, EmptyState } from './SharedUI';

const AchievementsView = React.memo(() => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black font-inter">
      <SectionHeader title="Your Achievements" description="View all your unlocked milestones and progress badges." />
      <EmptyState icon={TrophyIcon} title="More Achievements Coming!" description="Keep writing to unlock more exciting milestones and badges." />
    </div>
  );
});

export default AchievementsView;