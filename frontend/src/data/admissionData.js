export const ADMISSION_EXAMS = [
  // --- ENGINEERING ---
  {
    id: 'jee-main-session-2-2026',
    name: 'JEE Main 2026 (Session 2)',
    date: '2026-06-15', 
    applicationStart: '2026-02-01',
    lastDate: '2026-03-05',
    resultDate: '2026-06-30',
    counsellingStart: '2026-07-10',
    category: 'Engineering',
    state: 'All India',
    targetAudience: 'Students seeking admission to NITs, IIITs, and GFTIs.',
    description: 'National level entrance for premium engineering institutes in India.',
    registrationLink: 'https://jeemain.nta.nic.in/',
    steps: ['Register on NTA portal', 'Upload Photograph & Signature', 'Pay Fee', 'Download Confirmation']
  },
  {
    id: 'bitsat-2026',
    name: 'BITSAT 2026',
    date: '2026-06-20',
    applicationStart: '2026-03-15',
    lastDate: '2026-05-15',
    resultDate: '2026-07-01',
    counsellingStart: '2026-07-10',
    category: 'Engineering',
    state: 'All India',
    targetAudience: 'Aspirants for BITS Pilani, Goa, and Hyderabad campuses.',
    description: 'Computer-based online test for Integrated First Degree programmes.',
    registrationLink: 'https://www.bitsadmission.com/',
    steps: ['Online Registration', 'Test Center Selection', 'Slot Booking', 'Admit Card']
  },
  {
    id: 'mhcet-2026',
    name: 'MHT CET 2026',
    date: '2026-05-20',
    applicationStart: '2026-02-01',
    lastDate: '2026-03-15',
    category: 'Engineering',
    state: 'Maharashtra',
    targetAudience: 'Students seeking B.E/B.Tech in Maharashtra colleges.',
    description: 'Maharashtra Common Entrance Test for Technical Education.',
    registrationLink: 'https://cetcell.mahacet.org/',
    steps: ['Register', 'Select Group (PCM/PCB)', 'Payment']
  },
  {
    id: 'ap-eapcet-2026',
    name: 'AP EAPCET 2026',
    date: '2026-05-18',
    applicationStart: '2026-03-10',
    lastDate: '2026-04-15',
    category: 'Engineering',
    state: 'Andhra Pradesh',
    targetAudience: 'Engineering/Agriculture aspirants in Andhra Pradesh.',
    description: 'State entrance for technical programs in Andhra Pradesh.',
    registrationLink: 'https://sche.ap.gov.in/',
    steps: ['Registration', 'Payment', 'Form Filling']
  },

  // --- MEDICAL ---
  {
    id: 'neet-ug-2026-future',
    name: 'NEET UG 2026 (Extended)',
    date: '2026-05-24',
    applicationStart: '2026-02-09',
    lastDate: '2026-04-10',
    resultDate: '2026-06-20',
    counsellingStart: '2026-07-15',
    category: 'Medical',
    state: 'All India',
    targetAudience: 'Aspiring doctors seeking MBBS/BDS/AYUSH seats.',
    description: 'The single entrance exam for all medical colleges in India.',
    registrationLink: 'https://neet.nta.nic.in/',
    steps: ['Create Profile', 'Fill Details', 'Upload Documents', 'Payment']
  },

  // --- MANAGEMENT ---
  {
    id: 'mat-2026',
    name: 'MAT 2026 (May Session)',
    date: '2026-05-25',
    applicationStart: '2026-03-01',
    lastDate: '2026-05-15',
    category: 'Management',
    state: 'All India',
    targetAudience: 'MBA aspirants for various B-schools across India.',
    description: 'Management Aptitude Test conducted by AIMA.',
    registrationLink: 'https://mat.aima.in/',
    steps: ['Registration', 'Select Mode (PBT/CBT)', 'Upload Photo', 'Pay Fee']
  },
  {
    id: 'cmat-2026',
    name: 'CMAT 2026',
    date: '2026-05-15',
    applicationStart: '2026-02-15',
    lastDate: '2026-04-10',
    category: 'Management',
    state: 'All India',
    targetAudience: 'Admission to AICTE approved management programs.',
    description: 'Common Management Admission Test by NTA.',
    registrationLink: 'https://cmat.nta.nic.in/',
    steps: ['Apply Online', 'Fill Qualification', 'Upload Scanned Images', 'Fee Payment']
  },

  // --- LAW ---
  {
    id: 'clat-2027',
    name: 'CLAT 2027',
    date: '2026-12-06',
    applicationStart: '2026-07-01',
    lastDate: '2026-11-10',
    category: 'Law',
    state: 'All India',
    targetAudience: 'Admission to 22 National Law Universities (NLUs).',
    description: 'Common Law Admission Test for UG and PG programs.',
    registrationLink: 'https://consortiumofnlus.ac.in/',
    steps: ['Registration', 'Fill Application', 'Upload Documents', 'Payment']
  },
  {
    id: 'ap-lawcet-2026',
    name: 'AP LAWCET 2026',
    date: '2026-06-10',
    applicationStart: '2026-03-20',
    lastDate: '2026-05-10',
    category: 'Law',
    state: 'Andhra Pradesh',
    targetAudience: '3-year and 5-year LLB aspirants in Andhra Pradesh.',
    description: 'Andhra Pradesh Common Law Entrance Test.',
    registrationLink: 'https://sche.ap.gov.in/lawcet',
    steps: ['Fee Payment', 'Know Status', 'Fill Application']
  },

  // --- DESIGN & ARCHITECTURE ---
  {
    id: 'nift-2026-round2',
    name: 'NIFT 2026 (Situation Test)',
    date: '2026-04-30', // Past, let's make it future for demo
    applicationStart: '2026-04-01',
    lastDate: '2026-04-15',
    category: 'Design',
    state: 'All India',
    targetAudience: 'Aspiring designers for NIFT campuses.',
    description: 'National Institute of Fashion Technology entrance.',
    registrationLink: 'https://nift.ac.in/',
    steps: ['Shortlisting', 'Situation Test', 'Interview', 'Counselling']
  },
  {
    id: 'nata-2026-attempt2',
    name: 'NATA 2026 (Phase 2)',
    date: '2026-06-12',
    applicationStart: '2026-04-01',
    lastDate: '2026-05-25',
    category: 'Architecture',
    state: 'All India',
    targetAudience: 'B.Arch aspirants for various colleges in India.',
    description: 'National Aptitude Test in Architecture Phase 2.',
    registrationLink: 'https://www.nata.in/',
    steps: ['Registration', 'Document Upload', 'Fee Payment', 'Slot Booking']
  },

  // --- UNIVERSITY & OTHERS ---
  {
    id: 'cuet-ug-2026-future',
    name: 'CUET UG 2026',
    date: '2026-05-28',
    applicationStart: '2026-02-20',
    lastDate: '2026-04-15',
    resultDate: '2026-06-30',
    counsellingStart: '2026-07-15',
    category: 'University',
    state: 'All India',
    targetAudience: 'Admission to Central Universities across India.',
    description: 'Common University Entrance Test for undergraduate programs.',
    registrationLink: 'https://cuet.samarth.ac.in/',
    steps: ['Registration', 'University/Program Selection', 'Document Upload', 'Fee Payment']
  },
  {
    id: 'ipmat-2026',
    name: 'IPMAT Indore 2026',
    date: '2026-05-20',
    applicationStart: '2026-02-15',
    lastDate: '2026-04-20',
    category: 'University',
    state: 'All India',
    targetAudience: 'Aspiring students for 5-year Integrated Program in Management at IIM Indore.',
    description: 'Integrated Programme in Management Aptitude Test.',
    registrationLink: 'https://www.iimidr.ac.in/',
    steps: ['Online Registration', 'Fill Application', 'Upload Documents', 'Pay Fee']
  }
]
