import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext.jsx";

import SidebarNavigation from "../components/SidebarNavigation.jsx";
import DashboardView from "../components/DashboardView.jsx";
import ProjectsView from "../components/ProjectView.jsx";
import AchievementsView from "../components/AchievementsView.jsx";
import NotificationsView from "../components/NotificationView.jsx";
import SettingsView from "../components/SettingsView.jsx";
import CreateProjectModal from "../components/CreateProjectModel.jsx";
import CreateDocumentModal from "../components/CreateDocumentModal.jsx";

const Dashboard = () => {
  const { currentUser: user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("dashboard");

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [projectError, setProjectError] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const [newDocumentProjectId, setNewDocumentProjectId] = useState("");
  const [documentError, setDocumentError] = useState(null);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [availableProjects, setAvailableProjects] = useState(user?.projects || []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setAvailableProjects(user.projects || []);
    }
  }, [user, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const handleCreateProject = useCallback(async () => {
    if (!newProjectTitle.trim()) {
      setProjectError("Project title is required.");
      return;
    }
    setIsCreatingProject(true);
    setProjectError(null);
    try {
      const response = await new Promise(resolve => setTimeout(() => {
        const newProject = {
          _id: `proj-${Date.now()}`,
          title: newProjectTitle,
          description: newProjectDescription,
          lastEdited: new Date().toISOString(),
          totalDocuments: 0,
          wordCount: 0,
          status: "Planning",
          collaborators: [],
        };
        resolve({ data: newProject });
      }, 1000));

      setAvailableProjects(prevProjects => [...(prevProjects || []), response.data]);

      setIsCreateProjectModalOpen(false);
      setNewProjectTitle("");
      setNewProjectDescription("");
    } catch (err) {
      console.error("Error creating project:", err);
      setProjectError("Failed to create project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  }, [newProjectTitle, newProjectDescription]);

  const handleCreateDocument = useCallback(async () => {
    if (!newDocumentTitle.trim()) {
      setDocumentError("Document title is required.");
      return;
    }
    setIsCreatingDocument(true);
    setDocumentError(null);
    try {
      const response = await new Promise(resolve => setTimeout(() => {
        const newDocument = {
          id: `doc-${Date.now()}`, // Use ._id if you're using Mongo-style documents
          title: newDocumentTitle,
          projectId: newDocumentProjectId || null,
          createdAt: new Date().toISOString(),
        };
        resolve({ data: newDocument });
      }, 1000));

      console.log("New document created:", response.data);

      setIsCreateDocumentModalOpen(false);
      setNewDocumentTitle("");
      setNewDocumentProjectId("");

      // ✅ Navigate to document edit page
      navigate(`/documents/${response.data.id}/edit`);
    } catch (err) {
      console.error("Error creating document:", err);
      setDocumentError("Failed to create document. Please try again.");
    } finally {
      setIsCreatingDocument(false);
    }
  }, [newDocumentTitle, newDocumentProjectId, navigate]);

  useEffect(() => {
    if (!isCreateProjectModalOpen) {
      setProjectError(null);
      setNewProjectTitle("");
      setNewProjectDescription("");
    }
  }, [isCreateProjectModalOpen]);

  useEffect(() => {
    if (!isCreateDocumentModalOpen) {
      setDocumentError(null);
      setNewDocumentTitle("");
      setNewDocumentProjectId("");
    }
  }, [isCreateDocumentModalOpen]);

  return (
    <div className="min-h-screen flex bg-black text-zinc-100">
      <SidebarNavigation
        current={currentView}
        onNav={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />

      {currentView === "dashboard" && (
        <DashboardView
          user={user}
          onCreateProject={() => setIsCreateProjectModalOpen(true)}
          onCreateDocument={() => setIsCreateDocumentModalOpen(true)}
        />
      )}
      {currentView === "projects" && <ProjectsView />}
      {currentView === "achievements" && <AchievementsView />}
      {currentView === "notifications" && <NotificationsView />}
      {currentView === "settings" && <SettingsView />}

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        newProjectTitle={newProjectTitle}
        setNewProjectTitle={setNewProjectTitle}
        newProjectDescription={newProjectDescription}
        setNewProjectDescription={setNewProjectDescription}
        projectError={projectError}
        isCreatingProject={isCreatingProject}
        handleCreateProject={handleCreateProject}
      />

      <CreateDocumentModal
        isOpen={isCreateDocumentModalOpen}
        onClose={() => setIsCreateDocumentModalOpen(false)}
        newDocumentTitle={newDocumentTitle}
        setNewDocumentTitle={setNewDocumentTitle}
        newDocumentProjectId={newDocumentProjectId}
        setNewDocumentProjectId={setNewDocumentProjectId}
        documentError={documentError}
        isCreatingDocument={isCreatingDocument}
        handleCreateDocument={handleCreateDocument}
        availableProjects={availableProjects}
      />
    </div>
  );
};

export default Dashboard;
