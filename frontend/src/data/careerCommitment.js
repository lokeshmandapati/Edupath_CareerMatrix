export const CAREER_COMMITMENT = {
  'Software Engineer': { duration: '4 years', difficulty: 'Hard', level: 3, description: 'Needs strong dedication & practice' },
  'AI Engineer': { duration: '4-5 years', difficulty: 'Hard', level: 3, description: 'Requires advanced math & research' },
  'Data Scientist': { duration: '4 years', difficulty: 'Hard', level: 3, description: 'Needs strong statistical foundation' },
  'Product Manager': { duration: '3-4 years', difficulty: 'Medium', level: 2, description: 'Requires regular study & soft skills' },
  'UI/UX Designer': { duration: '3 years', difficulty: 'Medium', level: 2, description: 'Focus on creativity & tool mastery' },
  'Doctor (MBBS)': { duration: '5.5 years', difficulty: 'Very Hard', level: 4, description: 'Extreme commitment & dedication' },
  'Lawyer': { duration: '5 years', difficulty: 'Hard', level: 3, description: 'Requires strong analytical & legal skills' },
  'Chartered Accountant': { duration: '4-5 years', difficulty: 'Very Hard', level: 4, description: 'Intense focus on law & accounts' },
  'Architect': { duration: '5 years', difficulty: 'Very Hard', level: 4, description: 'Requires creative & technical mastery' },
  'Pharmacist': { duration: '4 years', difficulty: 'Medium', level: 2, description: 'Detailed knowledge of medical drug' },
  'Psychologist': { duration: '5 years (incl. Masters)', difficulty: 'Hard', level: 3, description: 'Requires empathy & research focus' },
  'Business Analyst': { duration: '3 years', difficulty: 'Medium', level: 2, description: 'Focus on data & business logic' },
  'Journalist': { duration: '3 years', difficulty: 'Medium', level: 2, description: 'Field work & strong communication' },
  'Nurse': { duration: '4 years', difficulty: 'Medium', level: 2, description: 'Clinical practice & patient care' },
  'Company Secretary': { duration: '4 years', difficulty: 'Hard', level: 3, description: 'Expertise in corporate governance' },
}

export const getCommitment = (careerName) => {
  return CAREER_COMMITMENT[careerName] || { 
    duration: '3-4 years', 
    difficulty: 'Medium', 
    level: 2, 
    description: 'Requires standard academic commitment' 
  }
}
