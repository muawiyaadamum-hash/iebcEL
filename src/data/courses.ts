import { Course } from '@/types/course';
import webDesignImg from '@/assets/web-design.jpg';
import graphicsDesignImg from '@/assets/graphics-design.jpg';
import computerNetworkImg from '@/assets/computer-network.jpg';
import cctvInstallationImg from '@/assets/cctv-installation.jpg';
import cyberSecurityImg from '@/assets/cyber-security.jpg';
import humanResourcesImg from '@/assets/human-resources.jpg';
import businessAdminImg from '@/assets/business-admin.jpg';
import transportLogisticsImg from '@/assets/transport-logistics.jpg';
import aiBasicsImg from '@/assets/ai-basics.jpg';

export const courses: Course[] = [
  // ============ TECHNOLOGY COURSES ============
  {
    id: 'ai-basics',
    title: 'AI & Artificial Intelligence Basics',
    description: 'Discover the world of Artificial Intelligence and Machine Learning. Learn fundamental concepts, practical applications, and how AI is transforming industries across the globe.',
    category: 'Technology',
    duration: '10 weeks',
    level: 'Beginner',
    price: 35000,
    image: aiBasicsImg,
    learningOutcomes: [
      'Understand core AI and Machine Learning concepts',
      'Build simple AI models using Python',
      'Apply AI to solve real-world problems',
      'Use popular AI tools and platforms',
      'Understand ethical AI considerations'
    ],
    modules: [
      {
        title: 'Introduction to AI',
        topics: ['What is AI?', 'History of AI', 'Types of AI', 'AI vs Machine Learning'],
        content: `
# What is Artificial Intelligence?

Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. The term was first coined by John McCarthy in 1956.

## Key Concepts

### 1. Machine Learning
Machine learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.

### 2. Deep Learning
Deep learning uses neural networks with multiple layers to progressively extract higher-level features from raw input.

### 3. Natural Language Processing
NLP enables computers to understand, interpret, and generate human language.

## Real-World Applications
- **Healthcare**: Disease diagnosis, drug discovery
- **Finance**: Fraud detection, algorithmic trading
- **Transportation**: Self-driving cars, route optimization
- **Customer Service**: Chatbots, virtual assistants

## Activity
Think about 3 ways AI is already impacting your daily life. Write them down and share with your classmates.
        `
      },
      {
        title: 'Machine Learning Fundamentals',
        topics: ['Supervised Learning', 'Unsupervised Learning', 'Training Models', 'Evaluation Metrics'],
        content: `
# Machine Learning Fundamentals

Machine Learning is the science of getting computers to learn from data without being explicitly programmed.

## Types of Machine Learning

### 1. Supervised Learning
- Uses labeled training data
- Examples: Classification, Regression
- Applications: Spam detection, price prediction

### 2. Unsupervised Learning
- Works with unlabeled data
- Examples: Clustering, Dimensionality Reduction
- Applications: Customer segmentation, anomaly detection

### 3. Reinforcement Learning
- Learns through trial and error
- Uses rewards and penalties
- Applications: Game playing, robotics

## The ML Pipeline
1. Data Collection
2. Data Preprocessing
3. Feature Engineering
4. Model Selection
5. Training
6. Evaluation
7. Deployment

## Key Metrics
- **Accuracy**: Percentage of correct predictions
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1 Score**: Harmonic mean of precision and recall
        `
      },
      {
        title: 'Python for AI',
        topics: ['Python Basics', 'NumPy & Pandas', 'Data Visualization', 'Jupyter Notebooks'],
        content: `
# Python for AI Development

Python is the most popular programming language for AI and Machine Learning due to its simplicity and powerful libraries.

## Essential Libraries

### NumPy
\`\`\`python
import numpy as np

# Create arrays
arr = np.array([1, 2, 3, 4, 5])

# Mathematical operations
mean = np.mean(arr)
std = np.std(arr)
\`\`\`

### Pandas
\`\`\`python
import pandas as pd

# Load data
df = pd.read_csv('data.csv')

# Basic operations
df.head()
df.describe()
df.info()
\`\`\`

### Matplotlib & Seaborn
\`\`\`python
import matplotlib.pyplot as plt
import seaborn as sns

# Create visualizations
plt.plot(x, y)
sns.heatmap(correlation_matrix)
\`\`\`

## Jupyter Notebooks
- Interactive development environment
- Mix code, text, and visualizations
- Perfect for data exploration and prototyping
        `
      },
      {
        title: 'Practical AI Applications',
        topics: ['Image Recognition', 'Natural Language Processing', 'Chatbots', 'Recommendation Systems'],
        content: `
# Building Practical AI Applications

Learn to build real-world AI applications that solve actual problems.

## Image Recognition

### How it Works
1. Image preprocessing
2. Feature extraction using CNNs
3. Classification

### Applications
- Face recognition systems
- Medical image analysis
- Quality control in manufacturing

## Natural Language Processing

### Key Tasks
- Text classification
- Sentiment analysis
- Named entity recognition
- Machine translation

### Building a Simple Chatbot
1. Define intents and responses
2. Train on conversation data
3. Implement response generation
4. Add context handling

## Recommendation Systems

### Types
- **Content-based**: Recommends similar items
- **Collaborative filtering**: Based on user behavior
- **Hybrid**: Combines both approaches

### Example: Movie Recommendations
1. Collect user ratings
2. Build user-item matrix
3. Calculate similarities
4. Generate recommendations
        `
      },
      {
        title: 'AI Tools & Future Trends',
        topics: ['ChatGPT & LLMs', 'AI Ethics', 'Career Opportunities', 'Building AI Projects'],
        content: `
# AI Tools, Ethics & Future Trends

## Large Language Models (LLMs)

### What are LLMs?
- Trained on massive text datasets
- Can generate human-like text
- Examples: GPT-4, Claude, Gemini

### Using LLMs Effectively
- Prompt engineering best practices
- Understanding limitations
- Combining with other tools

## AI Ethics & Responsibility

### Key Considerations
- **Bias**: AI systems can perpetuate existing biases
- **Privacy**: Data collection and usage concerns
- **Transparency**: Understanding how AI makes decisions
- **Accountability**: Who is responsible for AI decisions?

## Career Opportunities

### In-Demand Roles
- Machine Learning Engineer
- Data Scientist
- AI Research Scientist
- ML Ops Engineer
- AI Product Manager

### Skills to Develop
- Programming (Python, SQL)
- Mathematics (Linear Algebra, Statistics)
- Domain expertise
- Communication skills

## Building Your First AI Project
1. Choose a problem to solve
2. Gather and prepare data
3. Select appropriate models
4. Train and evaluate
5. Deploy and monitor
        `
      }
    ],
    featured: true
  },
  {
    id: 'ai-advanced',
    title: 'Advanced AI & Deep Learning',
    description: 'Master advanced AI concepts including neural networks, deep learning architectures, and cutting-edge AI research applications.',
    category: 'Technology',
    duration: '14 weeks',
    level: 'Advanced',
    price: 35000,
    image: aiBasicsImg,
    learningOutcomes: [
      'Build and train deep neural networks',
      'Implement CNNs, RNNs, and Transformers',
      'Work with advanced AI frameworks',
      'Deploy AI models to production',
      'Understand state-of-the-art AI research'
    ],
    modules: [
      {
        title: 'Neural Networks Deep Dive',
        topics: ['Perceptrons', 'Backpropagation', 'Activation Functions', 'Optimization Algorithms'],
        content: `
# Deep Dive into Neural Networks

## The Perceptron
The basic building block of neural networks.

### Mathematical Representation
\`\`\`
output = activation(Σ(wi * xi) + bias)
\`\`\`

## Backpropagation Algorithm
The key algorithm for training neural networks.

### Steps:
1. Forward pass - compute predictions
2. Calculate loss
3. Backward pass - compute gradients
4. Update weights

## Activation Functions

### Common Functions
- **ReLU**: max(0, x) - Most popular for hidden layers
- **Sigmoid**: 1/(1+e^-x) - For binary output
- **Softmax**: For multi-class classification
- **Tanh**: For values between -1 and 1

## Optimization Algorithms
- **SGD**: Stochastic Gradient Descent
- **Adam**: Adaptive Moment Estimation
- **RMSprop**: Root Mean Square Propagation
        `
      },
      {
        title: 'Convolutional Neural Networks',
        topics: ['CNN Architecture', 'Convolution Operations', 'Pooling Layers', 'Transfer Learning'],
        content: `
# Convolutional Neural Networks (CNNs)

## Architecture Overview

### Key Components
1. **Convolutional Layers**: Extract features using filters
2. **Pooling Layers**: Reduce spatial dimensions
3. **Fully Connected Layers**: Make final predictions

## Convolution Operation
\`\`\`python
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])
\`\`\`

## Transfer Learning
Use pre-trained models for new tasks:
- VGG16, VGG19
- ResNet
- Inception
- EfficientNet
        `
      },
      {
        title: 'Recurrent Neural Networks',
        topics: ['RNN Basics', 'LSTM Networks', 'GRU', 'Sequence-to-Sequence Models'],
        content: `
# Recurrent Neural Networks

## Understanding RNNs
RNNs are designed to work with sequential data by maintaining a hidden state.

## Long Short-Term Memory (LSTM)
Solves the vanishing gradient problem in standard RNNs.

### LSTM Cell Components
- Forget Gate
- Input Gate
- Output Gate
- Cell State

## Gated Recurrent Units (GRU)
A simpler alternative to LSTM with similar performance.

## Applications
- Time series prediction
- Natural language processing
- Speech recognition
- Music generation

## Code Example
\`\`\`python
from tensorflow.keras.layers import LSTM, Dense

model = tf.keras.Sequential([
    LSTM(128, return_sequences=True, input_shape=(timesteps, features)),
    LSTM(64),
    Dense(1)
])
\`\`\`
        `
      },
      {
        title: 'Transformers & Attention',
        topics: ['Attention Mechanism', 'Transformer Architecture', 'BERT & GPT', 'Fine-tuning LLMs'],
        content: `
# Transformers & Attention Mechanisms

## The Attention Mechanism
"Attention is All You Need" - The paper that changed NLP.

### Self-Attention
Allows the model to focus on different parts of the input sequence.

## Transformer Architecture

### Encoder-Decoder Structure
- **Encoder**: Processes input sequence
- **Decoder**: Generates output sequence

### Key Components
- Multi-Head Attention
- Position Encodings
- Feed-Forward Networks
- Layer Normalization

## BERT (Bidirectional Encoder Representations from Transformers)
- Pre-trained on massive text corpus
- Fine-tune for specific tasks
- Understands context from both directions

## GPT (Generative Pre-trained Transformer)
- Autoregressive language model
- Excellent for text generation
- Foundation for ChatGPT
        `
      },
      {
        title: 'AI Model Deployment',
        topics: ['Model Optimization', 'Containerization', 'Cloud Deployment', 'MLOps Best Practices'],
        content: `
# Deploying AI Models to Production

## Model Optimization

### Techniques
- Quantization - Reduce precision
- Pruning - Remove unnecessary weights
- Knowledge Distillation - Train smaller models

## Containerization with Docker
\`\`\`dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
\`\`\`

## Cloud Deployment Options
- AWS SageMaker
- Google Cloud AI Platform
- Azure ML
- Hugging Face Spaces

## MLOps Best Practices
1. Version control for models
2. Automated testing
3. Monitoring and logging
4. A/B testing
5. Continuous training
        `
      }
    ]
  },
  {
    id: 'web-design',
    title: 'Web Design & Development',
    description: 'Master modern web design principles, UI/UX best practices, and create stunning websites that engage users. Learn HTML, CSS, JavaScript and modern frameworks.',
    category: 'Technology',
    duration: '8 weeks',
    level: 'Beginner',
    price: 35000,
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
        topics: ['HTML Structure', 'CSS Styling', 'Box Model', 'Flexbox & Grid'],
        content: `
# HTML & CSS Fundamentals

## HTML Structure

### Basic HTML Document
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <header>
        <nav>Navigation</nav>
    </header>
    <main>
        <section>Content</section>
    </main>
    <footer>Footer</footer>
</body>
</html>
\`\`\`

## CSS Box Model
Every element is a box with:
- **Content**: The actual content
- **Padding**: Space inside the border
- **Border**: The border around padding
- **Margin**: Space outside the border

## Flexbox Layout
\`\`\`css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}
\`\`\`

## CSS Grid
\`\`\`css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
\`\`\`
        `
      },
      {
        title: 'Responsive Design',
        topics: ['Mobile-First Approach', 'Media Queries', 'Responsive Images'],
        content: `
# Responsive Web Design

## Mobile-First Approach
Start designing for mobile devices, then scale up.

### Benefits
- Better performance on mobile
- Forces focus on essential content
- Easier to scale up than down

## Media Queries
\`\`\`css
/* Mobile first - base styles */
.container {
    padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        padding: 2rem;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
}
\`\`\`

## Responsive Images
\`\`\`html
<picture>
    <source media="(min-width: 1024px)" srcset="large.jpg">
    <source media="(min-width: 768px)" srcset="medium.jpg">
    <img src="small.jpg" alt="Responsive image">
</picture>
\`\`\`
        `
      },
      {
        title: 'UI/UX Principles',
        topics: ['User Research', 'Wireframing', 'Design Systems', 'Accessibility'],
        content: `
# UI/UX Design Principles

## User Research Methods
1. User interviews
2. Surveys
3. Usability testing
4. Analytics analysis
5. Competitive analysis

## Wireframing Process
1. Sketch ideas on paper
2. Create low-fidelity wireframes
3. Test with users
4. Iterate based on feedback
5. Create high-fidelity mockups

## Design Systems
A collection of reusable components and guidelines.

### Components of a Design System
- Color palette
- Typography scale
- Spacing system
- Component library
- Documentation

## Web Accessibility (WCAG)

### Key Principles
- **Perceivable**: Content accessible to all senses
- **Operable**: Can be navigated by all users
- **Understandable**: Content is clear and readable
- **Robust**: Works with assistive technologies
        `
      },
      {
        title: 'Design Tools (Figma)',
        topics: ['Interface Basics', 'Components', 'Prototyping', 'Collaboration'],
        content: `
# Mastering Figma

## Interface Overview
- Canvas: Your design workspace
- Layers panel: Organize elements
- Properties panel: Edit selected elements
- Toolbar: Access design tools

## Creating Components

### Auto Layout
Automatically resize and reflow content.

### Variants
Create multiple states of a component:
- Default
- Hover
- Active
- Disabled

## Prototyping
1. Select frames to connect
2. Add interactions (click, hover, drag)
3. Set animations
4. Preview and test

## Collaboration Features
- Real-time collaboration
- Comments and feedback
- Version history
- Developer handoff
        `
      },
      {
        title: 'Portfolio Project',
        topics: ['Project Planning', 'Implementation', 'Deployment', 'Portfolio Presentation'],
        content: `
# Building Your Portfolio

## Project Planning
1. Define your goals
2. Research inspiration
3. Create sitemap
4. Design mockups
5. Plan content

## Implementation Steps

### 1. Set Up Project
\`\`\`bash
mkdir portfolio
cd portfolio
npm init -y
\`\`\`

### 2. Structure Your Files
\`\`\`
portfolio/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── images/
\`\`\`

## Deployment Options
- GitHub Pages (Free)
- Netlify (Free)
- Vercel (Free)
- Custom hosting

## Portfolio Best Practices
- Showcase your best work
- Tell your story
- Include contact information
- Keep it updated
- Make it mobile-friendly
        `
      }
    ],
    featured: true
  },
  {
    id: 'web-development-advanced',
    title: 'Full Stack Web Development',
    description: 'Become a full-stack developer. Master React, Node.js, databases, and modern web development practices.',
    category: 'Technology',
    duration: '16 weeks',
    level: 'Advanced',
    price: 35000,
    image: webDesignImg,
    learningOutcomes: [
      'Build full-stack applications with React and Node.js',
      'Work with databases (SQL and NoSQL)',
      'Implement authentication and authorization',
      'Deploy applications to cloud platforms',
      'Follow industry best practices'
    ],
    modules: [
      {
        title: 'JavaScript Deep Dive',
        topics: ['ES6+ Features', 'Async Programming', 'Closures & Scope', 'TypeScript Basics'],
        content: `
# JavaScript Deep Dive

## ES6+ Features

### Arrow Functions
\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

### Destructuring
\`\`\`javascript
const { name, age } = person;
const [first, second] = array;
\`\`\`

### Spread Operator
\`\`\`javascript
const combined = [...array1, ...array2];
const merged = { ...obj1, ...obj2 };
\`\`\`

## Async Programming

### Promises
\`\`\`javascript
fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

### Async/Await
\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
\`\`\`
        `
      },
      {
        title: 'React Framework',
        topics: ['Components & Props', 'State Management', 'Hooks', 'Context API'],
        content: `
# React Framework Mastery

## Components
\`\`\`jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

## State with useState
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

## Effects with useEffect
\`\`\`jsx
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

## Custom Hooks
\`\`\`jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}
\`\`\`
        `
      },
      {
        title: 'Node.js & Express',
        topics: ['Node.js Basics', 'Express Server', 'REST APIs', 'Middleware'],
        content: `
# Node.js & Express

## Setting Up Express
\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Middleware
\`\`\`javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
\`\`\`
        `
      },
      {
        title: 'Database Integration',
        topics: ['SQL Fundamentals', 'PostgreSQL', 'MongoDB', 'ORMs'],
        content: `
# Database Integration

## SQL Fundamentals
\`\`\`sql
-- Create table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- Insert data
INSERT INTO users (name, email) VALUES ('John', 'john@email.com');

-- Query data
SELECT * FROM users WHERE email LIKE '%@email.com';
\`\`\`

## MongoDB
\`\`\`javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', userSchema);
\`\`\`

## ORM with Prisma
\`\`\`javascript
const user = await prisma.user.create({
  data: {
    name: 'John',
    email: 'john@email.com'
  }
});
\`\`\`
        `
      },
      {
        title: 'Deployment & DevOps',
        topics: ['Git & GitHub', 'CI/CD', 'Docker Basics', 'Cloud Deployment'],
        content: `
# Deployment & DevOps

## Git Workflow
\`\`\`bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
\`\`\`

## Docker
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## CI/CD with GitHub Actions
\`\`\`yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
\`\`\`
        `
      }
    ]
  },
  {
    id: 'graphics-design',
    title: 'Graphics Design',
    description: 'Learn professional graphic design techniques, branding, and digital illustration using industry-standard tools like Adobe Photoshop and Illustrator.',
    category: 'Technology',
    duration: '8 weeks',
    level: 'Beginner',
    price: 35000,
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
        topics: ['Color Theory', 'Typography', 'Composition', 'Visual Hierarchy'],
        content: `
# Design Fundamentals

## Color Theory

### The Color Wheel
- **Primary Colors**: Red, Blue, Yellow
- **Secondary Colors**: Orange, Green, Purple
- **Tertiary Colors**: Combinations

### Color Harmonies
- Complementary (opposite colors)
- Analogous (adjacent colors)
- Triadic (three evenly spaced)
- Split-complementary

### Color Psychology
- Red: Energy, passion, urgency
- Blue: Trust, calm, professional
- Green: Nature, growth, health
- Yellow: Optimism, clarity, warmth

## Typography

### Font Categories
- **Serif**: Traditional, trustworthy (Times New Roman)
- **Sans-serif**: Modern, clean (Helvetica)
- **Script**: Elegant, personal
- **Display**: Decorative, attention-grabbing

### Typography Rules
1. Limit fonts to 2-3 per design
2. Create contrast with weight and size
3. Maintain consistent spacing
4. Consider readability
        `
      },
      {
        title: 'Adobe Photoshop',
        topics: ['Interface & Tools', 'Layers & Masks', 'Photo Editing', 'Digital Art'],
        content: `
# Adobe Photoshop Mastery

## Interface Overview
- Toolbox: Selection, painting, retouching tools
- Layers panel: Organize design elements
- Properties: Adjust selected elements
- History: Undo/redo actions

## Working with Layers

### Layer Types
- Image layers
- Adjustment layers
- Text layers
- Shape layers
- Smart objects

### Layer Masks
Non-destructive way to hide/reveal parts of layers.

## Essential Photo Editing

### Basic Adjustments
1. Crop and straighten
2. Exposure correction
3. Color correction
4. Sharpening

### Retouching Tools
- Spot Healing Brush
- Clone Stamp
- Content-Aware Fill
- Dodge and Burn
        `
      },
      {
        title: 'Adobe Illustrator',
        topics: ['Vector Graphics', 'Pen Tool', 'Shapes & Paths', 'Logo Design'],
        content: `
# Adobe Illustrator Fundamentals

## Vector vs Raster
- **Vector**: Scalable without quality loss
- **Raster**: Pixel-based, quality depends on resolution

## The Pen Tool
The most important tool for creating custom shapes.

### Pen Tool Tips
1. Click for corner points
2. Click and drag for curves
3. Hold Alt to convert points
4. Use minimal anchor points

## Shape Tools
- Rectangle and rounded rectangle
- Ellipse
- Polygon
- Star
- Line

## Pathfinder Operations
- Unite: Combine shapes
- Minus Front: Subtract shapes
- Intersect: Keep overlapping areas
- Exclude: Remove overlapping areas

## Logo Design Process
1. Research and brainstorm
2. Sketch ideas
3. Digitize best concepts
4. Refine and iterate
5. Create variations
        `
      },
      {
        title: 'Brand Identity Design',
        topics: ['Brand Strategy', 'Logo Creation', 'Brand Guidelines', 'Marketing Materials'],
        content: `
# Brand Identity Design

## Brand Strategy

### Key Questions
- What is the brand's mission?
- Who is the target audience?
- What values does the brand represent?
- How should people feel about the brand?

## Logo Design

### Logo Types
- Wordmark (Google, Coca-Cola)
- Lettermark (IBM, HBO)
- Symbol (Apple, Twitter)
- Combination (Adidas, Burger King)
- Emblem (Starbucks, Harley-Davidson)

### Logo Principles
- Simple and memorable
- Versatile and scalable
- Timeless
- Appropriate for audience

## Brand Guidelines

### Components
- Logo usage rules
- Color palette (primary, secondary)
- Typography standards
- Imagery style
- Voice and tone

## Marketing Materials
- Business cards
- Letterhead
- Social media templates
- Presentations
- Signage
        `
      },
      {
        title: 'Client Projects',
        topics: ['Client Communication', 'Project Workflow', 'Revisions', 'Final Delivery'],
        content: `
# Working with Clients

## Initial Consultation
1. Understand client needs
2. Define project scope
3. Set timeline and budget
4. Establish communication channels

## Project Workflow

### Design Process
1. Discovery and research
2. Concept development
3. First presentation
4. Revisions (typically 2-3 rounds)
5. Final approval
6. File delivery

## Managing Revisions
- Document all feedback
- Set revision limits in contract
- Charge for extra revisions
- Keep versions organized

## File Delivery

### Common Formats
- **Print**: PDF, EPS, AI (CMYK)
- **Web**: PNG, JPG, SVG (RGB)
- **Source files**: AI, PSD

### Delivery Package
- Final designs in all formats
- Source files
- Font licenses
- Brand guidelines
- Usage instructions
        `
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
    price: 35000,
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
        topics: ['OSI Model', 'Network Topologies', 'IP Addressing', 'Subnetting'],
        content: `
# Network Fundamentals

## OSI Model (7 Layers)

| Layer | Name | Function | Examples |
|-------|------|----------|----------|
| 7 | Application | User interface | HTTP, FTP |
| 6 | Presentation | Data formatting | SSL, JPEG |
| 5 | Session | Connection management | NetBIOS |
| 4 | Transport | End-to-end delivery | TCP, UDP |
| 3 | Network | Routing | IP, ICMP |
| 2 | Data Link | Node-to-node | Ethernet |
| 1 | Physical | Physical transmission | Cables |

## Network Topologies
- **Star**: All devices connect to central hub
- **Bus**: Single cable, devices tap in
- **Ring**: Circular connection
- **Mesh**: Multiple interconnections
- **Hybrid**: Combination of topologies

## IP Addressing

### IPv4 Classes
- Class A: 1.0.0.0 - 126.255.255.255
- Class B: 128.0.0.0 - 191.255.255.255
- Class C: 192.0.0.0 - 223.255.255.255

### Subnetting
Dividing networks into smaller segments for efficiency and security.
        `
      },
      {
        title: 'TCP/IP & Protocols',
        topics: ['TCP/IP Suite', 'DNS', 'DHCP', 'HTTP/HTTPS'],
        content: `
# TCP/IP & Protocols

## TCP vs UDP

### TCP (Transmission Control Protocol)
- Connection-oriented
- Reliable delivery
- Error checking
- Used for: Web, email, file transfer

### UDP (User Datagram Protocol)
- Connectionless
- Fast but unreliable
- No error recovery
- Used for: Streaming, gaming, VoIP

## DNS (Domain Name System)
Translates domain names to IP addresses.

### DNS Record Types
- A: IPv4 address
- AAAA: IPv6 address
- CNAME: Alias
- MX: Mail server
- TXT: Text information

## DHCP
Automatically assigns IP addresses to devices.

### DHCP Process (DORA)
1. Discover
2. Offer
3. Request
4. Acknowledge
        `
      },
      {
        title: 'Hardware Maintenance',
        topics: ['PC Assembly', 'Component Testing', 'Hardware Upgrades', 'Preventive Maintenance'],
        content: `
# Hardware Maintenance

## PC Components

### Core Components
- CPU (Central Processing Unit)
- RAM (Random Access Memory)
- Motherboard
- Storage (SSD/HDD)
- Power Supply Unit (PSU)
- GPU (Graphics Processing Unit)

## Assembly Steps
1. Install CPU and cooler
2. Insert RAM modules
3. Mount motherboard in case
4. Connect power supply
5. Install storage drives
6. Connect cables
7. Install GPU (if separate)

## Troubleshooting Hardware

### POST Codes
- 1 beep: System OK
- Continuous beeps: RAM issue
- 3 short beeps: Keyboard error

### Testing Tools
- Multimeter for power testing
- Diagnostic software
- Cable testers

## Preventive Maintenance
- Regular cleaning (dust removal)
- Thermal paste replacement
- Cable management
- Firmware updates
        `
      },
      {
        title: 'Troubleshooting',
        topics: ['Diagnostic Tools', 'Problem Solving', 'System Recovery', 'Documentation'],
        content: `
# Network Troubleshooting

## Diagnostic Commands

### Windows
\`\`\`cmd
ipconfig /all        # View network config
ping 8.8.8.8         # Test connectivity
tracert google.com   # Trace route
nslookup domain.com  # DNS lookup
netstat -an          # Active connections
\`\`\`

### Linux
\`\`\`bash
ifconfig             # Network config
ping -c 4 8.8.8.8    # Test connectivity
traceroute google.com # Trace route
dig domain.com       # DNS lookup
netstat -tuln        # Active connections
\`\`\`

## Troubleshooting Methodology
1. Identify the problem
2. Establish a theory
3. Test the theory
4. Establish a plan
5. Implement the solution
6. Verify functionality
7. Document everything

## Common Issues
- No connectivity: Check cables, DHCP
- Slow network: Check bandwidth, interference
- Intermittent: Check hardware, drivers
        `
      },
      {
        title: 'Network Security',
        topics: ['Firewall Configuration', 'VPN Setup', 'Security Best Practices', 'Monitoring'],
        content: `
# Network Security

## Firewall Configuration

### Types of Firewalls
- Packet filtering
- Stateful inspection
- Application layer
- Next-generation (NGFW)

### Basic Rules
\`\`\`
# Allow inbound HTTP
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Allow inbound HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Block all other inbound
iptables -A INPUT -j DROP
\`\`\`

## VPN Setup
- Site-to-site: Connect networks
- Remote access: Connect users
- Protocols: OpenVPN, WireGuard, IPSec

## Security Best Practices
1. Regular updates and patches
2. Strong password policies
3. Network segmentation
4. Access control lists
5. Regular security audits

## Monitoring Tools
- Wireshark: Packet analysis
- Nagios: Network monitoring
- SNMP: Device management
        `
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
    price: 35000,
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
        topics: ['System Components', 'Analog vs IP Cameras', 'DVR/NVR Systems', 'Power Requirements'],
        content: `
# CCTV System Basics

## System Components

### Camera Types
- Analog cameras (older, simpler)
- IP cameras (network-based, higher quality)
- HD-SDI cameras (high definition over coax)

### Recording Devices
- **DVR** (Digital Video Recorder): For analog cameras
- **NVR** (Network Video Recorder): For IP cameras

## Analog vs IP Cameras

| Feature | Analog | IP |
|---------|--------|-----|
| Resolution | Up to 1080p | 4K and beyond |
| Cabling | Coax | Ethernet |
| Power | Separate | PoE capable |
| Cost | Lower | Higher |
| Scalability | Limited | Flexible |

## Power Requirements

### Power Options
- Individual power supplies
- Power distribution box
- PoE (Power over Ethernet)
- UPS backup

### Calculating Power Needs
Total wattage = Σ(camera watts) + recorder watts + margin (20%)
        `
      },
      {
        title: 'Camera Types & Selection',
        topics: ['Indoor/Outdoor Cameras', 'Resolution & Quality', 'Lens Selection', 'Night Vision'],
        content: `
# Camera Selection Guide

## Indoor vs Outdoor

### Indoor Cameras
- Dome cameras (discreet)
- Box cameras (versatile)
- PTZ for large areas

### Outdoor Cameras
- Weatherproof housing (IP66+)
- Vandal-resistant
- Temperature rated

## Resolution Guidelines

| Resolution | Best For |
|------------|----------|
| 1080p | General surveillance |
| 2K (4MP) | Detail recognition |
| 4K (8MP) | Large areas, facial ID |

## Lens Selection

### Focal Length
- 2.8mm: Wide angle (90°)
- 4mm: Standard (70°)
- 6mm: Narrow (50°)
- 12mm+: Telephoto (30°)

### Varifocal vs Fixed
- Fixed: Set focal length
- Varifocal: Adjustable range

## Night Vision

### Technologies
- IR LEDs: Most common
- Starlight: Low-light color
- Thermal: Heat detection
        `
      },
      {
        title: 'Installation Techniques',
        topics: ['Site Survey', 'Cable Running', 'Mounting', 'Cable Management'],
        content: `
# CCTV Installation

## Site Survey

### Checklist
1. Identify coverage areas
2. Note lighting conditions
3. Check power availability
4. Plan cable routes
5. Identify mounting points
6. Document obstacles

## Cable Running

### Cable Types
- RG59/RG6 for analog
- Cat5e/Cat6 for IP
- Fiber for long runs

### Best Practices
- Avoid electrical interference
- Use conduit for protection
- Leave service loops
- Label all cables
- Test before burying

## Mounting Guidelines

### Height Recommendations
- Standard: 2.5-3m
- Facial recognition: 2-2.5m
- Overview: 3-4m

### Mounting Tips
- Use appropriate anchors
- Weatherproof outdoor mounts
- Secure cable connections
- Consider maintenance access

## Cable Management
- Use cable trays
- Secure at regular intervals
- Protect from damage
- Color code if needed
        `
      },
      {
        title: 'System Configuration',
        topics: ['Camera Settings', 'Recording Setup', 'Remote Access', 'Mobile App Setup'],
        content: `
# System Configuration

## Camera Settings

### Essential Adjustments
- Resolution and frame rate
- Bitrate and compression
- Motion detection zones
- Privacy masks
- Image settings (brightness, contrast)

## Recording Configuration

### Recording Modes
- Continuous: 24/7 recording
- Scheduled: Set times
- Motion: Only on movement
- Alarm: On sensor trigger

### Storage Calculation
Storage = Bitrate × Hours × Days × Cameras ÷ 8000

## Remote Access Setup

### Steps
1. Configure network settings
2. Set up port forwarding
3. Configure DDNS (optional)
4. Create user accounts
5. Enable encryption

## Mobile App Configuration
1. Download manufacturer app
2. Add device (scan QR/manual)
3. Configure notifications
4. Set up cloud backup (optional)
5. Test remote viewing
        `
      },
      {
        title: 'Maintenance & Troubleshooting',
        topics: ['Regular Maintenance', 'Common Issues', 'Testing Procedures', 'System Upgrades'],
        content: `
# Maintenance & Troubleshooting

## Regular Maintenance Schedule

### Weekly
- Check recording status
- Review storage capacity
- Verify camera views

### Monthly
- Clean camera lenses
- Check cable connections
- Update firmware
- Review user access

### Annually
- Full system inspection
- Replace aging equipment
- Recalibrate cameras
- Test backup power

## Common Issues

### No Video Signal
1. Check power
2. Verify cables
3. Test camera directly
4. Check recorder port

### Poor Image Quality
1. Clean lens
2. Check focus
3. Adjust settings
4. Verify bandwidth

### Recording Problems
1. Check storage space
2. Verify recording settings
3. Check hard drive health
4. Review schedule

## Testing Procedures
- Use test monitor
- Check all camera angles
- Verify night vision
- Test motion detection
- Confirm remote access
        `
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
    price: 35000,
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
        topics: ['CIA Triad', 'Security Principles', 'Risk Management', 'Compliance'],
        content: `
# Security Fundamentals

## The CIA Triad

### Confidentiality
Ensuring data is accessible only to authorized users.
- Encryption
- Access controls
- Authentication

### Integrity
Maintaining data accuracy and consistency.
- Hashing
- Digital signatures
- Version control

### Availability
Ensuring systems are accessible when needed.
- Redundancy
- Backups
- DDoS protection

## Security Principles

### Defense in Depth
Multiple layers of security controls.

### Least Privilege
Users get minimum required access.

### Zero Trust
Never trust, always verify.

## Risk Management
Risk = Threat × Vulnerability × Impact

### Risk Response Options
1. Accept
2. Mitigate
3. Transfer (insurance)
4. Avoid
        `
      },
      {
        title: 'Threat Analysis',
        topics: ['Threat Intelligence', 'Attack Vectors', 'Malware Analysis', 'Social Engineering'],
        content: `
# Threat Analysis

## Common Attack Vectors

### Network Attacks
- Man-in-the-Middle
- DDoS attacks
- DNS spoofing
- ARP poisoning

### Application Attacks
- SQL injection
- Cross-site scripting (XSS)
- CSRF
- Buffer overflow

## Malware Types

| Type | Description |
|------|-------------|
| Virus | Self-replicating, attaches to files |
| Worm | Self-replicating, network-based |
| Trojan | Disguised as legitimate software |
| Ransomware | Encrypts data for ransom |
| Spyware | Collects information secretly |

## Social Engineering

### Techniques
- Phishing
- Spear phishing
- Pretexting
- Baiting
- Tailgating

### Defense
- Security awareness training
- Email filtering
- Verification procedures
        `
      },
      {
        title: 'Penetration Testing',
        topics: ['Testing Methodology', 'Scanning Tools', 'Exploitation', 'Reporting'],
        content: `
# Penetration Testing

## Testing Phases

### 1. Reconnaissance
- Passive information gathering
- OSINT (Open Source Intelligence)
- DNS enumeration

### 2. Scanning
\`\`\`bash
# Nmap port scanning
nmap -sV -sC target.com

# Vulnerability scanning
nessus, OpenVAS
\`\`\`

### 3. Gaining Access
- Exploit vulnerabilities
- Credential attacks
- Social engineering

### 4. Maintaining Access
- Backdoors
- Privilege escalation
- Persistence mechanisms

### 5. Covering Tracks
- Log manipulation
- Rootkits
- Timestomping

## Reporting

### Components
1. Executive summary
2. Technical findings
3. Risk ratings
4. Remediation recommendations
5. Evidence and proof
        `
      },
      {
        title: 'Ethical Hacking',
        topics: ['Reconnaissance', 'Web Application Testing', 'Network Exploitation', 'Post-Exploitation'],
        content: `
# Ethical Hacking

## Legal Framework
Always get written authorization before testing!

## Information Gathering

### Tools
- Shodan: Internet-connected devices
- theHarvester: Email and subdomain finder
- Maltego: Relationship mapping

## Web Application Testing

### OWASP Top 10
1. Injection
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting
8. Insecure Deserialization
9. Using Vulnerable Components
10. Insufficient Logging

### Testing Tools
- Burp Suite
- OWASP ZAP
- SQLmap
- Nikto

## Network Exploitation

### Tools
- Metasploit Framework
- Hydra (password cracking)
- Aircrack-ng (wireless)

## Post-Exploitation
- Privilege escalation
- Lateral movement
- Data exfiltration
        `
      },
      {
        title: 'Security Best Practices',
        topics: ['Incident Response', 'Security Monitoring', 'Defense Strategies', 'Security Awareness'],
        content: `
# Security Best Practices

## Incident Response

### Phases
1. Preparation
2. Identification
3. Containment
4. Eradication
5. Recovery
6. Lessons Learned

## Security Monitoring

### SIEM (Security Information and Event Management)
- Log collection
- Real-time analysis
- Alert generation
- Compliance reporting

### Key Metrics
- Mean Time to Detect (MTTD)
- Mean Time to Respond (MTTR)
- Number of incidents
- False positive rate

## Defense Strategies

### Technical Controls
- Firewalls and IDS/IPS
- Endpoint protection
- Email security
- Web filtering

### Administrative Controls
- Security policies
- Access management
- Background checks
- Security training

## Building Security Culture
- Regular training
- Phishing simulations
- Clear reporting procedures
- Positive reinforcement
        `
      }
    ]
  },
  {
    id: 'cyber-security-beginner',
    title: 'Introduction to Cyber Security',
    description: 'Start your cybersecurity journey with foundational knowledge of online safety, threat awareness, and basic security practices.',
    category: 'Technology',
    duration: '6 weeks',
    level: 'Beginner',
    price: 35000,
    image: cyberSecurityImg,
    learningOutcomes: [
      'Understand basic cybersecurity concepts',
      'Recognize common online threats',
      'Implement personal security practices',
      'Protect your digital identity',
      'Use security tools effectively'
    ],
    modules: [
      {
        title: 'What is Cybersecurity?',
        topics: ['Digital Threats Overview', 'Why Security Matters', 'Types of Hackers', 'Career Paths'],
        content: `
# Introduction to Cybersecurity

## What is Cybersecurity?
The practice of protecting systems, networks, and data from digital attacks.

## Why Does It Matter?
- Data breaches cost businesses millions
- Personal information theft
- Ransomware attacks on hospitals
- Critical infrastructure threats

## Types of Hackers

### White Hat (Ethical Hackers)
Security professionals who help find vulnerabilities.

### Black Hat (Malicious Hackers)
Criminals who exploit systems for gain.

### Grey Hat
Operate between legal and illegal.

## Career Paths
- Security Analyst
- Penetration Tester
- Security Engineer
- Incident Responder
- CISO (Chief Information Security Officer)
        `
      },
      {
        title: 'Common Online Threats',
        topics: ['Phishing Attacks', 'Malware Basics', 'Password Attacks', 'Scam Recognition'],
        content: `
# Recognizing Online Threats

## Phishing

### Red Flags
- Urgent requests
- Suspicious sender
- Grammar errors
- Mismatched URLs
- Unexpected attachments

### Example Phishing Email
"Your account has been compromised! Click here immediately to verify your identity!"

## Malware Basics

### Common Types
- Viruses: Need user action to spread
- Worms: Self-spreading
- Trojans: Hidden in legitimate software
- Ransomware: Holds data hostage

## Password Attacks

### Methods
- Brute force: Try all combinations
- Dictionary: Common words
- Credential stuffing: Stolen passwords
- Keylogging: Record keystrokes

## Scam Recognition
- Too good to be true offers
- Pressure to act quickly
- Request for unusual payment
- Unsolicited contact
        `
      },
      {
        title: 'Protecting Yourself Online',
        topics: ['Strong Passwords', 'Two-Factor Authentication', 'Safe Browsing', 'Social Media Safety'],
        content: `
# Personal Cybersecurity

## Creating Strong Passwords

### Password Rules
- 12+ characters minimum
- Mix of upper/lowercase
- Include numbers and symbols
- Avoid personal information
- Unique for each account

### Password Managers
- LastPass
- 1Password
- Bitwarden
- KeePass

## Two-Factor Authentication (2FA)

### Types
- SMS codes
- Authenticator apps (Google, Microsoft)
- Hardware keys (YubiKey)
- Biometrics

## Safe Browsing

### Best Practices
- Check for HTTPS
- Avoid public WiFi for sensitive tasks
- Use VPN when needed
- Keep browser updated
- Use ad blockers

## Social Media Safety
- Limit personal information
- Use privacy settings
- Be cautious with friend requests
- Think before you post
        `
      },
      {
        title: 'Securing Your Devices',
        topics: ['Antivirus Software', 'Software Updates', 'Backup Strategies', 'Mobile Security'],
        content: `
# Device Security

## Antivirus Software

### Features to Look For
- Real-time protection
- Regular updates
- Web protection
- Email scanning
- Ransomware protection

### Recommended Options
- Windows Defender (built-in)
- Bitdefender
- Norton
- Malwarebytes

## Software Updates

### Why Update?
- Security patches
- Bug fixes
- New features
- Compliance

### Enable Auto-Updates
- Operating system
- Browsers
- Applications
- Firmware

## Backup Strategies

### 3-2-1 Rule
- 3 copies of data
- 2 different media types
- 1 offsite copy

## Mobile Security
- Use screen lock
- Enable remote wipe
- Download from official stores
- Review app permissions
        `
      },
      {
        title: 'Privacy and Digital Footprint',
        topics: ['Online Privacy', 'Data Protection', 'Privacy Tools', 'Digital Cleanup'],
        content: `
# Privacy and Digital Footprint

## Your Digital Footprint
Everything you do online leaves traces.

### Active Footprint
- Social media posts
- Form submissions
- Online purchases
- Comments

### Passive Footprint
- Browsing history
- IP address logs
- Cookies
- Location data

## Protecting Your Privacy

### Browser Settings
- Block third-party cookies
- Enable Do Not Track
- Use private browsing
- Clear history regularly

### Privacy Tools
- VPNs (Virtual Private Networks)
- Tor Browser
- Privacy-focused search (DuckDuckGo)
- Email aliases

## Data Protection Rights
- GDPR (Europe)
- CCPA (California)
- Right to access your data
- Right to deletion

## Digital Cleanup
1. Review social media privacy
2. Delete unused accounts
3. Unsubscribe from emails
4. Remove old apps
        `
      }
    ]
  },
  // ============ HUMAN RESOURCES COURSES ============
  {
    id: 'human-resources',
    title: 'Human Resources Management',
    description: 'Develop essential HR skills including recruitment, employee relations, and organizational development.',
    category: 'Human Resources',
    duration: '10 weeks',
    level: 'Intermediate',
    price: 35000,
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
        topics: ['HR Function Overview', 'HR Strategy', 'Organizational Structure', 'HR Metrics'],
        content: `
# HR Fundamentals

## The HR Function

### Core Responsibilities
- Talent acquisition
- Compensation and benefits
- Training and development
- Employee relations
- Compliance
- Performance management

## Strategic HR

### Aligning HR with Business Goals
1. Understand business strategy
2. Identify talent implications
3. Develop HR initiatives
4. Measure outcomes

## Organizational Structures

### Types
- Functional
- Divisional
- Matrix
- Flat
- Network

## HR Metrics

### Key Metrics
- Time to hire
- Cost per hire
- Employee turnover rate
- Employee engagement score
- Training ROI
- Absence rate
        `
      },
      {
        title: 'Recruitment & Selection',
        topics: ['Job Analysis', 'Sourcing Candidates', 'Interview Techniques', 'Onboarding'],
        content: `
# Recruitment & Selection

## Job Analysis

### Components
- Job title and summary
- Essential duties
- Required qualifications
- Physical requirements
- Working conditions

## Sourcing Candidates

### Channels
- Job boards (LinkedIn, Indeed)
- Employee referrals
- Social media
- Recruitment agencies
- Campus recruiting
- Internal promotions

## Interview Techniques

### STAR Method Questions
- Situation: Describe the context
- Task: What was your responsibility?
- Action: What did you do?
- Result: What was the outcome?

### Interview Types
- Phone screening
- Panel interviews
- Behavioral interviews
- Technical assessments
- Case studies

## Onboarding

### 90-Day Plan
Week 1: Orientation and admin
Month 1: Role training
Month 2: Integration
Month 3: Full productivity
        `
      },
      {
        title: 'Performance Management',
        topics: ['Goal Setting', 'Performance Reviews', 'Feedback', 'Development Plans'],
        content: `
# Performance Management

## Goal Setting

### SMART Goals
- **S**pecific: Clear and defined
- **M**easurable: Quantifiable
- **A**chievable: Realistic
- **R**elevant: Aligned with objectives
- **T**ime-bound: Has deadline

## Performance Reviews

### Types
- Annual reviews
- Quarterly check-ins
- 360-degree feedback
- Continuous feedback

### Review Components
1. Goal achievement
2. Competency assessment
3. Development areas
4. Future goals
5. Career discussion

## Giving Feedback

### The SBI Model
- Situation: When and where
- Behavior: What you observed
- Impact: Effect of the behavior

## Individual Development Plans (IDP)
1. Assess current skills
2. Identify development goals
3. Define learning activities
4. Set timeline
5. Review progress
        `
      },
      {
        title: 'Employee Relations',
        topics: ['Communication', 'Conflict Resolution', 'Employee Engagement', 'Retention Strategies'],
        content: `
# Employee Relations

## Effective Communication

### Channels
- Town halls
- Newsletters
- Intranet
- Team meetings
- One-on-ones

## Conflict Resolution

### Steps
1. Listen to all parties
2. Identify the issue
3. Explore solutions
4. Agree on action
5. Follow up

### Mediation Techniques
- Stay neutral
- Focus on interests, not positions
- Generate options
- Use objective criteria

## Employee Engagement

### Drivers
- Meaningful work
- Growth opportunities
- Recognition
- Work-life balance
- Trust in leadership

### Measuring Engagement
- Surveys
- Pulse checks
- Exit interviews
- Stay interviews

## Retention Strategies
- Competitive compensation
- Career development
- Flexible work
- Positive culture
- Recognition programs
        `
      },
      {
        title: 'HR Legal Compliance',
        topics: ['Employment Law', 'Labor Regulations', 'Documentation', 'Risk Management'],
        content: `
# HR Legal Compliance

## Key Employment Laws

### Hiring
- Non-discrimination
- Background check laws
- Immigration compliance

### Employment
- Minimum wage
- Overtime regulations
- Leave entitlements
- Safety requirements

### Termination
- Notice requirements
- Final pay rules
- Non-compete agreements
- Severance

## Documentation

### Essential Records
- Personnel files
- Time and attendance
- Performance records
- Training records
- I-9 forms

### Retention Periods
Know how long to keep each type of record.

## Risk Management

### Common HR Risks
- Discrimination claims
- Harassment allegations
- Wrongful termination
- Wage and hour violations

### Prevention
- Clear policies
- Regular training
- Consistent application
- Documentation
- Legal review
        `
      }
    ]
  },
  {
    id: 'hr-beginner',
    title: 'Introduction to HR',
    description: 'Begin your HR career with foundational knowledge of human resources principles, practices, and terminology.',
    category: 'Human Resources',
    duration: '6 weeks',
    level: 'Beginner',
    price: 35000,
    image: humanResourcesImg,
    learningOutcomes: [
      'Understand the role of HR in organizations',
      'Learn basic HR terminology',
      'Understand employee lifecycle',
      'Know basic employment principles',
      'Prepare for HR career entry'
    ],
    modules: [
      {
        title: 'What is Human Resources?',
        topics: ['HR Role', 'HR Department Structure', 'Career Opportunities', 'Required Skills'],
        content: `
# Introduction to Human Resources

## What Does HR Do?

### Core Functions
- Hiring employees
- Managing compensation
- Training staff
- Handling issues
- Ensuring compliance

## HR Department Structure

### Typical Roles
- HR Assistant
- HR Generalist
- HR Specialist
- HR Manager
- HR Director
- CHRO

## Career Opportunities
HR offers diverse career paths in:
- Recruitment
- Training
- Compensation
- Employee Relations
- HR Analytics

## Required Skills
- Communication
- Problem-solving
- Organization
- Confidentiality
- Empathy
- Technology
        `
      },
      {
        title: 'Employee Lifecycle',
        topics: ['Attraction', 'Recruitment', 'Onboarding', 'Development', 'Separation'],
        content: `
# The Employee Lifecycle

## Stages

### 1. Attraction
Building employer brand to attract talent.

### 2. Recruitment
Finding and selecting the right candidates.

### 3. Onboarding
Integrating new employees into the organization.

### 4. Development
Growing employee skills and careers.

### 5. Retention
Keeping valuable employees engaged.

### 6. Separation
Managing departures professionally.

## Why It Matters
Understanding this cycle helps HR:
- Plan workforce needs
- Create better experiences
- Reduce turnover
- Build strong culture
        `
      },
      {
        title: 'Basic HR Processes',
        topics: ['Hiring Basics', 'Time & Attendance', 'Payroll Basics', 'Benefits Administration'],
        content: `
# Basic HR Processes

## Hiring Process

### Steps
1. Job requisition
2. Post position
3. Screen applications
4. Conduct interviews
5. Check references
6. Make offer
7. Complete paperwork

## Time & Attendance

### Tracking Methods
- Time clocks
- Software systems
- Manual timesheets
- Biometric systems

## Payroll Basics

### Components
- Base salary/hourly rate
- Overtime
- Deductions
- Taxes
- Benefits

## Benefits Administration

### Common Benefits
- Health insurance
- Retirement plans
- Paid time off
- Life insurance
- Disability insurance
        `
      },
      {
        title: 'Workplace Policies',
        topics: ['Employee Handbook', 'Code of Conduct', 'Leave Policies', 'Workplace Safety'],
        content: `
# Workplace Policies

## Employee Handbook

### Key Sections
- Company overview
- Employment policies
- Compensation & benefits
- Time off policies
- Conduct expectations
- Safety procedures

## Code of Conduct

### Common Elements
- Professional behavior
- Dress code
- Technology use
- Conflicts of interest
- Confidentiality

## Leave Policies

### Types of Leave
- Annual leave
- Sick leave
- Parental leave
- Bereavement
- Jury duty
- Public holidays

## Workplace Safety
- Emergency procedures
- Reporting accidents
- Health guidelines
- Ergonomics
- First aid
        `
      },
      {
        title: 'HR Communication',
        topics: ['Professional Communication', 'Email Etiquette', 'Documentation Skills', 'Confidentiality'],
        content: `
# HR Communication

## Professional Communication

### Key Principles
- Be clear and concise
- Stay professional
- Listen actively
- Be responsive
- Document important conversations

## Email Etiquette

### Best Practices
- Clear subject lines
- Appropriate greeting
- Concise message
- Professional signature
- Proofread before sending

## Documentation

### Why Document?
- Legal protection
- Consistency
- Reference
- Compliance

### What to Document
- Performance discussions
- Disciplinary actions
- Accommodations
- Complaints
- Decisions

## Confidentiality

### Protected Information
- Salary data
- Medical information
- Personal details
- Performance issues
- Disciplinary matters

### Guidelines
- Need-to-know basis
- Secure storage
- Proper disposal
- No casual discussion
        `
      }
    ]
  },
  // ============ BUSINESS COURSES ============
  {
    id: 'business-admin',
    title: 'Business Administration',
    description: 'Master business operations, management principles, and strategic planning for organizational success.',
    category: 'Business',
    duration: '12 weeks',
    level: 'Intermediate',
    price: 35000,
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
        topics: ['Business Models', 'Market Analysis', 'Business Ethics', 'Communication'],
        content: `
# Business Fundamentals

## Business Models

### Types
- B2B (Business to Business)
- B2C (Business to Consumer)
- Subscription
- Freemium
- Marketplace
- Franchise

### Business Model Canvas
1. Value Propositions
2. Customer Segments
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partnerships
9. Cost Structure

## Market Analysis

### Components
- Market size (TAM, SAM, SOM)
- Market trends
- Competitive landscape
- Customer needs
- Entry barriers

## Business Ethics

### Core Principles
- Integrity
- Transparency
- Fairness
- Responsibility
- Sustainability
        `
      },
      {
        title: 'Operations Management',
        topics: ['Process Optimization', 'Quality Management', 'Supply Chain', 'Project Management'],
        content: `
# Operations Management

## Process Optimization

### Methods
- Lean management
- Six Sigma
- Business Process Reengineering
- Continuous improvement

### Key Metrics
- Cycle time
- Throughput
- Efficiency
- Utilization

## Quality Management

### Total Quality Management (TQM)
- Customer focus
- Employee involvement
- Process approach
- Continuous improvement

### Quality Tools
- Pareto charts
- Cause-and-effect diagrams
- Control charts
- Flowcharts

## Supply Chain Management
- Procurement
- Inventory management
- Logistics
- Supplier relationships

## Project Management

### Phases
1. Initiation
2. Planning
3. Execution
4. Monitoring
5. Closing
        `
      },
      {
        title: 'Financial Management',
        topics: ['Accounting Basics', 'Budgeting', 'Financial Analysis', 'Cost Control'],
        content: `
# Financial Management

## Accounting Basics

### Financial Statements
- Balance Sheet: Assets, liabilities, equity
- Income Statement: Revenue, expenses, profit
- Cash Flow Statement: Cash movements

### Key Concepts
- Debits and credits
- Accrual vs. cash accounting
- Depreciation
- Assets vs. expenses

## Budgeting

### Budget Types
- Operating budget
- Capital budget
- Cash budget
- Master budget

### Process
1. Set objectives
2. Gather data
3. Create draft
4. Review and approve
5. Monitor and adjust

## Financial Analysis

### Key Ratios
- Liquidity: Current ratio
- Profitability: Net margin
- Efficiency: Asset turnover
- Leverage: Debt ratio

## Cost Control
- Identify cost drivers
- Set cost targets
- Monitor variances
- Take corrective action
        `
      },
      {
        title: 'Strategic Planning',
        topics: ['SWOT Analysis', 'Goal Setting', 'Implementation', 'Performance Monitoring'],
        content: `
# Strategic Planning

## SWOT Analysis

### Internal Factors
- **Strengths**: What you do well
- **Weaknesses**: Areas to improve

### External Factors
- **Opportunities**: Favorable conditions
- **Threats**: Challenges and risks

## Goal Setting

### Strategic Goals
- Vision: Where you want to be
- Mission: Why you exist
- Values: How you operate
- Objectives: What you'll achieve

### Cascading Goals
Corporate → Department → Team → Individual

## Strategy Implementation

### Key Elements
- Resource allocation
- Organizational structure
- Culture alignment
- Communication
- Change management

## Performance Monitoring

### Balanced Scorecard
1. Financial perspective
2. Customer perspective
3. Internal process perspective
4. Learning & growth perspective
        `
      },
      {
        title: 'Leadership Skills',
        topics: ['Team Building', 'Decision Making', 'Conflict Management', 'Change Management'],
        content: `
# Leadership Skills

## Team Building

### Team Development Stages
1. Forming: Getting to know each other
2. Storming: Conflict and competition
3. Norming: Establishing norms
4. Performing: High productivity
5. Adjourning: Completion

## Decision Making

### Process
1. Define the problem
2. Gather information
3. Identify alternatives
4. Evaluate options
5. Choose solution
6. Implement
7. Review results

### Decision Styles
- Directive: Quick, individual
- Analytical: Data-driven
- Conceptual: Creative, broad
- Behavioral: Participative

## Conflict Management

### Styles
- Avoiding
- Accommodating
- Competing
- Compromising
- Collaborating

## Change Management

### Kotter's 8 Steps
1. Create urgency
2. Form coalition
3. Create vision
4. Communicate vision
5. Remove obstacles
6. Create quick wins
7. Build on change
8. Anchor in culture
        `
      }
    ]
  },
  {
    id: 'entrepreneurship',
    title: 'Entrepreneurship & Startups',
    description: 'Learn to start and grow your own business with practical entrepreneurship skills and startup fundamentals.',
    category: 'Business',
    duration: '10 weeks',
    level: 'Beginner',
    price: 35000,
    image: businessAdminImg,
    learningOutcomes: [
      'Develop viable business ideas',
      'Create comprehensive business plans',
      'Understand startup financing',
      'Build and launch products',
      'Scale your business'
    ],
    modules: [
      {
        title: 'The Entrepreneurial Mindset',
        topics: ['What is Entrepreneurship', 'Characteristics of Entrepreneurs', 'Finding Problems to Solve', 'Risk and Failure'],
        content: `
# The Entrepreneurial Mindset

## What is Entrepreneurship?
The process of starting and running your own business, taking on financial risks in hope of profit.

## Characteristics of Successful Entrepreneurs
- Passion and persistence
- Risk tolerance
- Adaptability
- Vision
- Resilience
- Self-discipline

## Finding Problems to Solve

### Where to Look
- Personal frustrations
- Industry experience
- Customer complaints
- Emerging trends
- Technological changes

### Validation Questions
- Is this a real problem?
- Are people willing to pay to solve it?
- Can I solve it better than alternatives?

## Embracing Risk and Failure
- Failure is learning
- Calculated risks
- Fail fast, learn faster
- Pivot when needed
        `
      },
      {
        title: 'Idea to Business Model',
        topics: ['Idea Generation', 'Market Research', 'Business Model Canvas', 'Value Proposition'],
        content: `
# From Idea to Business Model

## Idea Generation

### Techniques
- Brainstorming
- Mind mapping
- Problem listing
- Trend analysis
- Customer interviews

## Market Research

### Primary Research
- Surveys
- Interviews
- Focus groups
- Observation

### Secondary Research
- Industry reports
- Government data
- Competitor analysis
- Academic research

## Business Model Canvas

Fill in each box:
1. Customer Segments
2. Value Propositions
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partnerships
9. Cost Structure

## Value Proposition

### Template
For [target customer]
Who [has this problem]
Our [product/service]
Provides [key benefit]
Unlike [alternative]
We [key differentiator]
        `
      },
      {
        title: 'Building Your Product',
        topics: ['MVP Concept', 'Product Development', 'User Testing', 'Iteration'],
        content: `
# Building Your Product

## Minimum Viable Product (MVP)

### Purpose
- Test assumptions
- Learn quickly
- Minimize waste
- Get to market fast

### Types of MVPs
- Landing page
- Explainer video
- Concierge service
- Wizard of Oz
- Prototype

## Product Development

### Stages
1. Concept
2. Design
3. Development
4. Testing
5. Launch

### Lean Approach
Build → Measure → Learn → Repeat

## User Testing

### Methods
- Usability testing
- A/B testing
- Beta testing
- Feedback surveys

### What to Test
- Does it solve the problem?
- Is it easy to use?
- Would they pay for it?
- What's missing?

## Iteration
Continuously improve based on feedback.
        `
      },
      {
        title: 'Startup Financing',
        topics: ['Funding Options', 'Pitching Investors', 'Financial Planning', 'Bootstrapping'],
        content: `
# Startup Financing

## Funding Options

### Stages
- Pre-seed: Friends, family, savings
- Seed: Angel investors, accelerators
- Series A: Venture capital
- Series B+: Growth capital

### Sources
- Personal savings
- Friends and family
- Bank loans
- Crowdfunding
- Angel investors
- Venture capital
- Grants

## Pitching Investors

### Pitch Deck Elements
1. Problem
2. Solution
3. Market size
4. Business model
5. Traction
6. Team
7. Financials
8. Ask

## Financial Planning

### Key Documents
- Pro forma financial statements
- Cash flow projections
- Break-even analysis
- Funding requirements

## Bootstrapping Tips
- Start small
- Keep day job initially
- Control costs
- Revenue focus
- Reinvest profits
        `
      },
      {
        title: 'Launch and Growth',
        topics: ['Go-to-Market Strategy', 'Marketing Basics', 'Sales Fundamentals', 'Scaling'],
        content: `
# Launch and Growth

## Go-to-Market Strategy

### Components
- Target customer definition
- Positioning and messaging
- Pricing strategy
- Distribution channels
- Launch plan

## Marketing Basics

### Digital Marketing
- Content marketing
- Social media
- Email marketing
- SEO/SEM
- Paid advertising

### Marketing on a Budget
- Leverage social media
- Content marketing
- Referral programs
- Partnerships
- PR and publicity

## Sales Fundamentals

### Sales Process
1. Prospecting
2. Qualifying
3. Presenting
4. Handling objections
5. Closing
6. Following up

## Scaling Your Business

### Growth Strategies
- Market penetration
- Market expansion
- Product development
- Diversification

### Signs You're Ready to Scale
- Product-market fit
- Repeatable sales
- Customer retention
- Operational efficiency
        `
      }
    ]
  },
  // ============ LOGISTICS COURSES ============
  {
    id: 'transport-logistics',
    title: 'Transport & Logistics',
    description: 'Learn supply chain management, logistics operations, and transportation optimization strategies.',
    category: 'Logistics',
    duration: '10 weeks',
    level: 'Intermediate',
    price: 35000,
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
        topics: ['Supply Chain Overview', 'Procurement', 'Supplier Management', 'Distribution'],
        content: `
# Supply Chain Fundamentals

## What is Supply Chain?
The entire network involved in producing and delivering a product to the end customer.

### Key Components
- Suppliers
- Manufacturers
- Warehouses
- Distribution centers
- Retailers
- Customers

## Procurement

### Process
1. Identify needs
2. Find suppliers
3. Request quotes
4. Evaluate and select
5. Negotiate terms
6. Place order
7. Receive goods
8. Process payment

## Supplier Management

### Supplier Selection Criteria
- Quality
- Price
- Delivery reliability
- Financial stability
- Capacity

### Relationship Types
- Transactional
- Preferred supplier
- Strategic partner
- Joint venture

## Distribution

### Channels
- Direct to consumer
- Retail
- Wholesale
- E-commerce
- Omnichannel
        `
      },
      {
        title: 'Transportation Management',
        topics: ['Mode Selection', 'Route Planning', 'Cost Optimization', 'Carrier Management'],
        content: `
# Transportation Management

## Transportation Modes

| Mode | Best For | Considerations |
|------|----------|----------------|
| Road | Flexibility | Cost, congestion |
| Rail | Bulk goods | Fixed routes |
| Sea | International | Slow speed |
| Air | Urgent/high value | Expensive |
| Pipeline | Liquids/gases | Limited goods |

## Mode Selection Factors
- Cost
- Speed
- Reliability
- Flexibility
- Environmental impact
- Cargo type

## Route Planning

### Optimization Goals
- Minimize distance
- Minimize time
- Minimize cost
- Maximize vehicle utilization

### Tools
- GPS tracking
- Route optimization software
- Real-time traffic data

## Cost Optimization

### Strategies
- Consolidate shipments
- Negotiate rates
- Backhaul opportunities
- Mode optimization
- Load optimization

## Carrier Management
- Performance monitoring
- Rate negotiations
- Relationship building
- Compliance tracking
        `
      },
      {
        title: 'Warehouse Operations',
        topics: ['Layout Design', 'Receiving & Storage', 'Order Picking', 'Safety Standards'],
        content: `
# Warehouse Operations

## Warehouse Layout

### Key Areas
- Receiving dock
- Storage area
- Picking zone
- Packing area
- Shipping dock
- Returns processing

### Layout Principles
- Minimize travel distance
- Fast-moving items accessible
- Clear pathways
- Safety considerations

## Receiving & Storage

### Receiving Process
1. Schedule delivery
2. Unload goods
3. Inspect shipment
4. Update inventory
5. Put away

### Storage Methods
- Selective racking
- Double-deep racking
- Drive-in/Drive-through
- Push-back racking
- Flow racking

## Order Picking

### Methods
- Piece picking
- Batch picking
- Zone picking
- Wave picking

### Efficiency Tips
- Optimize pick paths
- Use technology (RF scanners)
- Organize inventory properly

## Safety
- Proper equipment use
- Clear signage
- Regular training
- PPE requirements
- Emergency procedures
        `
      },
      {
        title: 'Inventory Control',
        topics: ['Inventory Methods', 'Stock Management', 'Forecasting', 'ABC Analysis'],
        content: `
# Inventory Control

## Inventory Methods

### FIFO (First In, First Out)
Oldest stock sold first.

### LIFO (Last In, First Out)
Newest stock sold first.

### Weighted Average
Average cost of all inventory.

## Stock Management

### Key Metrics
- Stock turnover ratio
- Days of inventory
- Fill rate
- Stock accuracy

### Reorder Point
When to reorder: Lead time demand + Safety stock

### Economic Order Quantity (EOQ)
Optimal order quantity to minimize costs.

## Demand Forecasting

### Methods
- Historical data analysis
- Moving averages
- Trend analysis
- Seasonal adjustments
- Causal models

## ABC Analysis

### Classification
- **A Items**: High value (70% of value, 20% of items)
- **B Items**: Medium value (20% of value, 30% of items)
- **C Items**: Low value (10% of value, 50% of items)

### Management Approach
- A: Tight control
- B: Moderate control
- C: Simple control
        `
      },
      {
        title: 'Logistics Technology',
        topics: ['WMS Systems', 'TMS Software', 'Tracking Systems', 'Automation'],
        content: `
# Logistics Technology

## Warehouse Management System (WMS)

### Features
- Inventory tracking
- Order management
- Pick/pack optimization
- Reporting
- Integration with other systems

### Benefits
- Improved accuracy
- Faster operations
- Better visibility
- Reduced costs

## Transportation Management System (TMS)

### Functions
- Route planning
- Carrier selection
- Freight audit
- Track and trace
- Performance analytics

## Tracking Technologies

### Options
- Barcodes
- QR codes
- RFID tags
- GPS tracking
- IoT sensors

## Automation

### Warehouse Automation
- Conveyor systems
- AS/RS (Automated Storage/Retrieval)
- Pick-to-light
- Voice picking
- Robots/AGVs

### Benefits
- Increased speed
- Reduced errors
- Lower labor costs
- 24/7 operation
        `
      }
    ]
  },
  {
    id: 'logistics-beginner',
    title: 'Introduction to Logistics',
    description: 'Start your career in logistics with fundamental knowledge of supply chain, warehousing, and transportation.',
    category: 'Logistics',
    duration: '6 weeks',
    level: 'Beginner',
    price: 35000,
    image: transportLogisticsImg,
    learningOutcomes: [
      'Understand logistics fundamentals',
      'Learn basic supply chain concepts',
      'Know transportation options',
      'Understand warehouse basics',
      'Prepare for logistics career'
    ],
    modules: [
      {
        title: 'What is Logistics?',
        topics: ['Logistics Definition', 'Industry Overview', 'Career Opportunities', 'Skills Required'],
        content: `
# Introduction to Logistics

## What is Logistics?
The planning, implementation, and control of the movement and storage of goods from origin to destination.

## The Logistics Industry

### Sectors
- Transportation
- Warehousing
- Freight forwarding
- Third-party logistics (3PL)
- E-commerce fulfillment

### Industry Size
Global logistics is a multi-trillion dollar industry.

## Career Opportunities

### Entry-Level Roles
- Warehouse associate
- Shipping/receiving clerk
- Delivery driver
- Inventory clerk
- Customer service

### Growth Paths
- Supervisor
- Manager
- Operations director
- Supply chain analyst

## Required Skills
- Organization
- Attention to detail
- Problem-solving
- Communication
- Physical stamina
- Technology skills
        `
      },
      {
        title: 'Supply Chain Overview',
        topics: ['What is Supply Chain', 'Key Players', 'How Products Flow', 'Supply Chain Challenges'],
        content: `
# Understanding Supply Chain

## What is Supply Chain?
The network of all the individuals, organizations, resources, activities, and technology involved in creating and selling a product.

## Key Players

### Upstream
- Raw material suppliers
- Component manufacturers

### Midstream
- Manufacturers
- Assemblers

### Downstream
- Distributors
- Retailers
- Customers

## Product Flow Example

### From Farm to Table
1. Farmer grows produce
2. Picked and packed
3. Transported to distribution center
4. Quality checked and stored
5. Ordered by supermarket
6. Delivered to store
7. Stocked on shelves
8. Customer purchases

## Common Challenges
- Demand uncertainty
- Supply disruptions
- Transportation delays
- Inventory management
- Cost pressures
- Customer expectations
        `
      },
      {
        title: 'Transportation Basics',
        topics: ['Types of Transport', 'Shipping Documents', 'Delivery Process', 'Transportation Safety'],
        content: `
# Transportation Basics

## Types of Transportation

### Road Transport
- Most common
- Door-to-door delivery
- Trucks, vans, motorcycles

### Rail Transport
- Bulk goods
- Long distances
- Cost-effective

### Sea Transport
- International shipping
- Large volumes
- Slower but cheaper

### Air Transport
- Fastest
- Most expensive
- Urgent or valuable goods

## Shipping Documents

### Common Documents
- Bill of Lading
- Packing list
- Commercial invoice
- Delivery note
- Proof of delivery

## Delivery Process
1. Order received
2. Pick and pack
3. Load vehicle
4. Transport
5. Deliver
6. Get signature
7. Update system

## Safety
- Secure loading
- Weight limits
- Proper labeling
- Safe driving
- Emergency procedures
        `
      },
      {
        title: 'Warehouse Basics',
        topics: ['What is a Warehouse', 'Warehouse Jobs', 'Basic Equipment', 'Safety Procedures'],
        content: `
# Warehouse Basics

## What is a Warehouse?
A building for storing goods before distribution.

## Types of Warehouses
- Distribution center
- Fulfillment center
- Cold storage
- Bonded warehouse
- Cross-dock facility

## Warehouse Jobs

### Entry-Level Positions
- Picker: Collect items for orders
- Packer: Package items for shipping
- Receiver: Accept incoming goods
- Loader: Load trucks

## Basic Equipment

### Material Handling
- Pallet jack
- Forklift
- Hand truck
- Conveyor belt
- Shelving/racking

## Safety Procedures

### Key Rules
- Wear safety shoes
- Use proper lifting techniques
- Follow forklift rules
- Keep aisles clear
- Report hazards
- Know emergency exits

### Proper Lifting
1. Stand close to load
2. Bend knees, not back
3. Grip firmly
4. Lift with legs
5. Keep load close
6. Turn with feet, not back
        `
      },
      {
        title: 'Inventory Basics',
        topics: ['What is Inventory', 'Counting Stock', 'Basic Inventory Control', 'Using Technology'],
        content: `
# Inventory Basics

## What is Inventory?
All the goods and materials a business holds for sale or use.

## Types of Inventory
- Raw materials
- Work-in-progress
- Finished goods
- Maintenance supplies

## Stock Counting

### Methods
- Physical count
- Cycle counting
- Spot checks

### Counting Tips
- Count systematically
- Use count sheets
- Verify discrepancies
- Update immediately

## Basic Inventory Control

### Goals
- Right product
- Right quantity
- Right place
- Right time
- Right cost

### Simple Rules
- First in, first out (FIFO)
- Regular counts
- Organized storage
- Clear labeling

## Using Technology

### Common Tools
- Barcode scanners
- Inventory software
- Spreadsheets
- Mobile apps

### Benefits
- Faster counting
- Fewer errors
- Real-time visibility
- Better decisions
        `
      }
    ]
  }
];
