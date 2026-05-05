/**
 * Technical skills, interests, and engineering branches for CFPA.
 * Skill/interest labels must match backend cfpa-mappings.json and branch-career-config.json where applicable.
 */

export const ENGINEERING_BRANCHES = [
  { id: 'CSE', label: 'Computer Science (CSE)', short: 'CSE', icon: '💻' },
  { id: 'IT', label: 'Information Technology (IT)', short: 'IT', icon: '🖥️' },
  { id: 'ECE', label: 'Electronics & Communication (ECE)', short: 'ECE', icon: '🔌' },
  { id: 'EE', label: 'Electrical Engineering (EE)', short: 'EE', icon: '⚡' },
  { id: 'ME', label: 'Mechanical Engineering (ME)', short: 'ME', icon: '⚙️' },
  { id: 'CE', label: 'Civil Engineering (CE)', short: 'CE', icon: '🏗️' },
  { id: 'OTHER', label: 'Other', short: 'Other', icon: '📐' },
]

/** Branch-specific skill categories (prepended and prioritized for that branch). */
export const BRANCH_SKILL_EXTRA = {
  ECE: [
    {
      id: 'ece',
      label: 'Electronics & embedded',
      icon: '🔌',
      skills: [
        { label: 'Embedded Systems' },
        { label: 'VLSI Design' },
        { label: 'Signal Processing' },
        { label: 'IoT Protocols' },
      ],
    },
  ],
  EE: [
    {
      id: 'ee',
      label: 'Electrical & power',
      icon: '⚡',
      skills: [
        { label: 'Power Systems' },
        { label: 'Circuit Design' },
        { label: 'MATLAB' },
        { label: 'Embedded Systems' },
      ],
    },
  ],
  ME: [
    {
      id: 'me',
      label: 'Mechanical & design',
      icon: '⚙️',
      skills: [
        { label: 'CAD / SolidWorks' },
        { label: 'Thermodynamics' },
        { label: 'Manufacturing Processes' },
        { label: 'MATLAB' },
      ],
    },
  ],
  CE: [
    {
      id: 'ce',
      label: 'Civil & structures',
      icon: '🏗️',
      skills: [
        { label: 'AutoCAD' },
        { label: 'Structural Analysis' },
        { label: 'Surveying' },
        { label: 'MATLAB' },
      ],
    },
  ],
}

const CATEGORY_ORDER = {
  CSE: ['programming', 'web', 'data', 'database', 'cloud', 'cyber', 'tools'],
  IT: ['programming', 'web', 'database', 'cloud', 'data', 'cyber', 'tools'],
  ECE: ['ece', 'programming', 'data', 'web', 'database', 'cloud', 'cyber', 'tools'],
  EE: ['ee', 'programming', 'data', 'cloud', 'tools', 'web', 'cyber', 'database'],
  ME: ['me', 'programming', 'data', 'tools', 'cloud', 'web', 'database', 'cyber'],
  CE: ['ce', 'programming', 'data', 'tools', 'database', 'web', 'cloud', 'cyber'],
  CHE: ['programming', 'data', 'tools', 'database', 'cloud', 'web', 'cyber'],
  BT: ['programming', 'data', 'tools', 'database', 'cloud', 'web', 'cyber'],
  AE: ['programming', 'data', 'me', 'tools', 'cloud', 'web', 'database', 'cyber'],
  MTR: ['ece', 'me', 'programming', 'data', 'tools', 'cloud', 'web', 'database', 'cyber'],
  OTHER: ['programming', 'web', 'data', 'database', 'cloud', 'cyber', 'tools'],
}

export const BRANCH_INTEREST_EXTRA = {
  ECE: [{ id: 'ece-int', label: 'Hardware & signals', icon: '📡', interests: [{ label: 'IoT' }, { label: 'Robotics' }, { label: 'Networking' }] }],
  EE: [{ id: 'ee-int', label: 'Power & systems', icon: '🔋', interests: [{ label: 'Automation' }, { label: 'Enterprise IT' }] }],
  ME: [{ id: 'me-int', label: 'Design & manufacturing', icon: '🛠️', interests: [{ label: 'Research' }, { label: 'Product Management' }] }],
  CE: [{ id: 'ce-int', label: 'Built environment', icon: '🌉', interests: [{ label: 'Green Tech / Sustainability' }, { label: 'Research' }] }],
}

const INTEREST_ORDER = {
  CSE: ['core', 'domains', 'creative', 'career'],
  IT: ['core', 'domains', 'creative', 'career'],
  ECE: ['ece-int', 'core', 'domains', 'creative', 'career'],
  EE: ['ee-int', 'core', 'domains', 'creative', 'career'],
  ME: ['me-int', 'core', 'domains', 'creative', 'career'],
  CE: ['ce-int', 'core', 'domains', 'creative', 'career'],
  CHE: ['core', 'domains', 'creative', 'career'],
  BT: ['core', 'domains', 'creative', 'career'],
  AE: ['me-int', 'core', 'domains', 'creative', 'career'],
  MTR: ['ece-int', 'me-int', 'core', 'domains', 'creative', 'career'],
  OTHER: ['core', 'domains', 'creative', 'career'],
}

export function getSkillCategoriesForBranch(branchId) {
  const b = (branchId || 'CSE').toUpperCase()
  const extra = BRANCH_SKILL_EXTRA[b] || []
  const merged = [...extra, ...SKILL_CATEGORIES]
  const order = CATEGORY_ORDER[b] || CATEGORY_ORDER.CSE
  const rank = (id) => {
    const i = order.indexOf(id)
    return i === -1 ? 100 + merged.findIndex((c) => c.id === id) : i
  }
  return [...merged].sort((a, b) => rank(a.id) - rank(b.id))
}

export function getInterestCategoriesForBranch(branchId) {
  const b = (branchId || 'CSE').toUpperCase()
  const extra = BRANCH_INTEREST_EXTRA[b] || []
  const merged = [...extra, ...INTEREST_CATEGORIES]
  const order = INTEREST_ORDER[b] || INTEREST_ORDER.CSE
  const rank = (id) => {
    const i = order.indexOf(id)
    return i === -1 ? 100 + merged.findIndex((c) => c.id === id) : i
  }
  return [...merged].sort((a, b) => rank(a.id) - rank(b.id))
}

/** Labels to highlight as recommended for the selected branch (skills step). */
export function getRecommendedSkillLabels(branchId) {
  const b = (branchId || 'CSE').toUpperCase()
  const extra = BRANCH_SKILL_EXTRA[b]
  if (!extra) {
    if (b === 'CSE' || b === 'IT') {
      return ['Python', 'Java', 'JavaScript', 'React.js', 'Machine Learning', 'MySQL', 'AWS']
    }
    return []
  }
  return extra.flatMap((cat) => cat.skills.map((s) => s.label))
}

/** Suggested interests for branch (interests step). */
export function getRecommendedInterestLabels(branchId) {
  const b = (branchId || 'CSE').toUpperCase()
  const extra = BRANCH_INTEREST_EXTRA[b]
  if (!extra) {
    if (b === 'CSE' || b === 'IT') {
      return ['Coding', 'Backend Development', 'AI Research', 'Cloud Infrastructure', 'App Development']
    }
    return []
  }
  return extra.flatMap((cat) => cat.interests.map((i) => i.label))
}

export const SKILL_CATEGORIES = [
  {
    id: 'programming',
    label: 'Programming Languages',
    icon: '💻',
    skills: [
      { label: 'Java' },
      { label: 'Python' },
      { label: 'C' },
      { label: 'C++' },
      { label: 'JavaScript' },
      { label: 'TypeScript' },
      { label: 'Go' },
      { label: 'Rust' },
      { label: 'Kotlin' },
      { label: 'Scala' },
      { label: 'Swift' },
      { label: 'PHP' },
    ],
  },
  {
    id: 'web',
    label: 'Web Development',
    icon: '🌐',
    skills: [
      { label: 'HTML' },
      { label: 'CSS' },
      { label: 'React.js' },
      { label: 'Angular' },
      { label: 'Vue.js' },
      { label: 'Node.js' },
      { label: 'Express.js' },
      { label: 'Next.js' },
      { label: 'Svelte' },
    ],
  },
  {
    id: 'data',
    label: 'Data Science & AI',
    icon: '📊',
    skills: [
      { label: 'Machine Learning' },
      { label: 'Deep Learning' },
      { label: 'NLP' },
      { label: 'Computer Vision' },
      { label: 'Pandas' },
      { label: 'NumPy' },
      { label: 'TensorFlow' },
      { label: 'PyTorch' },
      { label: 'scikit-learn' },
      { label: 'Statistics' },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    icon: '🗄️',
    skills: [
      { label: 'MySQL' },
      { label: 'PostgreSQL' },
      { label: 'MongoDB' },
      { label: 'Firebase' },
      { label: 'Redis' },
      { label: 'SQLite' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    icon: '☁️',
    skills: [
      { label: 'AWS' },
      { label: 'Azure' },
      { label: 'Google Cloud' },
      { label: 'Docker' },
      { label: 'Kubernetes' },
      { label: 'CI/CD' },
      { label: 'Jenkins' },
      { label: 'Terraform' },
      { label: 'Ansible' },
    ],
  },
  {
    id: 'cyber',
    label: 'Cybersecurity',
    icon: '🔐',
    skills: [
      { label: 'Ethical Hacking' },
      { label: 'Network Security' },
      { label: 'Cryptography' },
      { label: 'Penetration Testing' },
      { label: 'SIEM' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Others',
    icon: '🛠️',
    skills: [
      { label: 'Git' },
      { label: 'GitHub' },
      { label: 'Linux' },
      { label: 'REST APIs' },
      { label: 'GraphQL' },
      { label: 'Agile' },
      { label: 'Problem Solving' },
      { label: 'Bash' },
    ],
  },
]

export const INTEREST_CATEGORIES = [
  {
    id: 'core',
    label: 'Core interests',
    icon: '✨',
    interests: [
      { label: 'Coding' },
      { label: 'Problem Solving' },
      { label: 'Debugging' },
      { label: 'System Design' },
      { label: 'Competitive Programming' },
      { label: 'Open Source Contribution' },
      { label: 'Technical Writing' },
      { label: 'Teaching / Mentoring' },
      { label: 'Algorithm Design' },
      { label: 'Code Review Culture' },
    ],
  },
  {
    id: 'domains',
    label: 'Domains & tech',
    icon: '🎯',
    interests: [
      { label: 'AI Research' },
      { label: 'Data Analysis' },
      { label: 'Data Visualization' },
      { label: 'Web Design' },
      { label: 'App Development' },
      { label: 'Backend Development' },
      { label: 'Frontend Development' },
      { label: 'Mobile Development' },
      { label: 'Game Development' },
      { label: 'Networking' },
      { label: 'Security Systems' },
      { label: 'Cloud Infrastructure' },
      { label: 'Automation' },
      { label: 'DevOps Culture' },
      { label: 'IoT' },
      { label: 'Robotics' },
      { label: 'Blockchain' },
    ],
  },
  {
    id: 'creative',
    label: 'Design & product',
    icon: '🎨',
    interests: [
      { label: 'UI/UX Design' },
      { label: 'Product Management' },
      { label: 'Research' },
    ],
  },
  {
    id: 'career',
    label: 'Career & work style',
    icon: '🚀',
    interests: [
      { label: 'Freelancing' },
      { label: 'Startup Building' },
      { label: 'Enterprise IT' },
      { label: 'Remote Collaboration' },
      { label: 'Open Innovation' },
      { label: 'Hackathons' },
      { label: 'Tech Meetups' },
      { label: 'Career Growth' },
      { label: 'Leadership' },
      { label: 'Consulting' },
      { label: 'Public Speaking' },
      { label: 'Mentoring Juniors' },
      { label: 'Building MVPs' },
      { label: 'Performance Engineering' },
      { label: 'Site Reliability' },
      { label: 'Quality Assurance' },
      { label: 'Accessibility (a11y)' },
      { label: 'Green Tech / Sustainability' },
    ],
  },
]

export function flattenSkills() {
  return SKILL_CATEGORIES.flatMap((c) => c.skills.map((s) => ({ ...s, categoryId: c.id, categoryLabel: c.label })))
}

export function flattenInterests() {
  return INTEREST_CATEGORIES.flatMap((c) =>
    c.interests.map((i) => ({ ...i, categoryId: c.id, categoryLabel: c.label })),
  )
}
