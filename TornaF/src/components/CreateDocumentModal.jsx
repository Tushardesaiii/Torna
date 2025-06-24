
import React, { useState } from 'react';
import { Modal, InputField, Button } from './SharedUI';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateDocumentModal = ({ isOpen, onClose, projectId }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (projectId) {
        res = await axios.post(
          `http://localhost:8000/api/v1/projects/${projectId}/documents`,
          { title },
          { withCredentials: true }
        );
      } else {
        res = await axios.post(
          `http://localhost:8000/api/v1/documents`,
          { title },
          { withCredentials: true }
        );
      }
      navigate(`/documents/${res.data.data._id}/edit`);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Document">
      <InputField
        id="new-doc-title"
        label="Document Title"
        placeholder="e.g., Chapter One"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        required
      />
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <div className="flex justify-end space-x-2">
        <Button onClick={onClose} disabled={loading} primary={false}>Cancel</Button>
        <Button onClick={handleCreate} disabled={loading || !title.trim()}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </Modal>
  );
};

export default CreateDocumentModal;