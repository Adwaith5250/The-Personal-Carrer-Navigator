
export interface Skill {
  name: string;
  level: number; // 1-10
  category: 'technical' | 'soft' | 'domain';
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  importance: 'critical' | 'high' | 'medium';
  description: string;
}

export interface RoadmapItem {
  day: number;
  title: string;
  description: string;
  resources: { title: string; url: string }[];
  project?: {
    name: string;
    description: string;
  };
  checkpoint: string;
}

export interface CareerAnalysis {
  extractedSkills: Skill[];
  marketDemand: string;
  gaps: SkillGap[];
  roadmap: RoadmapItem[];
  summary: string;
}

export type ViewState = 'onboarding' | 'analyzing' | 'dashboard' | 'roadmap';
