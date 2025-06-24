import React from 'react';
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Modal, InputField, Button } from './SharedUI';

const CreateDocumentModal = React.memo(({
  isOpen,
  onClose,
  newDocumentTitle,
  setNewDocumentTitle,
  newDocumentProjectId,
  setNewDocumentProjectId,
  documentError,
  isCreatingDocument,
  handleCreateDocument,
  availableProjects,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setNewDocumentTitle("");
        setNewDocumentProjectId("");
      }}
      title="Create New Document"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreateDocument();
      }}>
        <InputField
          id="newDocumentTitle"
          label="Document Title"
          type="text"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="Chapter 1: The Beginning"
          required
          error={documentError && newDocumentTitle.trim() === "" ? documentError : null}
        />

        {availableProjects.length > 0 && (
          <div className="mb-6">
            <label htmlFor="documentProject" className="block text-zinc-400 text-sm font-medium mb-1.5">
              Associate with Project (Optional)
            </label>
            <select
              id="documentProject"
              value={newDocumentProjectId}
              onChange={(e) => setNewDocumentProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm
                focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">No Project</option>
              {availableProjects.map(project => (
                <option key={project._id} value={project._id}>{project.title}</option> // ✅ FIXED _id
              ))}
            </select>
          </div>
        )}

        {documentError && newDocumentTitle.trim() !== "" && (
          <p className="text-red-400 text-sm mb-4">{documentError}</p>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={() => {
              onClose();
              setNewDocumentTitle("");
              setNewDocumentProjectId("");
            }}
            primary={false}
            disabled={isCreatingDocument}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            primary
            disabled={isCreatingDocument}
            icon={isCreatingDocument ? ArrowPathIcon : PlusIcon}
            className={isCreatingDocument ? 'animate-pulse' : ''}
          >
            {isCreatingDocument ? "Creating..." : "Create Document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

export default CreateDocumentModal;
