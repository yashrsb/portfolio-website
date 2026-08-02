/**
 * Skills mock data organized by category with proficiency levels.
 */
const skills = {
  languages: [
    { name: 'JavaScript', icon: '🟨', proficiency: 95 },
    { name: 'TypeScript', icon: '🔷', proficiency: 90 },
    { name: 'Python', icon: '🐍', proficiency: 75 },
    { name: 'SQL', icon: '🗃️', proficiency: 80 },
    { name: 'HTML/CSS', icon: '🌐', proficiency: 95 },
  ],
  frontend: [
    { name: 'React', icon: '⚛️', proficiency: 95 },
    { name: 'Next.js', icon: '▲', proficiency: 85 },
    { name: 'Redux', icon: '🔄', proficiency: 80 },
    { name: 'React Router', icon: '🧭', proficiency: 90 },
    { name: 'CSS Modules', icon: '🎨', proficiency: 90 },
    { name: 'Tailwind CSS', icon: '🌊', proficiency: 80 },
  ],
  backend: [
    { name: 'Node.js', icon: '💚', proficiency: 90 },
    { name: 'Express', icon: '🚂', proficiency: 90 },
    { name: 'GraphQL', icon: '◈', proficiency: 75 },
    { name: 'REST APIs', icon: '🔌', proficiency: 95 },
    { name: 'WebSockets', icon: '🔗', proficiency: 70 },
  ],
  databases: [
    { name: 'PostgreSQL', icon: '🐘', proficiency: 85 },
    { name: 'MongoDB', icon: '🍃', proficiency: 80 },
    { name: 'Redis', icon: '🔴', proficiency: 75 },
    { name: 'Prisma', icon: '📊', proficiency: 80 },
  ],
  cloud: [
    { name: 'AWS', icon: '☁️', proficiency: 80 },
    { name: 'Docker', icon: '🐳', proficiency: 85 },
    { name: 'CI/CD', icon: '🔄', proficiency: 85 },
    { name: 'Vercel', icon: '▲', proficiency: 80 },
  ],
  tools: [
    { name: 'Git', icon: '📦', proficiency: 95 },
    { name: 'VS Code', icon: '💻', proficiency: 95 },
    { name: 'Figma', icon: '🎯', proficiency: 70 },
    { name: 'Jira', icon: '📋', proficiency: 80 },
    { name: 'Postman', icon: '📮', proficiency: 85 },
  ],
};

export default skills;
