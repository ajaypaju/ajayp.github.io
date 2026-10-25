// Single source of truth for every piece of text on the site.
// Edit content here; components only read from this file.
// Rule: only real facts. Never add skills, metrics or projects that aren't true.

export type SectionId =
  | 'hero'
  | 'metrics'
  | 'prompt-to-task'
  | 'architecture'
  | 'experience'
  | 'skills'
  | 'awards'
  | 'contact'

export interface SectionMeta {
  id: SectionId
  /** Short label for the nav and command palette. */
  navLabel: string
  /** Visible section heading. */
  heading: string
  /** Placeholder line shown until the section is built. */
  placeholder: string
}

export interface Link {
  label: string
  href: string
}

export interface Metric {
  /** Display value, e.g. "500+". */
  value: string
  label: string
  /** For animated before → after metrics. */
  from?: string
  to?: string
}

export interface Role {
  title: string
  start: string
  end: string
  highlights: string[]
}

export interface Company {
  name: string
  product: string
  location: string
  roles: Role[]
}

export interface SkillGroup {
  group: string
  items: string[]
}

export interface Education {
  degree: string
  institution: string
  year: number
}

export interface Profile {
  name: string
  title: string
  /** One-line value proposition for the hero. */
  tagline: string
  location: string
  email: string
  links: {
    linkedin: Link
    github: Link
  }
  /** Path under public/. */
  cvPath: string
  summary: string
  metrics: Metric[]
  experience: Company[]
  skills: SkillGroup[]
  awards: string[]
  education: Education[]
  sections: SectionMeta[]
}

export const profile: Profile = {
  name: 'Ajay P',
  title: 'Technical Lead · Full-Stack Engineer',
  tagline:
    'I build and run a production multi-tenant SaaS used by 500+ organizations, and lead the AI automation on top of it.',
  location: 'Calicut, Kerala, India',
  email: 'ajaypaju008@gmail.com',
  links: {
    linkedin: { label: 'LinkedIn', href: 'https://linkedin.com/in/ajaypofficial' },
    github: { label: 'GitHub', href: 'https://github.com/ajaypaju' },
  },
  cvPath: '/Ajay_P_CV.pdf',

  summary:
    'Technical Lead with 5+ years building and running Desklog.io, a production multi-tenant SaaS used by 500+ organizations. I lead the platform’s AI and automation work and own backend architecture, AWS infrastructure and production reliability end to end.',

  metrics: [
    { value: '500+', label: 'organizations on the platform' },
    { value: '5+', label: 'years shipping Desklog.io' },
    { value: '~300 ms', label: 'reporting API latency', from: '~900 ms', to: '~300 ms' },
    { value: '60%', label: 'faster report generation' },
  ],

  experience: [
    {
      name: 'Infinite Open Source Solutions LLP',
      product: 'Desklog.io',
      location: 'Calicut, Kerala',
      roles: [
        {
          title: 'Technical Lead',
          start: 'Apr 2026',
          end: 'Present',
          highlights: [
            'Own backend architecture, technical delivery and production reliability for Desklog.io.',
            'Built a role-based MCP server that exposes Desklog data and actions to AI clients, scoped to each user’s role and permissions.',
            'Connected Claude Code to Desklog so a plain-language prompt creates tasks automatically.',
            'Introduced AI bot users: agent accounts that are assigned tasks like any team member and carry out automated work.',
            'Built LLM-powered chat workflows for in-product help and assisted automation.',
            'Manage AWS infrastructure (EC2, RDS, S3), monitoring and deployment workflows, including on-premise deployments.',
            'Mentor junior developers, review pull requests, set engineering standards, coordinate releases with Product and QA.',
          ],
        },
        {
          title: 'Software Engineer',
          start: 'Oct 2021',
          end: 'Mar 2026',
          highlights: [
            'Built Laravel REST APIs and frontend modules for time tracking, project management, leave workflows, screenshot capture, activity logging and reporting.',
            'Cut reporting API latency from ~900 ms to ~300 ms and improved report generation speed 60% through MySQL query optimization and Redis caching.',
            'Designed and optimized MySQL and MongoDB schemas for backend and reporting workloads.',
            'Integrated Stripe, Razorpay, AWS S3, email/SMS, webhooks and OAuth2 SSO.',
            'Implemented RBAC with Laravel policies and middleware; built queue-based background jobs and data-aggregation pipelines.',
            'Shipped features through CI/CD workflows, code reviews and release support.',
          ],
        },
      ],
    },
  ],

  skills: [
    {
      group: 'AI & Automation',
      items: ['LLM API integration', 'MCP servers', 'Claude Code', 'AI agents and bot users', 'Prompt engineering'],
    },
    {
      group: 'Backend',
      items: ['PHP', 'Laravel (9–13)', 'Node.js', 'NestJS', 'REST APIs', 'Queues and background jobs'],
    },
    { group: 'Frontend', items: ['HTML', 'CSS', 'JavaScript'] },
    {
      group: 'Cloud & DevOps',
      items: ['AWS (EC2, S3, RDS)', 'Docker', 'GitLab CI/CD', 'GitHub', 'Cloudflare', 'Linux'],
    },
    { group: 'Databases', items: ['MySQL', 'MongoDB', 'Redis'] },
    {
      group: 'Architecture',
      items: ['Multi-tenant SaaS', 'RBAC', 'Caching', 'Webhooks', 'System design'],
    },
  ],

  awards: [
    'Winner, company-wide AI Prompt Engineering Challenge',
    'Best R&D Team Performer (2023–2025), Desklog SaaS platform',
    'Best Programmer Award (2022)',
  ],

  education: [
    {
      degree: 'B.Sc. Computer Science',
      institution: 'People’s Co-operative Arts and Science College, Kasaragod',
      year: 2020,
    },
  ],

  sections: [
    {
      id: 'hero',
      navLabel: 'Home',
      heading: 'Ajay P',
      placeholder: '',
    },
    {
      id: 'metrics',
      navLabel: 'Impact',
      heading: 'Impact in numbers',
      placeholder: 'Animated metrics strip goes here.',
    },
    {
      id: 'prompt-to-task',
      navLabel: 'AI',
      heading: 'Prompt → Task',
      placeholder: 'Walkthrough: Claude Code prompt → role-based MCP server → Desklog API → AI bot user.',
    },
    {
      id: 'architecture',
      navLabel: 'Architecture',
      heading: 'Architecture map',
      placeholder: 'Interactive map of a multi-tenant SaaS goes here.',
    },
    {
      id: 'experience',
      navLabel: 'Experience',
      heading: 'Experience',
      placeholder: 'Experience timeline goes here.',
    },
    {
      id: 'skills',
      navLabel: 'Skills',
      heading: 'Skills',
      placeholder: 'Grouped skills grid with a “view as JSON” toggle goes here.',
    },
    {
      id: 'awards',
      navLabel: 'Awards',
      heading: 'Awards & education',
      placeholder: 'Awards and education go here.',
    },
    {
      id: 'contact',
      navLabel: 'Contact',
      heading: 'Contact',
      placeholder: 'Terminal-styled contact block goes here.',
    },
  ],
}

export const sectionById = (id: SectionId): SectionMeta => {
  const s = profile.sections.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown section: ${id}`)
  return s
}
