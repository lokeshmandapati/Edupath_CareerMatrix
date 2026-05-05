/**
 * Technical skills, interests, and engineering branches for CFPA.
 * Skill/interest labels must match backend cfpa-mappings.json and branch-career-config.json where applicable.
 */

export const STREAMS = [
  { id: 'ENGINEERING', label: 'Engineering / Technical', icon: '⚙️' },
  { id: 'MEDICAL', label: 'Medical / Healthcare', icon: '🏥' },
  { id: 'COMMERCE', label: 'Commerce / Finance', icon: '💰' },
  { id: 'ARTS', label: 'Humanities / Arts', icon: '🎨' },
  { id: 'OTHER_STREAM', label: 'Other Stream', icon: '✨' },
]

export const STREAM_BRANCHES = {
  ENGINEERING: [
    { id: 'CSE', label: 'Computer Science (CSE)', short: 'CSE', icon: '💻' },
    { id: 'IT', label: 'Information Technology (IT)', short: 'IT', icon: '🖥️' },
    { id: 'ECE', label: 'Electronics & Communication (ECE)', short: 'ECE', icon: '🔌' },
    { id: 'EE', label: 'Electrical Engineering (EE)', short: 'EE', icon: '⚡' },
    { id: 'ME', label: 'Mechanical Engineering (ME)', short: 'ME', icon: '⚙️' },
    { id: 'CE', label: 'Civil Engineering (CE)', short: 'CE', icon: '🏗️' },
    { id: 'ENGINEERING_OTHER', label: 'Other Engineering', short: 'Other', icon: '📐' },
  ],
  MEDICAL: [
    { id: 'MBBS', label: 'Medicine (MBBS)', short: 'MBBS', icon: '🩺' },
    { id: 'BDS', label: 'Dental (BDS)', short: 'BDS', icon: '🦷' },
    { id: 'BAMS', label: 'Ayurvedic (BAMS)', short: 'BAMS', icon: '🌿' },
    { id: 'PHARMA', label: 'Pharmacy (B.Pharm)', short: 'Pharma', icon: '💊' },
    { id: 'NURSING', label: 'Nursing', short: 'Nursing', icon: '👩‍⚕️' },
    { id: 'MEDICAL_OTHER', label: 'Other Medical', short: 'Other', icon: '🏥' },
  ],
  COMMERCE: [
    { id: 'CA', label: 'Chartered Accountancy (CA)', short: 'CA', icon: '📊' },
    { id: 'BCOM', label: 'Business / Commerce (B.Com)', short: 'B.Com', icon: '📈' },
    { id: 'BBA', label: 'Management (BBA)', short: 'BBA', icon: '💼' },
    { id: 'ECON', label: 'Economics', short: 'Econ', icon: '📉' },
    { id: 'CS', label: 'Company Secretary', short: 'CS', icon: '📜' },
    { id: 'COMMERCE_OTHER', label: 'Other Commerce', short: 'Other', icon: '💰' },
  ],
  ARTS: [
    { id: 'LAW_ARTS', label: 'Legal Studies (Law)', short: 'Law', icon: '⚖️' },
    { id: 'DESIGN_ARTS', label: 'Fine Arts / Design', short: 'Design', icon: '🎨' },
    { id: 'PSYCH', label: 'Psychology', short: 'Psych', icon: '🧠' },
    { id: 'LIT', label: 'Literature / Languages', short: 'Lit', icon: '📖' },
    { id: 'JOURN', label: 'Journalism', short: 'Journ', icon: '🎙️' },
    { id: 'ARTS_OTHER', label: 'Other Arts', short: 'Other', icon: '🎭' },
  ],
  OTHER_STREAM: [
    { id: 'GENERAL', label: 'General Education', short: 'Gen', icon: '🎓' },
    { id: 'VOCATIONAL', label: 'Vocational Training', short: 'Voc', icon: '🛠️' },
  ]
}

export const ENGINEERING_BRANCHES = STREAM_BRANCHES.ENGINEERING


/** Branch-specific skill categories (prepended and prioritized for that branch). */
export const BRANCH_SKILL_EXTRA = {
  // Engineering (already exists, but kept for context)
  ECE: [{ id: 'ece', label: 'Electronics & embedded', icon: '🔌', skills: [{ label: 'Embedded Systems' }, { label: 'VLSI Design' }] }],
  
  // Medical
  MBBS: [{ id: 'med', label: 'Clinical & Medical', icon: '🩺', skills: [{ label: 'Anatomy' }, { label: 'Physiology' }, { label: 'Pharmacology' }, { label: 'Clinical Diagnosis' }] }],
  PHARMA: [{ id: 'pharm', label: 'Pharmaceutical Sciences', icon: '💊', skills: [{ label: 'Drug Chemistry' }, { label: 'Pharmaceutics' }, { label: 'Clinical Pharmacy' }] }],
  
  // Commerce
  CA: [{ id: 'fin', label: 'Finance & Audit', icon: '💰', skills: [{ label: 'Financial Accounting' }, { label: 'Auditing' }, { label: 'Taxation' }, { label: 'Corporate Law' }] }],
  BBA: [{ id: 'mgmt', label: 'Management & Strategy', icon: '💼', skills: [{ label: 'Organizational Behavior' }, { label: 'Marketing Strategy' }, { label: 'Business Analytics' }] }],
  
  // Arts
  LAW_ARTS: [{ id: 'legal', label: 'Legal Foundations', icon: '⚖️', skills: [{ label: 'Constitutional Law' }, { label: 'Legal Research' }, { label: 'Criminal Justice' }] }],
  DESIGN_ARTS: [{ id: 'arts', label: 'Fine Arts & Theory', icon: '🎨', skills: [{ label: 'Visual Arts' }, { label: 'History of Art' }, { label: 'Creative Design' }] }],
}

const CATEGORY_ORDER = {
  CSE: ['programming', 'web', 'data', 'database', 'cloud', 'cyber', 'tools'],
  MBBS: ['med', 'tools'],
  CA: ['fin', 'tools'],
  LAW_ARTS: ['legal', 'tools'],
  BBA: ['mgmt', 'tools'],
  OTHER: ['programming', 'web', 'data', 'database', 'cloud', 'cyber', 'tools'],
}

export const BRANCH_INTEREST_EXTRA = {
  MBBS: [{ id: 'med-int', label: 'Healthcare & Research', icon: '🔬', interests: [{ label: 'Patient Care' }, { label: 'Medical Research' }, { label: 'Surgery' }] }],
  CA: [{ id: 'fin-int', label: 'Markets & Economy', icon: '📉', interests: [{ label: 'Stock Markets' }, { label: 'Entrepreneurship' }, { label: 'Financial Planning' }] }],
  LAW_ARTS: [{ id: 'law-int', label: 'Justice & Society', icon: '🏛️', interests: [{ label: 'Human Rights' }, { label: 'Corporate Law' }, { label: 'Public Policy' }] }],
}

const INTEREST_ORDER = {
  CSE: ['core', 'domains', 'creative', 'career'],
  MBBS: ['med-int', 'core', 'career'],
  CA: ['fin-int', 'core', 'career'],
  LAW_ARTS: ['law-int', 'core', 'career'],
  OTHER: ['core', 'domains', 'creative', 'career'],
}

export function getStreamForBranch(branchId) {
  if (!branchId) return 'ENGINEERING';
  const upper = branchId.toUpperCase();
  for (const [stream, branches] of Object.entries(STREAM_BRANCHES)) {
    if (branches.find(b => b.id === upper)) return stream;
  }
  return 'ENGINEERING';
}

export function getSkillCategoriesForBranch(branchId) {
  const b = (branchId || 'CSE').toUpperCase()
  const stream = getStreamForBranch(b);
  const extra = BRANCH_SKILL_EXTRA[b] || []
  
  let baseCategories = SKILL_CATEGORIES;
  if (stream === 'MEDICAL') baseCategories = MEDICAL_SKILL_CATEGORIES;
  else if (stream === 'COMMERCE') baseCategories = COMMERCE_SKILL_CATEGORIES;
  else if (stream === 'ARTS') baseCategories = ARTS_SKILL_CATEGORIES;

  const merged = [...extra, ...baseCategories]
  const order = CATEGORY_ORDER[b] || CATEGORY_ORDER.CSE
  const rank = (id) => {
    const i = order.indexOf(id)
    return i === -1 ? 100 + merged.findIndex((c) => c.id === id) : i
  }
  return [...merged].sort((a, b) => rank(a.id) - rank(b.id))
}

export function getInterestCategoriesForBranch(branchId) {
  const b = (branchId || 'CSE').toUpperCase()
  const stream = getStreamForBranch(b);
  const extra = BRANCH_INTEREST_EXTRA[b] || []
  
  let baseCategories = INTEREST_CATEGORIES;
  if (stream === 'MEDICAL') baseCategories = MEDICAL_INTEREST_CATEGORIES;
  else if (stream === 'COMMERCE') baseCategories = COMMERCE_INTEREST_CATEGORIES;
  else if (stream === 'ARTS') baseCategories = ARTS_INTEREST_CATEGORIES;

  const merged = [...extra, ...baseCategories]
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

export const MEDICAL_SKILL_CATEGORIES = [
  {
    id: 'med-core',
    label: 'Healthcare & Clinical',
    icon: '🏥',
    skills: [
      { label: 'Patient Care' },
      { label: 'Clinical Diagnosis' },
      { label: 'First Aid & CPR' },
      { label: 'Medical Terminology' },
      { label: 'Public Health' },
    ]
  },
  {
    id: 'med-lab',
    label: 'Lab & Research',
    icon: '🔬',
    skills: [
      { label: 'Microbiology' },
      { label: 'Pathology' },
      { label: 'Biochemistry' },
      { label: 'Data Analysis' },
    ]
  },
  {
    id: 'tools',
    label: 'General Skills',
    icon: '🛠️',
    skills: [
      { label: 'Communication' },
      { label: 'Problem Solving' },
      { label: 'Empathy' },
    ]
  }
]

export const COMMERCE_SKILL_CATEGORIES = [
  {
    id: 'fin-core',
    label: 'Finance & Accounting',
    icon: '📊',
    skills: [
      { label: 'Financial Accounting' },
      { label: 'Taxation' },
      { label: 'Auditing' },
      { label: 'Financial Modeling' },
      { label: 'Corporate Law' },
    ]
  },
  {
    id: 'bus-mgmt',
    label: 'Business & Strategy',
    icon: '💼',
    skills: [
      { label: 'Marketing Strategy' },
      { label: 'Business Analytics' },
      { label: 'Economics' },
      { label: 'Operations Management' },
    ]
  },
  {
    id: 'tools',
    label: 'Tools & Others',
    icon: '🛠️',
    skills: [
      { label: 'Excel' },
      { label: 'Tally' },
      { label: 'Leadership' },
      { label: 'Communication' },
    ]
  }
]

export const ARTS_SKILL_CATEGORIES = [
  {
    id: 'arts-core',
    label: 'Humanities & Law',
    icon: '📚',
    skills: [
      { label: 'Legal Writing' },
      { label: 'Constitutional Law' },
      { label: 'Psychology Basics' },
      { label: 'Sociology' },
      { label: 'History & Culture' },
    ]
  },
  {
    id: 'arts-creative',
    label: 'Creative & Media',
    icon: '🎨',
    skills: [
      { label: 'Journalism' },
      { label: 'Graphic Design' },
      { label: 'Copywriting' },
      { label: 'Content Strategy' },
      { label: 'Public Relations' },
    ]
  },
  {
    id: 'tools',
    label: 'Tools & Others',
    icon: '🛠️',
    skills: [
      { label: 'Communication' },
      { label: 'Critical Thinking' },
      { label: 'Research' },
      { label: 'Public Speaking' },
    ]
  }
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

export const MEDICAL_INTEREST_CATEGORIES = [
  {
    id: 'core',
    label: 'Core interests',
    icon: '✨',
    interests: [
      { label: 'Patient Care' },
      { label: 'Surgery' },
      { label: 'Medical Research' },
      { label: 'Public Health' },
    ]
  },
  {
    id: 'career',
    label: 'Career & work style',
    icon: '🚀',
    interests: [
      { label: 'Hospital Setting' },
      { label: 'Private Practice' },
      { label: 'NGO / Rural Healthcare' },
      { label: 'Global Health' },
    ]
  }
]

export const COMMERCE_INTEREST_CATEGORIES = [
  {
    id: 'core',
    label: 'Core interests',
    icon: '✨',
    interests: [
      { label: 'Stock Markets' },
      { label: 'Entrepreneurship' },
      { label: 'Financial Planning' },
      { label: 'Business Strategy' },
    ]
  },
  {
    id: 'career',
    label: 'Career & work style',
    icon: '🚀',
    interests: [
      { label: 'Corporate Environment' },
      { label: 'Startup Building' },
      { label: 'Consulting' },
      { label: 'Freelancing' },
    ]
  }
]

export const ARTS_INTEREST_CATEGORIES = [
  {
    id: 'core',
    label: 'Core interests',
    icon: '✨',
    interests: [
      { label: 'Human Rights' },
      { label: 'Creative Writing' },
      { label: 'Art & Design' },
      { label: 'Public Policy' },
      { label: 'Journalism' },
    ]
  },
  {
    id: 'career',
    label: 'Career & work style',
    icon: '🚀',
    interests: [
      { label: 'Academia' },
      { label: 'Media & Broadcasting' },
      { label: 'Government Services' },
      { label: 'Advocacy & NGOs' },
    ]
  }
]

export function flattenSkills() {
  const allCategories = [
    ...SKILL_CATEGORIES,
    ...MEDICAL_SKILL_CATEGORIES,
    ...COMMERCE_SKILL_CATEGORIES,
    ...ARTS_SKILL_CATEGORIES,
    ...Object.values(BRANCH_SKILL_EXTRA).flat()
  ];
  return Array.from(new Set(allCategories.flatMap((c) => c.skills.map((s) => ({ ...s, categoryId: c.id, categoryLabel: c.label })))));
}

export function flattenInterests() {
  const allCategories = [
    ...INTEREST_CATEGORIES,
    ...MEDICAL_INTEREST_CATEGORIES,
    ...COMMERCE_INTEREST_CATEGORIES,
    ...ARTS_INTEREST_CATEGORIES,
    ...Object.values(BRANCH_INTEREST_EXTRA).flat()
  ];
  return Array.from(new Set(allCategories.flatMap((c) => c.interests.map((i) => ({ ...i, categoryId: c.id, categoryLabel: c.label })))));
}
