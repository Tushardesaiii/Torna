// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
      // Replace with real API call in production
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
    let response;
    if (newDocumentProjectId) {
      // If a project is selected, use the project route
      response = await axios.post(
        `http://localhost:8000/api/v1/projects/${newDocumentProjectId}/documents`,
        { title: newDocumentTitle },
        { withCredentials: true }
      );
    } else {
      // No project selected, use the standalone route
      response = await axios.post(
        `http://localhost:8000/api/v1/documents`,
        { title: newDocumentTitle },
        { withCredentials: true }
      );
    }

    const newDocId = response.data?.data?._id;
    if (!newDocId) {
      setDocumentError("Failed to get new document ID from server.");
      setIsCreatingDocument(false);
      return;
    }
    setIsCreateDocumentModalOpen(false);
    setNewDocumentTitle("");
    setNewDocumentProjectId("");
    navigate(`/documents/${newDocId}/edit`);
  } catch (err) {
    console.error("Error creating document:", err);
    setDocumentError(
      err.response?.data?.message || "Failed to create document. Please try again."
    );
  } finally {
    setIsCreatingDocument(false);
  }
}, [newDocumentTitle, newDocumentProjectId, navigate]);

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
          onCreateDocument={() => {
            console.log("setIsCreateDocumentModalOpen(true) called"); // <-- LOG
            setIsCreateDocumentModalOpen(true);
          }}
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

      {console.log("Rendering CreateDocumentModal, isCreateDocumentModalOpen:", isCreateDocumentModalOpen)}
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
