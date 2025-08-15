"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getProjects, addProject } from "@/service/projects";

type Project = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
};

const Projects: React.FC = () => {
  const router = useRouter();
  const { user, token } = useAuth(); 
  const role = user?.role || "USER";

  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  
  // ✅ Just call without passing token
useEffect(() => {
  getProjects()
    .then((data) => setProjects(data))
    .catch((err) => console.error("Error fetching projects:", err));
}, []);

// ✅ Same for adding a project
const handleAddProject = async () => {
  if (!newProject.name.trim()) return;

  try {
    const created = await addProject(newProject);
    setProjects((prev) => [...prev, created]);
    setNewProject({ name: "", description: "" });
    setShowForm(false);
  } catch (err) {
    console.error("Error adding project:", err);
  }
};


  const handleSelectProject = (projectId: string) => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      router.push(`/admin?projectId=${projectId}`);
    } else {
      router.push(`/dashboard?projectId=${projectId}`);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>

        {(role === "SUPER_ADMIN") && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => setShowForm(true)}
          >
            + Add Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSelectProject(project._id)}
          >
            <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <span className="text-sm text-gray-500">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Project</h3>
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3"
            />
            <textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded mb-3"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
