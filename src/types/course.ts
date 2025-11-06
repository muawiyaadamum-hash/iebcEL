export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  image: string;
  modules: string[];
  featured?: boolean;
}

export const REGISTRATION_FEE = 5000;
export const COURSE_FEE = 15000;
