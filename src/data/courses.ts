import { Course } from '@/types/course';

export const courses: Course[] = [
  {
    id: 'web-design',
    title: 'Web Design',
    description: 'Master modern web design principles, UI/UX best practices, and create stunning websites that engage users.',
    category: 'Technology',
    duration: '8 weeks',
    level: 'Beginner',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'HTML & CSS Fundamentals',
      'Responsive Design',
      'UI/UX Principles',
      'Design Tools (Figma)',
      'Portfolio Project'
    ],
    featured: true
  },
  {
    id: 'graphics-design',
    title: 'Graphics Design',
    description: 'Learn professional graphic design techniques, branding, and digital illustration using industry-standard tools.',
    category: 'Technology',
    duration: '8 weeks',
    level: 'Beginner',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'Design Fundamentals',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Brand Identity Design',
      'Client Projects'
    ],
    featured: true
  },
  {
    id: 'computer-network',
    title: 'Computer Network & Maintenance',
    description: 'Understand network infrastructure, troubleshooting, and system maintenance for enterprise environments.',
    category: 'Technology',
    duration: '10 weeks',
    level: 'Intermediate',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'Network Fundamentals',
      'TCP/IP & Protocols',
      'Hardware Maintenance',
      'Troubleshooting',
      'Network Security'
    ]
  },
  {
    id: 'cctv-installation',
    title: 'CCTV Installation & Maintenance',
    description: 'Professional training in security camera systems, installation techniques, and ongoing maintenance.',
    category: 'Technology',
    duration: '6 weeks',
    level: 'Intermediate',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'CCTV System Basics',
      'Camera Types & Selection',
      'Installation Techniques',
      'System Configuration',
      'Maintenance & Troubleshooting'
    ]
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security',
    description: 'Protect systems and networks from digital threats with comprehensive cybersecurity training.',
    category: 'Technology',
    duration: '12 weeks',
    level: 'Advanced',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'Security Fundamentals',
      'Threat Analysis',
      'Penetration Testing',
      'Ethical Hacking',
      'Security Best Practices'
    ]
  },
  {
    id: 'human-resources',
    title: 'Human Resources Management',
    description: 'Develop essential HR skills including recruitment, employee relations, and organizational development.',
    category: 'Human Resources',
    duration: '10 weeks',
    level: 'Intermediate',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'HR Fundamentals',
      'Recruitment & Selection',
      'Performance Management',
      'Employee Relations',
      'HR Legal Compliance'
    ]
  },
  {
    id: 'business-admin',
    title: 'Business Administration',
    description: 'Master business operations, management principles, and strategic planning for organizational success.',
    category: 'Business',
    duration: '12 weeks',
    level: 'Intermediate',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'Business Fundamentals',
      'Operations Management',
      'Financial Management',
      'Strategic Planning',
      'Leadership Skills'
    ]
  },
  {
    id: 'transport-logistics',
    title: 'Transport & Logistics',
    description: 'Learn supply chain management, logistics operations, and transportation optimization strategies.',
    category: 'Logistics',
    duration: '10 weeks',
    level: 'Intermediate',
    price: 15000,
    image: '/placeholder.svg',
    modules: [
      'Supply Chain Basics',
      'Transportation Management',
      'Warehouse Operations',
      'Inventory Control',
      'Logistics Technology'
    ]
  }
];
