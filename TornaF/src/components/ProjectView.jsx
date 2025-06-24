import React from 'react';
import { FolderOpenIcon } from "@heroicons/react/24/outline";
import { SectionHeader, EmptyState } from './SharedUI'; // Assuming you put shared components in SharedUI.jsx

const ProjectsView = React.memo(() => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black font-inter">
      <SectionHeader title="All Projects" description="A comprehensive list of all your creative endeavors." />
      {/* You'd render a dedicated ProjectsList component here that fetches and displays projects */}
      <EmptyState icon={FolderOpenIcon} title="Feature Coming Soon!" description="The full Projects list and management will be available shortly." />
    </div>
  );
});

export default ProjectsView;