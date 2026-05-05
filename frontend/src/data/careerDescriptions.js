/**
 * Short descriptions for CFPA career titles (UI copy).
 */
export const CAREER_DESCRIPTIONS = {
  'Software Engineering':
    'Software Engineering involves designing, building, and maintaining applications and systems using programming languages, best practices, and collaboration across teams.',
  'Software Engineer':
    'Software Engineers design, implement, test, and maintain reliable software across backend, services, and sometimes full-stack product features.',
  'Data Science':
    'Data Science involves analyzing data to extract insights and build predictive models using statistics, machine learning, and domain expertise.',
  'Data Scientist':
    'Data Scientists build statistical and ML models, run experiments, and communicate insights to guide product and business decisions.',
  Cybersecurity:
    'Cybersecurity focuses on protecting systems, networks, and data from threats through monitoring, hardening, and incident response.',
  'Cybersecurity Engineer':
    'Cybersecurity Engineers design secure architectures, detect threats, and respond to incidents across applications and infrastructure.',
  'Full Stack Development':
    'Full Stack Development spans both client and server: building UIs, APIs, and databases to deliver complete web applications.',
  'Web Developer':
    'Web Developers build accessible, performant front ends and often collaborate on APIs and deployment for web products.',
  'Cloud Computing':
    'Cloud Computing centers on deploying, scaling, and operating services on platforms like AWS, Azure, or GCP using automation and infrastructure-as-code.',
  'Cloud Engineer':
    'Cloud Engineers automate infrastructure, manage reliability, cost, and security on public cloud platforms.',
  'AI Engineer':
    'AI Engineers ship ML and AI systems end to end: data pipelines, model integration, evaluation, and production monitoring.',
  'Embedded Systems Engineer':
    'Embedded Systems Engineers develop firmware and low-level software on microcontrollers and SoCs for devices and real-time constraints.',
  'IoT Engineer':
    'IoT Engineers connect sensors, edge devices, and cloud services with secure protocols and scalable data flows.',
  'VLSI Engineer':
    'VLSI Engineers work on chip design, verification, and physical implementation for ASICs and FPGA flows.',
  'Electrical Engineer':
    'Electrical Engineers design and test power, control, and analog/digital systems for products and infrastructure.',
  'Power Systems Engineer':
    'Power Systems Engineers focus on generation, transmission, distribution, protection, and stability of electrical grids.',
  'Mechanical Design Engineer':
    'Mechanical Design Engineers use CAD, simulation, and design principles to develop mechanical parts and assemblies.',
  'Production Engineer':
    'Production Engineers optimize manufacturing lines, quality, throughput, and tooling in industrial environments.',
  'Civil Engineer':
    'Civil Engineers plan and oversee infrastructure projects such as roads, bridges, water systems, and site development.',
  'Structural Engineer':
    'Structural Engineers analyze loads and materials to design safe buildings, bridges, and other load-bearing structures.',
  'Data Analyst':
    'Data Analysts query dashboards, perform SQL analysis, and report trends to support operations and product decisions.',
}

export function getCareerDescription(name) {
  return (
    CAREER_DESCRIPTIONS[name] ||
    'This career path combines technical depth with problem-solving aligned with industry practice.'
  )
}
