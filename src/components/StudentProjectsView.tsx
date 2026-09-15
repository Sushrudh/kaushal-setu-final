import React, { useState, useEffect } from 'react';
import { StudentProject } from '../types';

interface StudentProjectsViewProps {
  onProjectUpdated?: () => void;
}

export const StudentProjectsView: React.FC<StudentProjectsViewProps> = ({ onProjectUpdated }) => {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<StudentProject | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [skillsDemonstrated, setSkillsDemonstrated] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [projectType, setProjectType] = useState<'Individual' | 'Team'>('Individual');
  const [duration, setDuration] = useState('4 Weeks');
  const [status, setStatus] = useState<'Completed' | 'In Progress' | 'Maintained'>('Completed');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/students/me/projects', { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProjects(json.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('Web Development');
    setDescription('');
    setTechnologies('React, TypeScript, Node.js, TailwindCSS');
    setSkillsDemonstrated('Full-Stack Development, REST APIs, Authentication');
    setGithubUrl('https://github.com/myusername/project');
    setLiveUrl('https://myproject.vercel.app');
    setProjectType('Individual');
    setDuration('4 Weeks');
    setStatus('Completed');
    setErrorNotice('');
    setShowModal(true);
  };

  const openEditModal = (proj: StudentProject) => {
    setEditingProject(proj);
    setTitle(proj.title || '');
    setCategory(proj.category || 'Web Development');
    setDescription(proj.description || '');
    setTechnologies(proj.technologies || '');
    setSkillsDemonstrated(proj.skills_demonstrated || '');
    setGithubUrl(proj.github_url || '');
    setLiveUrl(proj.live_url || '');
    setProjectType(proj.project_type || 'Individual');
    setDuration(proj.duration || '4 Weeks');
    setStatus(proj.status || 'Completed');
    setErrorNotice('');
    setShowModal(true);
  };

  const handleDelete = async (id: string, projTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projTitle}"?`)) return;

    try {
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`/api/students/me/projects/${id}`, {
        method: 'DELETE',
        headers
      });
      const json = await res.json();
      if (json.success) {
        setSuccessNotice(`Project "${projTitle}" removed successfully.`);
        fetchProjects();
        if (onProjectUpdated) onProjectUpdated();
      } else {
        setErrorNotice(json.error?.message || 'Could not delete project.');
      }
    } catch (e) {
      setErrorNotice('Failed to delete project. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorNotice('Project title is required.');
      return;
    }

    setSaving(true);
    setErrorNotice('');
    try {
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        technologies: technologies.trim(),
        skillsDemonstrated: skillsDemonstrated.trim(),
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        projectType,
        duration: duration.trim(),
        status
      };

      const endpoint = editingProject
        ? `/api/students/me/projects/${editingProject.id}`
        : '/api/students/me/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        setSuccessNotice(editingProject ? 'Project updated successfully!' : 'Project added to your portfolio!');
        setShowModal(false);
        fetchProjects();
        if (onProjectUpdated) onProjectUpdated();
      } else {
        setErrorNotice(json.error?.message || 'Error saving project.');
      }
    } catch (err) {
      setErrorNotice('Network error while saving project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="student-project-portal" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-2xl">code_blocks</span>
            <h2 className="text-xl font-bold text-slate-900">Student Capstone &amp; Project Repository</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Showcase your verified engineering projects, GitHub repositories, and live demo links to prospective recruiters.
          </p>
        </div>
        <button
          id="btn-add-new-project"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Add New Project
        </button>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice('')} className="text-rose-600 hover:text-rose-800">✕</button>
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading your project portfolio...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">folder_open</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Projects Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Add capstones, hackathon submissions, or personal web apps to prove hands-on technical competency and boost recruiter matching.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            + Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              id={`project-card-${proj.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {proj.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {proj.project_type || 'Individual'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      proj.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : proj.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{proj.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>

                {/* Technologies */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Technologies &amp; Frameworks
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.split(',').map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills Demonstrated */}
                {proj.skills_demonstrated && (
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Demonstrated Competencies
                    </span>
                    <p className="text-xs text-slate-600">{proj.skills_demonstrated}</p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">terminal</span>
                      <span>Source Code</span>
                    </a>
                  )}
                  {proj.live_url && (
                    <a
                      href={proj.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      <span>Live Preview</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(proj)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id, proj.title)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingProject ? 'Edit Project Details' : 'Add New Capstone Project'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly saved to your student profile and visible in the verified portfolio.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Telemetry Pipeline & Alerting Engine"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                    <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                    <option value="Blockchain & Web3">Blockchain &amp; Web3</option>
                    <option value="IoT & Hardware">IoT &amp; Hardware</option>
                    <option value="Systems & Cybersecurity">Systems &amp; Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Individual">Individual Project</option>
                    <option value="Team">Team Capstone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief summary of the architecture, features, problem solved, and technical depth..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technologies Used (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="React, TypeScript, Express, PostgreSQL, Redis"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skills Demonstrated (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Caching, CI/CD Pipeline, State Management"
                  value={skillsDemonstrated}
                  onChange={(e) => setSkillsDemonstrated(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GitHub / Source Code URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://myproject.app"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Weeks or 2 Months"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Maintained">Maintained &amp; Live</option>
                  </select>
                </div>
              </div>

              {errorNotice && (
                <p className="text-xs text-rose-600 font-semibold">{errorNotice}</p>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {saving && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  <span>{editingProject ? 'Save Changes' : 'Publish Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
