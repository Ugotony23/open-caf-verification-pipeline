import 'dotenv/config';
import { prisma } from './db.js';
import { hashPassword } from './lib/auth.js';

// Representative seed of the NCSC Cyber Assessment Framework (CAF) v3.2
// structure: Objectives, Principles and Contributing Outcomes are the
// official titles. Each outcome carries one illustrative "Achieved" level
// Indicator of Good Practice (IGP) as a starting point for evidence
// mapping — this is not the full official IGP set.
const framework = [
  {
    id: 'A',
    name: 'Managing security risk',
    description:
      'Appropriate organisational structures, policies, and processes are in place to understand, assess and systematically manage security risks to the network and information systems.',
    principles: [
      {
        id: 'A1',
        name: 'Governance',
        description:
          'The organisation has appropriate management policies, processes and procedures in place to govern its approach to the security of network and information systems.',
        outcomes: [
          { id: 'A1.a', name: 'Board Direction', igp: 'The board sets, endorses and reviews the organisation\'s cyber security strategy and risk appetite.' },
          { id: 'A1.b', name: 'Roles and Responsibilities', igp: 'Cyber security roles and responsibilities are documented and understood across the organisation.' },
          { id: 'A1.c', name: 'Decision-making', igp: 'Effective security decisions can be made at appropriate levels with sufficient context and expertise.' },
        ],
      },
      {
        id: 'A2',
        name: 'Risk Management',
        description:
          'The organisation takes appropriate steps to identify, assess and understand security risks.',
        outcomes: [
          { id: 'A2.a', name: 'Risk Management Process', igp: 'A structured risk management process is applied and reviewed regularly, with risks tracked to a register.' },
          { id: 'A2.b', name: 'Assurance', igp: 'Independent assurance activities validate that risk controls are working as intended.' },
        ],
      },
      {
        id: 'A3',
        name: 'Asset Management',
        description:
          'Everything required to deliver, maintain or support essential functions is identified and understood.',
        outcomes: [
          { id: 'A3.a', name: 'Asset Management', igp: 'An asset inventory of systems, data and services supporting essential functions is maintained and kept current.' },
        ],
      },
      {
        id: 'A4',
        name: 'Supply Chain',
        description:
          'The organisation understands and manages security risks arising from its supply chain.',
        outcomes: [
          { id: 'A4.a', name: 'Supply Chain', igp: 'Security requirements are incorporated into contracts and third-party risk is assessed before onboarding suppliers.' },
        ],
      },
    ],
  },
  {
    id: 'B',
    name: 'Protecting against cyber attack',
    description:
      'Proportionate security measures are in place to protect the network and information systems from cyber attack.',
    principles: [
      {
        id: 'B1',
        name: 'Service Protection Policies and Processes',
        description: 'Appropriate policies and processes are defined, implemented and communicated to protect essential functions.',
        outcomes: [
          { id: 'B1.a', name: 'Policy and Process Development', igp: 'Security policies and processes are developed to address business and technical requirements and are proportionate to risk.' },
          { id: 'B1.b', name: 'Policy and Process Implementation', igp: 'Security policies and processes are consistently applied and staff compliance is monitored.' },
        ],
      },
      {
        id: 'B2',
        name: 'Identity and Access Control',
        description: 'The organisation understands, documents and manages access to systems supporting essential functions.',
        outcomes: [
          { id: 'B2.a', name: 'Identity Verification, Authentication and Authorisation', igp: 'Access to systems is granted only to identified, authenticated and authorised users or systems, using appropriate methods such as MFA.' },
          { id: 'B2.b', name: 'Device Management', igp: 'Only known, trusted and managed devices can access systems supporting essential functions.' },
          { id: 'B2.c', name: 'Privileged User Management', igp: 'Enhanced monitoring and controls are applied to privileged and highly privileged accounts.' },
          { id: 'B2.d', name: 'Identity and Access Management (IdAM)', igp: 'Access rights are reviewed periodically and revoked promptly when no longer required.' },
        ],
      },
      {
        id: 'B3',
        name: 'Data Security',
        description: 'Data stored or transmitted electronically is protected from unauthorised access, modification or deletion.',
        outcomes: [
          { id: 'B3.a', name: 'Understanding Data', igp: 'Data important to the essential function is identified, classified and its flow understood.' },
          { id: 'B3.b', name: 'Data in Transit', igp: 'Data in transit is protected using appropriate encryption and integrity controls.' },
          { id: 'B3.c', name: 'Stored Data', igp: 'Data at rest is protected against unauthorised access using encryption or equivalent controls.' },
          { id: 'B3.d', name: 'Mobile Data', igp: 'Data on mobile devices is protected commensurate with the risk of device loss or theft.' },
          { id: 'B3.e', name: 'Media/Equipment Sanitisation', igp: 'Data is removed or securely destroyed from media and equipment before reuse or disposal.' },
        ],
      },
      {
        id: 'B4',
        name: 'System Security',
        description: 'Network and information systems and technology are protected from cyber attack.',
        outcomes: [
          { id: 'B4.a', name: 'Secure by Design', igp: 'Systems are designed with security architecture principles such as segmentation and least privilege.' },
          { id: 'B4.b', name: 'Secure Configuration', igp: 'Hardened baseline configurations are applied and deviations are detected and remediated.' },
          { id: 'B4.c', name: 'Secure Management', igp: 'Administrative and management interfaces are protected against unauthorised access.' },
          { id: 'B4.d', name: 'Vulnerability Management', igp: 'Vulnerabilities are identified, prioritised and remediated within timescales proportionate to risk.' },
        ],
      },
      {
        id: 'B5',
        name: 'Resilient Networks and Systems',
        description: 'The organisation builds resilience against cyber attack into the design, implementation, operation and management of systems.',
        outcomes: [
          { id: 'B5.a', name: 'Resilience Preparation', igp: 'The organisation has plans and capability in place to maintain essential functions during a cyber attack.' },
          { id: 'B5.b', name: 'Design for Resilience', igp: 'Systems are designed to withstand or recover quickly from the impact of anticipated cyber attacks.' },
          { id: 'B5.c', name: 'Backups', igp: 'Backups of important data are taken, tested for restoration, and stored isolated from the live network.' },
        ],
      },
      {
        id: 'B6',
        name: 'Staff Awareness and Training',
        description: 'Staff are provided with appropriate awareness, knowledge and skills to carry out their organisational role.',
        outcomes: [
          { id: 'B6.a', name: 'Cyber Security Culture', igp: 'A positive cyber security culture exists, with staff empowered to raise concerns and report incidents.' },
          { id: 'B6.b', name: 'Cyber Security Training', igp: 'Role-appropriate cyber security training is delivered and its effectiveness is evaluated.' },
        ],
      },
    ],
  },
  {
    id: 'C',
    name: 'Detecting cyber security events',
    description: 'Capabilities exist to ensure security defences remain effective and to detect cyber security events affecting essential functions.',
    principles: [
      {
        id: 'C1',
        name: 'Security Monitoring',
        description: 'The organisation monitors systems to detect potential security problems and to track the effectiveness of existing security measures.',
        outcomes: [
          { id: 'C1.a', name: 'Monitoring Coverage', igp: 'Monitoring coverage includes networks, systems and data required to support essential functions.' },
          { id: 'C1.b', name: 'Securing Logs', igp: 'Log data is protected from unauthorised access or modification and retained for an appropriate period.' },
          { id: 'C1.c', name: 'Generating Alerts', igp: 'Security tooling reliably generates alerts for anomalous or suspicious activity based on defined use cases.' },
          { id: 'C1.d', name: 'Identifying Security Incidents', igp: 'Indicators of compromise are correlated and triaged to reliably identify security incidents.' },
          { id: 'C1.e', name: 'Monitoring Tools and Skills', igp: 'Monitoring staff have the tools, skills and knowledge to effectively identify and respond to events.' },
        ],
      },
      {
        id: 'C2',
        name: 'Proactive Security Event Discovery',
        description: 'The organisation detects, within networks and information systems, malicious activity affecting, or with the potential to affect, essential functions.',
        outcomes: [
          { id: 'C2.a', name: 'System Abnormalities for Attack Detection', igp: 'A baseline of normal system behaviour is used to detect deviations indicative of an attack.' },
          { id: 'C2.b', name: 'Proactive Attack Discovery', igp: 'Proactive threat hunting is conducted to search for attacker activity not identified by existing tooling.' },
        ],
      },
    ],
  },
  {
    id: 'D',
    name: 'Minimising the impact of cyber security incidents',
    description: 'Capabilities exist to minimise the impact of a cyber security incident, including the restoration of essential functions.',
    principles: [
      {
        id: 'D1',
        name: 'Response and Recovery Planning',
        description: 'Well-defined and tested incident management processes are in place, aimed at minimising the impact of cyber security incidents.',
        outcomes: [
          { id: 'D1.a', name: 'Response Plan', igp: 'A documented incident response plan defines roles, escalation paths and communication procedures.' },
          { id: 'D1.b', name: 'Response and Recovery Capability', igp: 'The organisation has resourced capability to enact its response plan and restore essential functions.' },
          { id: 'D1.c', name: 'Testing and Exercising', igp: 'Incident response plans are tested through exercises and updated based on the lessons identified.' },
        ],
      },
      {
        id: 'D2',
        name: 'Lessons Learned',
        description: 'Root causes of security incidents are identified and lessons are used to improve security measures.',
        outcomes: [
          { id: 'D2.a', name: 'Incident Root Cause Analysis', igp: 'Root cause analysis is performed on security incidents to understand contributing factors.' },
          { id: 'D2.b', name: 'Using Incidents to Drive Improvements', igp: 'Findings from incidents and near misses are used to drive measurable improvements to security controls.' },
        ],
      },
    ],
  },
];

async function main() {
  for (const objective of framework) {
    await prisma.objective.upsert({
      where: { id: objective.id },
      update: { name: objective.name, description: objective.description },
      create: { id: objective.id, name: objective.name, description: objective.description },
    });

    for (const principle of objective.principles) {
      await prisma.principle.upsert({
        where: { id: principle.id },
        update: { name: principle.name, description: principle.description, objectiveId: objective.id },
        create: {
          id: principle.id,
          name: principle.name,
          description: principle.description,
          objectiveId: objective.id,
        },
      });

      for (const outcome of principle.outcomes) {
        const outcomeDescription = `Contributing outcome "${outcome.name}" under ${principle.name} (Objective ${objective.id}: ${objective.name}).`;
        await prisma.outcome.upsert({
          where: { id: outcome.id },
          update: { name: outcome.name, description: outcomeDescription, principleId: principle.id },
          create: {
            id: outcome.id,
            name: outcome.name,
            description: outcomeDescription,
            principleId: principle.id,
          },
        });

        const existingIgp = await prisma.iGP.findFirst({ where: { outcomeId: outcome.id } });
        if (!existingIgp) {
          await prisma.iGP.create({
            data: { outcomeId: outcome.id, statement: outcome.igp },
          });
        }
      }
    }
  }

  console.log('CAF framework seed complete.');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: await hashPassword(adminPassword) },
      create: { email: adminEmail, passwordHash: await hashPassword(adminPassword) },
    });
    console.log(`Login user ready: ${adminEmail}`);
  } else {
    console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env and re-run this seed to create a login user.');
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
