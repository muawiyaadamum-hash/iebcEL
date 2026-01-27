export interface CourseModule {
  title: string;
  topics: string[];
  content?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  image: string;
  modules: CourseModule[];
  learningOutcomes: string[];
  featured?: boolean;
}

export const REGISTRATION_FEE = 10000;
