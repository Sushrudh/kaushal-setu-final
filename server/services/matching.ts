import { db } from '../db.js';

export interface SkillMatchResult {
  jobId: number;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  requiredSkills: { id: number; name: string }[];
  matchedSkills: { id: number; name: string; proficiency: number }[];
  missingSkills: { id: number; name: string }[];
  recommendedCourses: {
    id: number;
    title: string;
    category: string;
    description: string;
    provider: string;
    lecturesCount: number;
    sampleLectureUrl?: string;
  }[];
}

export class MatchingEngine {
  public static calculateJobMatch(studentId: number, jobId: number): SkillMatchResult {
    const job = db.prepare(`
      SELECT j.id, j.title, ind.company_name
      FROM jobs j
      JOIN industries ind ON j.industry_id = ind.id
      WHERE j.id = ?
    `).get(jobId) as { id: number; title: string; company_name: string } | undefined;

    if (!job) {
      throw new Error(`Job ID ${jobId} not found.`);
    }

    // Required skills for this job
    const reqSkillRows = db.prepare(`
      SELECT s.id, s.name
      FROM job_skills js
      JOIN skills s ON js.skill_id = s.id
      WHERE js.job_id = ?
    `).all(jobId) as { id: number; name: string }[];

    // Active skills of this student
    const studentSkillRows = db.prepare(`
      SELECT s.id, s.name, ss.proficiency_pct
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_id = ? AND ss.is_active = 1
    `).all(studentId) as { id: number; name: string; proficiency_pct: number }[];

    const studentSkillMap = new Map<number, { id: number; name: string; proficiency: number }>();
    studentSkillRows.forEach(s => studentSkillMap.set(s.id, { id: s.id, name: s.name, proficiency: s.proficiency_pct }));

    const matchedSkills: { id: number; name: string; proficiency: number }[] = [];
    const missingSkills: { id: number; name: string }[] = [];

    for (const req of reqSkillRows) {
      if (studentSkillMap.has(req.id)) {
        matchedSkills.push(studentSkillMap.get(req.id)!);
      } else {
        missingSkills.push(req);
      }
    }

    const matchScore = reqSkillRows.length > 0
      ? Math.round((matchedSkills.length / reqSkillRows.length) * 100)
      : 100;

    // Course recommendations for missing skills
    const missingSkillIds = missingSkills.map(s => s.id);
    const recommendedCourses: SkillMatchResult['recommendedCourses'] = [];

    if (missingSkillIds.length > 0) {
      const placeholders = missingSkillIds.map(() => '?').join(',');
      const courses = db.prepare(`
        SELECT c.id, c.title, c.category, c.description, c.provider,
               (SELECT COUNT(*) FROM course_lectures cl WHERE cl.course_id = c.id) as lecturesCount,
               (SELECT resource_url FROM course_lectures cl WHERE cl.course_id = c.id ORDER BY lecture_order LIMIT 1) as sampleLectureUrl
        FROM courses c
        WHERE c.primary_skill_id IN (${placeholders})
        LIMIT 4
      `).all(...missingSkillIds) as any[];

      courses.forEach(c => {
        recommendedCourses.push({
          id: c.id,
          title: c.title,
          category: c.category,
          description: c.description,
          provider: c.provider,
          lecturesCount: c.lecturesCount,
          sampleLectureUrl: c.sampleLectureUrl
        });
      });
    }

    return {
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.company_name,
      matchScore,
      requiredSkills: reqSkillRows,
      matchedSkills,
      missingSkills,
      recommendedCourses
    };
  }

  public static searchCandidatesForJob(jobId: number): any[] {
    const job = db.prepare(`SELECT id, title FROM jobs WHERE id = ?`).get(jobId) as { id: number; title: string } | undefined;
    if (!job) return [];

    const reqSkills = db.prepare(`
      SELECT s.id, s.name FROM job_skills js
      JOIN skills s ON js.skill_id = s.id
      WHERE js.job_id = ?
    `).all(jobId) as { id: number; name: string }[];

    if (reqSkills.length === 0) return [];

    const students = db.prepare(`
      SELECT st.id as student_id, u.full_name, st.college_name, st.course_degree,
             st.cgpa, st.graduation_year, st.academic_verification_status, st.digilocker_connected
      FROM students st
      JOIN users u ON st.user_id = u.id
      WHERE u.account_status = 'active'
    `).all() as any[];

    const results: any[] = [];
    for (const student of students) {
      const studentSkills = db.prepare(`
        SELECT s.id, s.name, ss.proficiency_pct, ss.verification_status
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.student_id = ? AND ss.is_active = 1
      `).all(student.student_id) as any[];

      const studentSkillIds = new Set(studentSkills.map(s => s.id));
      const matched = reqSkills.filter(r => studentSkillIds.has(r.id));
      const matchScore = Math.round((matched.length / reqSkills.length) * 100);

      results.push({
        studentId: student.student_id,
        fullName: student.full_name,
        college: student.college_name,
        degree: student.course_degree,
        cgpa: student.cgpa,
        graduationYear: student.graduation_year,
        matchScore,
        matchedSkills: matched.map(m => m.name),
        missingSkills: reqSkills.filter(r => !studentSkillIds.has(r.id)).map(r => r.name),
        verifiedCredentials: student.academic_verification_status === 'verified',
        digilockerConnected: Boolean(student.digilocker_connected)
      });
    }

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
