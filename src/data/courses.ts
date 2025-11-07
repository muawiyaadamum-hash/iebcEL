import { Course } from '@/types/course';
import webDesignImg from '@/assets/web-design.jpg';
import graphicsDesignImg from '@/assets/graphics-design.jpg';
import computerNetworkImg from '@/assets/computer-network.jpg';
import cctvInstallationImg from '@/assets/cctv-installation.jpg';
import cyberSecurityImg from '@/assets/cyber-security.jpg';
import humanResourcesImg from '@/assets/human-resources.jpg';
import businessAdminImg from '@/assets/business-admin.jpg';
import transportLogisticsImg from '@/assets/transport-logistics.jpg';

export const courses: Course[] = [
  {
    id: 'web-design',
    title: 'Web Design',
    description: 'Master modern web design principles, UI/UX best practices, and create stunning websites that engage users.',
    category: 'Technology',
    duration: '8 weeks',
    level: 'Beginner',
    price: 15000,
    image: webDesignImg,
    learningOutcomes: [
      'Create responsive websites using HTML5 and CSS3',
      'Apply modern UI/UX design principles',
      'Use professional design tools like Figma',
      'Build a professional portfolio website',
      'Understand web accessibility standards'
    ],
    modules: [
      {
        title: 'HTML & CSS Fundamentals',
        topics: ['HTML Structure', 'CSS Styling', 'Box Model', 'Flexbox & Grid']
      },
      {
        title: 'Responsive Design',
        topics: ['Mobile-First Approach', 'Media Queries', 'Responsive Images']
      },
      {
        title: 'UI/UX Principles',
        topics: ['User Research', 'Wireframing', 'Design Systems', 'Accessibility']
      },
      {
        title: 'Design Tools (Figma)',
        topics: ['Interface Basics', 'Components', 'Prototyping', 'Collaboration']
      },
      {
        title: 'Portfolio Project',
        topics: ['Project Planning', 'Implementation', 'Deployment', 'Portfolio Presentation']
      }
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
    image: graphicsDesignImg,
    learningOutcomes: [
      'Master Adobe Photoshop and Illustrator',
      'Create professional brand identities',
      'Design logos and marketing materials',
      'Work with typography and color theory',
      'Build a professional design portfolio'
    ],
    modules: [
      {
        title: 'Design Fundamentals',
        topics: ['Color Theory', 'Typography', 'Composition', 'Visual Hierarchy']
      },
      {
        title: 'Adobe Photoshop',
        topics: ['Interface & Tools', 'Layers & Masks', 'Photo Editing', 'Digital Art']
      },
      {
        title: 'Adobe Illustrator',
        topics: ['Vector Graphics', 'Pen Tool', 'Shapes & Paths', 'Logo Design']
      },
      {
        title: 'Brand Identity Design',
        topics: ['Brand Strategy', 'Logo Creation', 'Brand Guidelines', 'Marketing Materials']
      },
      {
        title: 'Client Projects',
        topics: ['Client Communication', 'Project Workflow', 'Revisions', 'Final Delivery']
      }
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
    image: computerNetworkImg,
    learningOutcomes: [
      'Design and implement network infrastructures',
      'Configure routers, switches, and firewalls',
      'Troubleshoot network connectivity issues',
      'Perform system maintenance and upgrades',
      'Implement network security measures'
    ],
    modules: [
      {
        title: 'Network Fundamentals',
        topics: ['OSI Model', 'Network Topologies', 'IP Addressing', 'Subnetting']
      },
      {
        title: 'TCP/IP & Protocols',
        topics: ['TCP/IP Suite', 'DNS', 'DHCP', 'HTTP/HTTPS']
      },
      {
        title: 'Hardware Maintenance',
        topics: ['PC Assembly', 'Component Testing', 'Hardware Upgrades', 'Preventive Maintenance']
      },
      {
        title: 'Troubleshooting',
        topics: ['Diagnostic Tools', 'Problem Solving', 'System Recovery', 'Documentation']
      },
      {
        title: 'Network Security',
        topics: ['Firewall Configuration', 'VPN Setup', 'Security Best Practices', 'Monitoring']
      }
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
    image: cctvInstallationImg,
    learningOutcomes: [
      'Install and configure CCTV systems',
      'Select appropriate cameras for different scenarios',
      'Set up recording and monitoring systems',
      'Perform routine maintenance and repairs',
      'Understand legal and privacy considerations'
    ],
    modules: [
      {
        title: 'CCTV System Basics',
        topics: ['System Components', 'Analog vs IP Cameras', 'DVR/NVR Systems', 'Power Requirements']
      },
      {
        title: 'Camera Types & Selection',
        topics: ['Indoor/Outdoor Cameras', 'Resolution & Quality', 'Lens Selection', 'Night Vision']
      },
      {
        title: 'Installation Techniques',
        topics: ['Site Survey', 'Cable Running', 'Mounting', 'Cable Management']
      },
      {
        title: 'System Configuration',
        topics: ['Camera Settings', 'Recording Setup', 'Remote Access', 'Mobile App Setup']
      },
      {
        title: 'Maintenance & Troubleshooting',
        topics: ['Regular Maintenance', 'Common Issues', 'Testing Procedures', 'System Upgrades']
      }
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
    image: cyberSecurityImg,
    learningOutcomes: [
      'Identify and mitigate security threats',
      'Perform penetration testing and vulnerability assessments',
      'Implement security policies and procedures',
      'Use cybersecurity tools and techniques',
      'Understand ethical hacking principles'
    ],
    modules: [
      {
        title: 'Security Fundamentals',
        topics: ['CIA Triad', 'Security Principles', 'Risk Management', 'Compliance']
      },
      {
        title: 'Threat Analysis',
        topics: ['Threat Intelligence', 'Attack Vectors', 'Malware Analysis', 'Social Engineering']
      },
      {
        title: 'Penetration Testing',
        topics: ['Testing Methodology', 'Scanning Tools', 'Exploitation', 'Reporting']
      },
      {
        title: 'Ethical Hacking',
        topics: ['Reconnaissance', 'Web Application Testing', 'Network Exploitation', 'Post-Exploitation']
      },
      {
        title: 'Security Best Practices',
        topics: ['Incident Response', 'Security Monitoring', 'Defense Strategies', 'Security Awareness']
      }
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
    image: humanResourcesImg,
    learningOutcomes: [
      'Manage full recruitment lifecycle',
      'Develop performance management systems',
      'Handle employee relations effectively',
      'Ensure HR legal compliance',
      'Create HR policies and procedures'
    ],
    modules: [
      {
        title: 'HR Fundamentals',
        topics: ['HR Function Overview', 'HR Strategy', 'Organizational Structure', 'HR Metrics']
      },
      {
        title: 'Recruitment & Selection',
        topics: ['Job Analysis', 'Sourcing Candidates', 'Interview Techniques', 'Onboarding']
      },
      {
        title: 'Performance Management',
        topics: ['Goal Setting', 'Performance Reviews', 'Feedback', 'Development Plans']
      },
      {
        title: 'Employee Relations',
        topics: ['Communication', 'Conflict Resolution', 'Employee Engagement', 'Retention Strategies']
      },
      {
        title: 'HR Legal Compliance',
        topics: ['Employment Law', 'Labor Regulations', 'Documentation', 'Risk Management']
      }
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
    image: businessAdminImg,
    learningOutcomes: [
      'Manage business operations effectively',
      'Create financial reports and budgets',
      'Develop strategic business plans',
      'Lead teams and projects',
      'Make data-driven business decisions'
    ],
    modules: [
      {
        title: 'Business Fundamentals',
        topics: ['Business Models', 'Market Analysis', 'Business Ethics', 'Communication']
      },
      {
        title: 'Operations Management',
        topics: ['Process Optimization', 'Quality Management', 'Supply Chain', 'Project Management']
      },
      {
        title: 'Financial Management',
        topics: ['Accounting Basics', 'Budgeting', 'Financial Analysis', 'Cost Control']
      },
      {
        title: 'Strategic Planning',
        topics: ['SWOT Analysis', 'Goal Setting', 'Implementation', 'Performance Monitoring']
      },
      {
        title: 'Leadership Skills',
        topics: ['Team Building', 'Decision Making', 'Conflict Management', 'Change Management']
      }
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
    image: transportLogisticsImg,
    learningOutcomes: [
      'Manage supply chain operations',
      'Optimize transportation routes',
      'Oversee warehouse operations',
      'Implement inventory control systems',
      'Use logistics management software'
    ],
    modules: [
      {
        title: 'Supply Chain Basics',
        topics: ['Supply Chain Overview', 'Procurement', 'Supplier Management', 'Distribution']
      },
      {
        title: 'Transportation Management',
        topics: ['Mode Selection', 'Route Planning', 'Cost Optimization', 'Carrier Management']
      },
      {
        title: 'Warehouse Operations',
        topics: ['Layout Design', 'Receiving & Storage', 'Order Picking', 'Safety Standards']
      },
      {
        title: 'Inventory Control',
        topics: ['Inventory Methods', 'Stock Management', 'Forecasting', 'ABC Analysis']
      },
      {
        title: 'Logistics Technology',
        topics: ['WMS Systems', 'TMS Software', 'Tracking Systems', 'Automation']
      }
    ]
  }
];
