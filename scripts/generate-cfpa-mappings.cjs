/**
 * Generates backend/src/main/resources/cfpa-mappings.json from the same labels
 * used in frontend/src/data/assessmentOptions.js (run after editing either file).
 */
const fs = require('fs')
const path = require('path')

const D = {
  SE: 'Software Engineering',
  DS: 'Data Science',
  CY: 'Cybersecurity',
  FS: 'Full Stack Development',
  CC: 'Cloud Computing',
}

function W(se, ds, cy, fs, cc) {
  const o = {}
  o[D.SE] = se
  o[D.DS] = ds
  o[D.CY] = cy
  o[D.FS] = fs
  o[D.CC] = cc
  return o
}

// Integer weights (relative); normalized inside CFPA service per component.
const skills = {
  Java: W(12, 2, 1, 10, 4),
  Python: W(8, 14, 2, 6, 4),
  C: W(10, 2, 4, 3, 2),
  'C++': W(11, 3, 5, 4, 3),
  JavaScript: W(7, 2, 1, 14, 3),
  TypeScript: W(8, 2, 1, 13, 4),
  Go: W(10, 2, 2, 8, 6),
  Rust: W(11, 2, 3, 6, 5),
  Kotlin: W(10, 2, 1, 9, 4),
  Scala: W(9, 6, 1, 6, 5),
  Swift: W(10, 2, 1, 8, 3),
  PHP: W(6, 1, 2, 11, 3),
  HTML: W(3, 1, 1, 12, 2),
  CSS: W(3, 1, 1, 12, 2),
  'React.js': W(5, 1, 1, 14, 3),
  Angular: W(6, 1, 1, 13, 3),
  'Vue.js': W(5, 1, 1, 13, 3),
  'Node.js': W(7, 2, 1, 13, 5),
  'Express.js': W(7, 1, 1, 12, 5),
  'Next.js': W(6, 1, 1, 14, 4),
  Svelte: W(5, 1, 1, 13, 3),
  'Machine Learning': W(4, 16, 1, 3, 3),
  'Deep Learning': W(3, 16, 1, 3, 3),
  NLP: W(3, 15, 1, 3, 2),
  'Computer Vision': W(3, 15, 1, 2, 2),
  Pandas: W(3, 14, 1, 2, 2),
  NumPy: W(3, 14, 1, 2, 2),
  TensorFlow: W(4, 14, 1, 3, 3),
  PyTorch: W(4, 14, 1, 3, 3),
  'scikit-learn': W(3, 15, 1, 2, 2),
  Statistics: W(4, 12, 1, 3, 2),
  MySQL: W(6, 5, 2, 8, 5),
  PostgreSQL: W(6, 5, 2, 8, 5),
  MongoDB: W(5, 4, 2, 9, 5),
  Firebase: W(4, 3, 2, 10, 6),
  Redis: W(6, 3, 2, 7, 7),
  SQLite: W(6, 4, 2, 7, 4),
  AWS: W(4, 3, 2, 6, 14),
  Azure: W(4, 3, 2, 6, 14),
  'Google Cloud': W(4, 4, 2, 5, 14),
  Docker: W(5, 2, 2, 7, 12),
  Kubernetes: W(4, 2, 3, 5, 13),
  'CI/CD': W(5, 2, 2, 6, 12),
  Jenkins: W(5, 2, 2, 5, 11),
  Terraform: W(4, 2, 2, 5, 13),
  Ansible: W(4, 2, 3, 5, 12),
  'Ethical Hacking': W(2, 2, 14, 3, 4),
  'Network Security': W(3, 2, 13, 3, 6),
  Cryptography: W(4, 4, 12, 2, 5),
  'Penetration Testing': W(2, 2, 15, 2, 4),
  SIEM: W(3, 3, 12, 3, 6),
  Git: W(8, 3, 2, 9, 5),
  GitHub: W(7, 3, 2, 9, 5),
  Linux: W(8, 3, 6, 6, 8),
  'REST APIs': W(8, 3, 2, 11, 6),
  GraphQL: W(6, 2, 1, 12, 5),
  Agile: W(9, 3, 2, 8, 5),
  'Problem Solving': W(10, 6, 4, 7, 5),
  Bash: W(7, 2, 5, 5, 6),
}

const interests = {
  Coding: W(12, 4, 3, 12, 4),
  'Problem Solving': W(10, 8, 4, 8, 5),
  Debugging: W(11, 5, 4, 9, 4),
  'System Design': W(10, 4, 4, 10, 7),
  'Competitive Programming': W(12, 5, 3, 6, 3),
  'Open Source Contribution': W(9, 4, 3, 10, 5),
  'Technical Writing': W(7, 5, 3, 7, 4),
  'Teaching / Mentoring': W(8, 5, 3, 7, 4),
  'Algorithm Design': W(11, 7, 3, 6, 4),
  'Code Review Culture': W(10, 4, 3, 9, 4),
  'AI Research': W(5, 16, 2, 4, 4),
  'Data Analysis': W(4, 15, 2, 5, 5),
  'Data Visualization': W(4, 12, 2, 7, 4),
  'Web Design': W(4, 2, 1, 14, 3),
  'App Development': W(9, 3, 2, 12, 4),
  'Backend Development': W(10, 4, 3, 11, 6),
  'Frontend Development': W(5, 2, 1, 15, 4),
  'Mobile Development': W(9, 3, 2, 11, 3),
  'Game Development': W(11, 3, 2, 8, 3),
  Networking: W(5, 3, 10, 5, 8),
  'Security Systems': W(4, 3, 14, 4, 6),
  'Cloud Infrastructure': W(4, 3, 3, 6, 14),
  Automation: W(7, 4, 4, 7, 10),
  'DevOps Culture': W(5, 3, 3, 7, 13),
  IoT: W(8, 4, 5, 7, 6),
  Robotics: W(9, 5, 4, 6, 5),
  Blockchain: W(8, 4, 4, 7, 5),
  'UI/UX Design': W(4, 2, 1, 12, 3),
  'Product Management': W(8, 4, 2, 9, 5),
  Research: W(6, 12, 3, 5, 5),
  Freelancing: W(8, 4, 3, 10, 6),
  'Startup Building': W(8, 4, 3, 11, 6),
  'Enterprise IT': W(7, 4, 5, 7, 9),
  'Remote Collaboration': W(7, 4, 3, 8, 7),
  'Open Innovation': W(7, 6, 3, 8, 6),
  Hackathons: W(9, 5, 4, 9, 5),
  'Tech Meetups': W(7, 5, 4, 8, 5),
  'Career Growth': W(8, 5, 4, 8, 6),
  Leadership: W(8, 4, 4, 8, 7),
  Consulting: W(7, 5, 4, 8, 7),
  'Public Speaking': W(7, 4, 3, 7, 4),
  'Mentoring Juniors': W(8, 4, 3, 8, 4),
  'Building MVPs': W(8, 4, 3, 12, 6),
  'Performance Engineering': W(11, 4, 3, 8, 7),
  'Site Reliability': W(6, 3, 4, 6, 14),
  'Quality Assurance': W(9, 4, 4, 9, 5),
  'Accessibility (a11y)': W(6, 2, 2, 13, 4),
  'Green Tech / Sustainability': W(6, 5, 3, 6, 7),
}

const out = {
  domains: Object.values(D),
  skills,
  interests,
}

const target = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'cfpa-mappings.json')
fs.writeFileSync(target, JSON.stringify(out, null, 2), 'utf8')
console.log('Wrote', target)
