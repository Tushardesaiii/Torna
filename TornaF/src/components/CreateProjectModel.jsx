import React from 'react';
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal, InputField, Button } from './SharedUI';

const CreateProjectModal = React.memo(({
  isOpen,
  onClose,
  newProjectTitle,
  setNewProjectTitle,
  newProjectDescription,
  setNewProjectDescription,
  projectError,
  isCreatingProject,
  handleCreateProject, // This will likely need to be passed down from the parent (DashboardPage)
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); setNewProjectTitle(""); setNewProjectDescription(""); }} // Clear state on close
      title="Create New Project"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
        <InputField
          id="newProjectTitle"
          label="Project Title"
          type="text"
          value={newProjectTitle}
          onChange={(e) => setNewProjectTitle(e.target.value)}
          placeholder="My Epic Novel"
          required
          error={projectError && newProjectTitle.trim() === "" ? projectError : null}
        />
        <InputField
          id="newProjectDescription"
          label="Description (Optional)"
          multiline
          rows={3}
          value={newProjectDescription}
          onChange={(e) => setNewProjectDescription(e.target.value)}
          placeholder="A brief overview of my awesome project..."
          className="mb-6"
        />
        {projectError && <p className="text-red-400 text-sm mb-4">{projectError}</p>}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={() => { onClose(); setNewProjectTitle(""); setNewProjectDescription(""); }} // Clear state on cancel
            primary={false}
            disabled={isCreatingProject}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            primary
            disabled={isCreatingProject}
            icon={isCreatingProject ? ArrowPathIcon : PlusIcon}
            className={isCreatingProject ? 'animate-pulse' : ''}
          >
            {isCreatingProject ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

export default CreateProjectModal;