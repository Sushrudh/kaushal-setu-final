import { db } from './db.js';

export interface MatchResult {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedCourses: Array<{
    courseId: string;
    title: string;
    provider: string;
    skillName: string;
    durationHours: number;
    rating: number;
  }>;
}

export class SkillMatchingEngine {
  /**
   * Normalizes skill string for robust comparison (case insensitive, trimmed)
   */
  private normalize(skill: string): string {
    return skill.toLowerCase().trim().replace(/[\.\s\-\_]/g, '');
  }

  /**
   * Evaluates match between student's active skills and a job's required skills
   */
  public calculateJobMatch(studentSkills: string[], jobRequiredSkillsStr: string, jobId?: string): MatchResult {
    const rawRequired = (jobRequiredSkillsStr || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (rawRequired.length === 0) {
      return {
        jobId: jobId || '',
        jobTitle: '',
        companyName: '',
        matchPercentage: 100,
        matchedSkills: [],
        missingSkills: [],
        recommendedCourses: []
      };
    }

    const studentSkillNormMap = new Map<string, string>();
    for (const s of studentSkills) {
      studentSkillNormMap.set(this.normalize(s), s);
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const req of rawRequired) {
      const norm = this.normalize(req);
      let found = false;

      // Direct normalized match or substring check
      for (const [sNorm, original] of studentSkillNormMap.entries()) {
        if (sNorm === norm || sNorm.includes(norm) || norm.includes(sNorm)) {
          matchedSkills.push(req);
          found = true;
          break;
        }
      }

      if (!found) {
        missingSkills.push(req);
      }
    }

    const matchPercentage = Math.round((matchedSkills.length / rawRequired.length) * 100);

    // Find recommended courses for missing skills
    const recommendedCourses: MatchResult['recommendedCourses'] = [];
    if (missingSkills.length > 0) {
      for (const missing of missingSkills) {
        // Query courses that target this skill
        const courses = db.prepare(`
          SELECT id, title, provider, target_skill_name, duration_hours, rating
          FROM common_courses
          WHERE target_skill_name LIKE ? OR title LIKE ?
          LIMIT 2
        `).all(`%${missing}%`, `%${missing}%`) as Array<{
          id: string;
          title: string;
          provider: string;
          target_skill_name: string;
          duration_hours: number;
          rating: number;
        }>;

        for (const c of courses) {
          if (!recommendedCourses.some(rc => rc.courseId === c.id)) {
            recommendedCourses.push({
              courseId: c.id,
              title: c.title,
              provider: c.provider,
              skillName: c.target_skill_name,
              durationHours: c.duration_hours,
              rating: c.rating
            });
          }
        }
      }
    }

    return {
      jobId: jobId || '',
      jobTitle: '',
      companyName: '',
      matchPercentage,
      matchedSkills,
      missingSkills,
      recommendedCourses
    };
  }

  /**
   * Get overall skill gap analysis for a student across active industry job postings
   */
  public getStudentSkillAnalysis(userId: string) {
    // 1. Fetch student's current skills
    const userSkills = db.prepare(`
      SELECT skill_name, proficiency_level, source, verification_status, confidence
      FROM students_skills
      WHERE user_id = ? AND is_active = 1
    `).all(userId) as Array<{
      skill_name: string;
      proficiency_level: number;
      source: string;
      verification_status: string;
      confidence: number;
    }>;

    const studentSkillNames = userSkills.map(s => s.skill_name);

    // 2. Fetch active jobs to compute industry demand frequency
    const jobs = db.prepare(`
      SELECT id, title, company_name, required_skills, created_at
      FROM industry_jobs
      WHERE is_active = 1
    `).all() as Array<{
      id: string;
      title: string;
      company_name: string;
      required_skills: string;
      created_at: string;
    }>;

    const demandMap = new Map<string, number>();
    const missingDemandMap = new Map<string, number>();

    for (const j of jobs) {
      const req = (j.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);
      for (const r of req) {
        demandMap.set(r, (demandMap.get(r) || 0) + 1);
      }
      const match = this.calculateJobMatch(studentSkillNames, j.required_skills || '');
      for (const m of match.missingSkills) {
        missingDemandMap.set(m, (missingDemandMap.get(m) || 0) + 1);
      }
    }

    // Top missing skills in high demand
    const topGaps = Array.from(missingDemandMap.entries())
      .map(([skill, count]) => ({ skill, missingCount: count, demandPct: Math.round((count / Math.max(jobs.length, 1)) * 100) }))
      .sort((a, b) => b.missingCount - a.missingCount);

    // Recommended learning programs for top gaps
    const recommendations: any[] = [];
    for (const gap of topGaps.slice(0, 3)) {
      const courses = db.prepare(`
        SELECT c.*,
          (SELECT COUNT(*) FROM common_course_lectures l WHERE l.course_id = c.id) as lecture_count
        FROM common_courses c
        WHERE c.target_skill_name LIKE ? OR c.title LIKE ?
        LIMIT 1
      `).all(`%${gap.skill}%`, `%${gap.skill}%`);

      if (courses.length > 0) {
        recommendations.push(courses[0]);
      }
    }

    // Helper for case-insensitive keyword match across student's skills
    const hasCategorySkill = (keywords: string[]) => {
      return studentSkillNames.some(s => {
        const lower = s.toLowerCase();
        return keywords.some(k => lower.includes(k.toLowerCase()));
      });
    };

    // Radar / Spider Chart data points:
    // Core competencies: Programming, Databases, Frontend, DevOps, AI/ML, Soft Skills
    const competencyCategories = [
      { category: 'Programming (Python/Java)', target: 90, current: hasCategorySkill(['python', 'java', 'c++', 'golang']) ? 90 : 20 },
      { category: 'Database & SQL', target: 85, current: hasCategorySkill(['sql', 'database', 'postgres', 'mysql', 'mongo']) ? 85 : 15 },
      { category: 'Frontend (React.js)', target: 80, current: hasCategorySkill(['react', 'frontend', 'javascript', 'typescript', 'vue', 'angular', 'html', 'css']) ? 80 : 25 },
      { category: 'Backend (Node.js)', target: 80, current: hasCategorySkill(['node', 'express', 'backend', 'django', 'fastapi', 'spring']) ? 78 : 30 },
      { category: 'DevOps & Version Control', target: 75, current: hasCategorySkill(['git', 'github', 'devops', 'docker', 'ci/cd', 'cloud', 'aws']) ? 80 : 20 },
      { category: 'AI & Data Science', target: 70, current: hasCategorySkill(['machine learning', 'ai', 'data science', 'deep learning']) ? 75 : 10 }
    ];

    return {
      currentSkillsCount: studentSkillNames.length,
      skills: userSkills,
      topGaps,
      competencyCategories,
      recommendations
    };
  }
}

export const skillMatchingEngine = new SkillMatchingEngine();
