import React, { useState, useEffect } from 'react';
import { Course } from '../types';

interface StudentCoursesViewProps {
  onCourseProgressUpdated?: () => void;
}

export const StudentCoursesView: React.FC<StudentCoursesViewProps> = ({ onCourseProgressUpdated }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'all' | 'enrolled'>('all');

  // Enrolling / Updating state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active course details / modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const params = new URLSearchParams();
      if (filterCategory !== 'All') params.append('category', filterCategory);
      if (filterDifficulty !== 'All') params.append('difficulty', filterDifficulty);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/courses?${params.toString()}`, { headers });
      if (res.status === 401) {
        setNotice({ type: 'error', message: 'Authentication required. Please sign in to view protected courses.' });
        setCourses([]);
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCourses(json.data);
      }
    } catch (e) {
      console.error('Failed to load courses', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filterCategory, filterDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (course: Course) => {
    setActionLoadingId(course.id);
    setNotice(null);
    try {
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: 'POST',
        headers
      });
      const json = await res.json();
      if (json.success) {
        setNotice({ type: 'success', message: json.message || `Successfully enrolled in "${course.title}"!` });
        await fetchCourses();
        if (onCourseProgressUpdated) onCourseProgressUpdated();
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Could not enroll in course.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to connect to enrollment service.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateProgress = async (courseId: string, progressPct: number) => {
    setActionLoadingId(courseId);
    setNotice(null);
    try {
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ progressPct })
      });
      const json = await res.json();
      if (json.success) {
        const msg = progressPct === 100
          ? 'Course completed! Certified skill credential awarded to your profile!'
          : `Progress updated to ${progressPct}%.`;
        setNotice({ type: 'success', message: msg });
        await fetchCourses();
        if (selectedCourse && selectedCourse.id === courseId) {
          setSelectedCourse((prev) => prev ? { ...prev, progress_pct: progressPct, is_enrolled: true } : null);
        }
        if (onCourseProgressUpdated) onCourseProgressUpdated();
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Failed to update progress.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Progress update failed.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const enrolledCourses = courses.filter((c) => c.is_enrolled);
  const displayedCourses = viewTab === 'enrolled' ? enrolledCourses : courses;

  return (
    <div id="student-courses-section" className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-700 text-2xl">school</span>
              <h2 className="text-xl font-bold text-slate-900">National Curriculum &amp; Micro-Credentials</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              AICTE-accredited, NPTEL-recognized courses with direct credit transfer into your Academic Bank of Credits (ABC) &amp; APAAR ID.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setViewTab('enrolled')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'enrolled'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>My Enrolled</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 text-purple-900 font-bold">
                {enrolledCourses.length}
              </span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by course title, technology, or required skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-base">search</span>
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Find
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:border-purple-600"
            >
              <option value="All">All Disciplines</option>
              <option value="Programming">Programming</option>
              <option value="Data Structures & Algorithms">Data Structures &amp; Algorithms</option>
              <option value="Databases">Databases</option>
              <option value="Web Development">Web Development</option>
              <option value="Computer Science Core">Computer Science Core</option>
              <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
              <option value="Development & Tools">Development &amp; Tools</option>
              <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
              <option value="Career-Oriented Learning">Career-Oriented Learning</option>
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:border-purple-600"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm ${
            notice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              {notice.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Course List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading accredited course curriculum...</p>
        </div>
      ) : displayedCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            {viewTab === 'enrolled' ? 'No Enrolled Courses Yet' : 'No Matching Courses Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            {viewTab === 'enrolled'
              ? 'Browse the national catalog and enroll to start earning verified NCrF credits.'
              : 'Try relaxing your search query or selecting "All Disciplines".'}
          </p>
          {viewTab === 'enrolled' && (
            <button
              onClick={() => setViewTab('all')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold"
            >
              Explore Course Catalog
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCourses.map((course) => {
            const isEnrolled = course.is_enrolled;
            const progress = course.progress_pct || 0;
            const isCompleted = progress === 100;

            return (
              <div
                key={course.id}
                id={`course-card-${course.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {course.credits || 4} NCrF Credits
                    </span>
                    <div className="flex items-center gap-1.5">
                      {course.course_url && (
                        <a
                          href={course.course_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer"
                          title="Open official course page in new tab"
                        >
                          <span>Curriculum</span>
                          <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                        </a>
                      )}
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {course.difficulty || 'Intermediate'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {course.provider} • {course.duration_hours || 24} Hours
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Target Competency:
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      {course.target_skill_name}
                    </span>
                  </div>

                  {/* Progress Bar if enrolled */}
                  {isEnrolled && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-bold text-slate-700">Course Progress</span>
                        <span className={`font-bold ${isCompleted ? 'text-emerald-700' : 'text-purple-700'}`}>
                          {progress}% {isCompleted ? '✓ Completed' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {isEnrolled ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="flex-grow py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        {isCompleted ? 'Review Syllabus' : 'Continue Learning →'}
                      </button>
                      {!isCompleted && (
                        <button
                          onClick={() => handleUpdateProgress(course.id, Math.min(100, progress + 25))}
                          disabled={actionLoadingId === course.id}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          title="Simulate completing next module"
                        >
                          +25%
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEnroll(course)}
                        disabled={actionLoadingId === course.id}
                        className="flex-grow py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {actionLoadingId === course.id && (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        )}
                        <span>Enroll &amp; Link APAAR →</span>
                      </button>
                      {(course.course_url || course.courseUrl) && (
                        <a
                          href={course.course_url || course.courseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-blue-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                          title="Open Official Course Website"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        title="View Course Syllabus"
                      >
                        <span className="material-symbols-outlined text-base">info</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                  {selectedCourse.provider} • {selectedCourse.credits || 4} Credits
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedCourse.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">About This Course</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedCourse.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-950">Accredited Skill Outcome:</span>
                  <p className="text-xs font-bold text-purple-700 mt-0.5">{selectedCourse.target_skill_name}</p>
                </div>
                <span className="px-2.5 py-1 bg-white text-purple-700 rounded-lg text-xs font-bold border border-purple-200">
                  Rating: ★ {selectedCourse.rating || 4.8}
                </span>
              </div>

              {(selectedCourse.course_url || selectedCourse.courseUrl) && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-blue-600 text-xl">open_in_new</span>
                    <div>
                      <h5 className="text-xs font-bold text-blue-950">Official Course &amp; Curriculum Portal</h5>
                      <p className="text-[11px] text-blue-700">Access accredited lessons, video tracks, and assignments</p>
                    </div>
                  </div>
                  <a
                    href={selectedCourse.course_url || selectedCourse.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Visit Course</span>
                    <span>↗</span>
                  </a>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sample Module Syllabus &amp; Milestones
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600 text-base">play_circle</span>
                      <span className="font-semibold text-slate-800">Module 1: Foundations &amp; Core Architecture</span>
                    </div>
                    <span className="text-[11px] text-slate-500">45 mins</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600 text-base">play_circle</span>
                      <span className="font-semibold text-slate-800">Module 2: Advanced Design Patterns &amp; Testing</span>
                    </div>
                    <span className="text-[11px] text-slate-500">60 mins</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600 text-base">task</span>
                      <span className="font-semibold text-slate-800">Module 3: Hands-on Industry Capstone Project</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Graded</span>
                  </div>
                </div>
              </div>

              {/* Quick progress actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Simulate Progress:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateProgress(selectedCourse.id, 50)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                    >
                      Set to 50%
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(selectedCourse.id, 100)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm"
                    >
                      Mark 100% (Earn Badge)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
