# My Portfolio Data

> This document acts as the single source of truth for all portfolio content.
> Fill in the sections below with your personal information. The application can later use this file to populate the database or seed data automatically.

---

# Profile

## Basic Information

| Field               | Value                                         |
| ------------------- | --------------------------------------------- |
| Full Name           | Yash Raj Singh Bisht                          |
| Preferred Name      | Yash Raj                                      |
| Professional Title  | Senior Software Engineer                      |
| Current Role        | Senior Software Engineer                      |
| Company             | thinkBridge                                   |
| Years of Experience | 5                                             |
| Location            | Delhi                                         |
| Nationality         | India                                         |
| Email               | yrajsingh0001@gmail.com                       |
| Phone               | +91-9278557002                                |
| Website             |                                               |
| Resume File         | assets\resume\Yash_Raj_Singh_Bisht_Resume.pdf |
| Profile Image       | assets/profile/profile.jpg                    |

---

# About

## Introduction

As a Senior Software Engineer with over 5 years of professional experience, I specialize in designing and building scalable, high-performance backend systems and cloud-native applications. My expertise includes Node.js, TypeScript, PostgreSQL, microservices, event-driven architecture, and AWS. I enjoy solving complex engineering challenges, optimizing system performance, and building reliable software that scales. Passionate about continuous learning, I constantly explore modern technologies and best practices to deliver robust, maintainable, and impactful solutions.

---

## Detailed Biography

My software engineering journey began with a passion for solving real-world problems through technology. Over the years, I have built and optimized backend systems powering transportation, fintech, and enterprise applications, focusing on scalability, reliability, and performance.

Throughout my career, I have contributed to designing distributed systems, developing REST and GraphQL APIs, implementing microservices, optimizing SQL queries, and building cloud-native applications. I enjoy working on complex backend architectures where performance, maintainability, and clean engineering practices are essential.

I have hands-on experience with technologies including Node.js, TypeScript, Python, PostgreSQL, SQL Server, MongoDB, Neo4j, AWS, Docker, Kubernetes, Kafka, gRPC, OpenTelemetry, and modern DevOps practices. I also enjoy exploring new tools and frameworks that improve software quality and developer productivity.

Beyond writing code, I enjoy analyzing production issues, improving system observability, optimizing database performance, and designing scalable architectures capable of handling high-throughput workloads. I believe that great software is built through clean architecture, thoughtful design, and continuous learning.

My long-term goal is to grow into a Staff or Principal Software Engineer, contributing to large-scale distributed systems while mentoring engineers and driving technical excellence. I actively invest time in improving my skills through system design, data structures and algorithms, cloud technologies, and open-source projects.

Outside of software development, I enjoy learning new technologies, reading technical articles, working on personal side projects, studying the Bhagavad Gita, watching movies, traveling, and exploring new places. I believe maintaining curiosity and a growth mindset is just as important as technical expertise.

---

## Core Specializations

- Scalable Backend Development
- Distributed Systems
- Microservices Architecture
- Event-Driven Systems
- Cloud-Native Applications
- API Design (REST, GraphQL, gRPC)
- Database Performance Optimization
- System Design
- Observability & Monitoring
- Performance Engineering

---

## Industries

- Transportation & Mobility
- FinTech
- Enterprise SaaS
- Compliance & Document Management

---

## Career Goals

- Become a Staff/Principal Software Engineer.
- Build highly scalable distributed systems serving millions of users.
- Contribute to impactful open-source projects.
- Deepen expertise in cloud infrastructure, platform engineering, and system design.
- Mentor developers and lead engineering initiatives.

---

## Personal Interests

- Continuous learning
- System design
- Cloud technologies
- Open-source software
- Personal development
- Reading technical blogs
- Bhagavad Gita
- Movies
- Traveling

---

## Company

### Company Name

thinkBridge

### Website

https://www.thinkbridge.com/

### Position

Senior Software Engineer – Backend

### Employment Type

Full Time

### Location

India (Remote)

### Start Date

July 2025

### End Date

Present

### Summary

Working as a Senior Backend Engineer on scalable transportation and ride-assignment systems. Focused on improving system performance, database optimization, production reliability, and distributed backend services for high-volume trip assignment.

### Responsibilities

- Designed and implemented scalable backend services for automated trip assignment.
- Optimized SQL Server queries and stored procedures for high-volume production workloads.
- Debugged critical production incidents and performed root cause analysis.
- Collaborated with product managers and stakeholders to deliver business-critical enhancements.
- Improved reliability and scalability of queue-based processing systems.

### Major Achievements

- Migrated the auto-assignment of trips from SQL Server Agents to a scalable backend, queue-based system. This improved processing efficiency by 50%, ensured timely allocation of subcontractors/vendors for new reservations, and provided vendors with adequate lead time to act on scheduled trips. The migration significantly enhanced system scalability and reduced assignment failures by 40%.
- Collaborated with the client team to implement Fraud, Waste, and Abuse (FWA) safeguards within the SQL-based auto-assignment engine, preventing trip assignments that conflicted with members' preferred transportation vendors while ensuring compliance with health plan policies. Reduced policy violations by 70% and improved assignment accuracy by 45%.
- Investigated and resolved a critical production issue where a client vendor was not receiving reservation updates due to intermittent Kafka message publishing failures. Performed root cause analysis, identified faulty legacy code causing Kafka producer interruptions, and upgraded outdated dependencies to improve reliability and security, reducing message delivery failures by 90% and improving integration stability by 60%.
- Investigated a client-reported auto-assignment issue involving unintended movement of reservations between assigned folders when no suitable vendor was found. Proposed and implemented a permission-based change (via approved change request) to enforce business rules, reducing incorrect reservation movements by 70% and improving assignment stability by 50%.
- Authored an advanced business/technical document outlining API integrations with the client application, including current vendor usage and identified gaps. Collaborated with management to refine requirements, improving integration clarity by 60% and accelerating vendor onboarding and decision-making by 35%.
- Investigated critical client-reported issues involving incorrect vendor assignments across different levels of service. Produced detailed analysis for management and, upon approval, collaborated with cross-module teams to implement fixes across the application, reducing assignment errors by 65% and improving service accuracy by 50%.
- Collaborated with the support team to validate the auto-assignment workflow, confirming member preference logic against business rules. Identified legacy code as the root cause of a client-reported issue and implemented a fix (with management approval) across all subcontractors, reducing future assignment inconsistencies by 60% and improving system reliability by 40%.
- Investigated a reported production issue where inactive subcontractors were allegedly being assigned to reservations. Conducted end-to-end validation of reservation workflows and collaborated with client and support teams to demonstrate existing system checks, confirming the case as a false positive, reducing support escalations by 60% and improving client confidence in the assignment logic by 50%.
- Created a comprehensive auto-assigner flow diagram for production workflows, clearly documenting business rules and decision logic, improving stakeholder understanding by 70% and reducing clarification and onboarding time for engineering and client teams by 40%.
- Implemented urgent ad-hoc fixes to block rideshare trip assignments for unaccompanied minors, addressing critical client requirements and ensuring 100% compliance with safety policies while preventing invalid trip allocations.
- Delivered rapid ad-hoc fixes across DEV and UAT environments to unblock multiple module teams, collaborating cross-functionally to identify root causes and resolve issues, reducing testing delays by ~50% and accelerating release readiness.
- Implemented SDRC-specific enhancements to the Auto-Assigner stored procedure, dynamically rerouting trips from Uber to Lyft based on client requirements and ad-hoc business rules. This reduced incorrect vendor assignments by 65%, improved client satisfaction by 40%, and minimized manual intervention by 50%.
- Implemented a background scheduler for Uber batch trip cancellations to handle incorrectly scheduled or canceled future trips. Added organization IDs to all Uber API requests in coordination with the Uber engineering team, improving cancellation accuracy by 60% and reducing vendor reconciliation issues by 45%.
- Implemented ad-hoc enhancements to auto-assignment stored procedure logic to prioritize Uber rideshare for trip allocations, as requested by management. Thoroughly tested changes in lower environments and deployed to production using a controlled rollout, increasing Uber trip assignment coverage by 35% while maintaining system stability.
- Investigated a critical production issue where vendor trip assignments were being overridden by the auto-assigner SQL job. Performed an in-depth RCA, identified the faulty logic, and implemented a permanent fix with management approval. This reduced assignment conflicts by 70% and improved overall trip allocation accuracy by 60%.
- Analyzed and resolved a critical vendor-assignment issue that blocked billing teams from sending invoices. Identified the root cause—incorrect subcontractor assignment due to outdated cached trip data—and fixed the stored procedure responsible for handling completed trips. This restored billing operations and improved data accuracy by 45%.
- Investigated vendor trip closeout issues related to incorrect trip assignments for standing orders. Successfully replicated the problem in lower environments and proposed a development plan introducing required business-logic changes in the CCERRTS application, improving assignment accuracy by 40% and aligning the platform with client requirements.
- Investigated and resolved issues preventing trip dispatch to newly integrated vendors in the CTC system. Identified root causes in the integration layer and implemented a complete fix, improving vendor onboarding success and trip assignment reliability by 85%.
- Resolved a UAT issue in the dispatch module where Twilio was sending duplicate SMS messages to multiple clients. Implemented a temporary fix and documented steps to eliminate related tech debt in legacy code, improving communication reliability by 70%.
- Debugged a critical production database issue where patient-scheduled trips were being unassigned due to invalid phone numbers, directly impacting the Lyft ride request table. Conducted root cause analysis and coordinated with vendors and patients for resolution, reducing trip scheduling failures by 70% and improving overall ride assignment reliability by 55%.
- Optimized trip self-assignment functionality for subcontractors/vendors by replacing SignalR polling with action-based events, enabling real-time trip updates and handling all edge cases in our ASP.NET MVC architecture. This reduced server load by 45% and improved trip assignment visibility for users by 60%.
- Resolved a critical vulnerability reported by the pentesting team that allowed authenticated users to access OIDC client details of other accounts by manipulating identifiers. Implemented strict authorization checks in Neo4j schema types, limiting access based on user ownership and improving platform security by over 85%.
- Improved security of the identity provider platform by resolving a critical vulnerability where client secrets of relying parties were exposed in plaintext responses. Secured sensitive data to prevent unauthorized access, reducing potential security risks by 90% and strengthening platform compliance with security best practices.
- Investigated false-positive alerts in the auto-assigner where reservations were reported as assigned to inactive vendors. Conducted detailed analysis of affected trips, documented findings, and collaborated with clients to validate system behavior, reducing unnecessary escalations by 60% and improving client confidence by 45%.
- Implemented a Cognitive Impairment tag for members to enforce safety rules, blocking rideshare assignments without an escort as per client requirements. Delivered as a production hotfix after thorough end-to-end testing with the SQC team, ensuring 100% compliance with safety policies and reducing invalid assignments by 65%.
- Resolved a critical UAT environment issue affecting a feature required for a weekly client demo. Collaborated with the DevOps team to identify the root cause and restore impacted servers, reducing downtime by 80% and ensuring successful demo delivery within deadlines.
- Resolved a critical Kafka producer issue in the UAT environment where messages for newly created reservations were not being published, blocking the dispatch workflow during a client demo. Identified the root cause, restored functionality, and updated owner account permissions in coordination with the DBA team, reducing testing downtime by 75% and ensuring successful demo execution.
- Implemented a rideshare blocker feature to prevent the auto-assigner from allocating reservations to rideshare vendors when explicitly restricted by CSR agents in production. This enhancement reduced incorrect rideshare assignments by 70% and improved operational control and compliance with client requirements.
- Collaborated with the Support team to resolve a critical client request involving duplicate subcontractors mistakenly added by CSR agents. Identified the absence of a delete-subcontractor workflow and performed a safe production cleanup after backing up data, reducing duplicate assignment issues by 80% and restoring data accuracy for operational teams.
- Implemented a client-requested enhancement to prioritize member-preferred vendors for trip assignments, even when vendors were not configured for the pickup zip code. This improved member satisfaction by 40%, increased preferred vendor utilization by 55%, and reduced manual assignment overrides by 50%.
- Resolved critical level-of-service architecture issues that were impacting the revamped auto-assignment system. Refactored assignment logic and addressed underlying workflow inconsistencies, resulting in a 45% increase in successful subcontractor trip assignments and improved overall auto-assignment reliability and scalability.
- Investigated and resolved trip processing delays within the auto-assignment workflow by identifying database-side wait times and query bottlenecks affecting reservation processing. Optimized centralized queries and eliminated unnecessary database round trips, reducing processing latency by 20% and improving overall auto-assignment throughput by 30%.
- Implemented an urgent client-requested enhancement to prevent reservations in low-coverage ZIP codes from being assigned to Lyft/Uber, reducing ride cancellations caused by limited service availability. Updated the auto-assignment logic to prioritize suitable transportation vendors, increasing trip completion rates by 35% and reducing failed rideshare assignments by 65%.
- Collaborated with the Support team to analyze the utilization of the subcontractors table within the application UI. Gathered and documented relevant data, providing technical clarity that reduced investigation time by 50% and accelerated issue resolution for support teams.
- Analyzed and resolved a critical flaw in the legacy Auto-Assigner workflow, collaborating with the client to validate the proposed solution before implementation. Delivered the fix across all health plans, coordinated the production release with the DevOps team, and performed post-deployment maintenance, improving assignment accuracy by 60% and reducing production incidents by 50%.
- Implemented a client-requested change in the Auto-Assigner component to automatically convert scheduled trips to Will Call trips for a specific health plan when Lyft or Uber was selected as the transportation vendor. Collaborated with the team lead on solution design, improving business rule compliance by 100% and reducing manual trip modifications by 60%.
- Led major enhancements to the Auto-Assigner engine by implementing real-time vendor capacity tracking instead of relying on stale assignment data, significantly improving assignment accuracy for concurrent trips. Also introduced health plan-specific prioritization of Lyft/Uber based on client policies, improving trip allocation accuracy by 65%, reducing reassignment conflicts by 50%, and increasing rideshare utilization across eligible reservations.

### Technologies Used

- Node.js
- TypeScript
- SQL Server
- PostgreSQL
- Queue-based Systems
- Microservices
- gRPC
- AWS
- Git

---

## Company

### Company Name

Compliance Innovation

### Website

https://complianceinnovation.ai/

### Position

Software Engineer

### Employment Type

Full Time

### Location

India (Remote)

### Start Date

July 2024

### End Date

July 2025

### Summary

Developed fintech and compliance solutions from the ground up, including cloud deployment, authentication, document processing, and e-signature workflows.

### Responsibilities

- Built backend services and platform features for compliance applications.
- Deployed production applications on virtual machines with custom domains.
- Integrated third-party APIs for authentication and document processing.
- Improved reliability of document upload and e-signature workflows.

### Major Achievements

- Debugged a critical issue where OIDC client details of relying parties were unintentionally deleted from the database, blocking end-user onboarding for clients. Collaborated with DevOps to remediate the issue and upgraded the database cluster, reducing recurrence risk by 80% and restoring full client onboarding functionality.
- Replaced inefficient polling with GraphQL subscriptions in the login flow, resolving a critical scalability issue. This optimization improved backend performance and reduced server load by 45%, enabling real-time updates and a smoother user login experience.
- Implemented rotating QR code functionality to enable secure and seamless verifiable credential generation during end-user onboarding. This enhanced cross-device onboarding efficiency and reduced credential setup failures by 40%, improving user experience and client satisfaction.
- Resolved a critical OAuth session issue in the OIDC flow that blocked end users from signing up with the relying party using their OnyxPlus account. The fix enabled successful session creation and accurate user detail retrieval, improving signup success rates by 85% and ensuring smooth client onboarding.
- Deployed a hotfix on the production database to resolve an issue where public legacy projects were not visible to end users during the OIDC flow with the relying party. This fix restored 100% project visibility, enabling seamless user onboarding and ensuring a successful client demonstration.
- Integrated OnyxPlus SSO into the Simplici (B2B) platform, enabling seamless customer signup/sign-in similar to Google and LinkedIn authentication. This improved user onboarding experience by 60% and reduced login-related support requests by 40%.
- Strengthened Neo4j database security by implementing missing authentication and authorization directives, restricting unauthorized access and enforcing role-based permissions for onboarded users. Thoroughly tested the platform across multiple devices to ensure stability, enabling a 100% issue-free client demo and improving data access control by 80%.
- Resolved a critical bug in the OIDC flow where relying party project details failed to load post user authentication. Fixed GraphQL OGM projection issues by explicitly marking required fields, enabling accurate data retrieval. The fix also resolved multiple related OIDC bugs, improving flow stability by 60% and enabling a successful demo presentation to senior management.
- Implemented role-based authorization for all database types to restrict access to private data exclusively to admin users. This enhanced data security and reduced unauthorized access risks by 70%."
- Fixed a critical production bug in the OIDC flow that prevented end users from completing verifiable presentation requests after redirection from relying parties. Post-fix, project and client details were correctly retrieved, improving user verification success rate by 40% and reducing authentication failures by 50%.
- Resolved a critical bug in our developer application that impacted relying parties during client credential creation. Ensured correct generation of verifiable presentation definitions with appropriate scopes, improving developer onboarding success rate by 45% and reducing credential issuance errors by 60%.
- Implemented verifiable credentials presentation functionality in our authorization platform using the Indicio Proven library. This enabled secure credential generation for end-user authorization by relying parties, strengthening authentication security by 60% and improving compliance with industry standards.
- Resolved a critical OAuth bug that repeatedly prompted end users to grant permissions for the same relying party. Implemented end-to-end fixes across frontend and backend, covering all edge cases before production deployment. This improved authentication flow efficiency by 40% and enhanced user experience for clients.
- Resolved a critical CORS-related bug that was disrupting the onboarding functionality for our relying party. Deployed a hotfix to production, ensuring a seamless onboarding process and successfully facilitating a key client demo, improving platform reliability by 35%
- Enhanced user experience on the authentication platform by fixing error messages during signup and login processes. This improvement reduced user confusion by 40% and increased successful login and signup rates by 25%, strengthening overall platform usability and client satisfaction.
- Increased the e-signature module document upload limit to 25 MB and resolved AWS SES attachment limit issues, fulfilling client requests and strengthening their trust in our platform.
- Optimized the Pipelines microservice backend with decoupled, scalable modules and request time limits, boosting performance by 40% and enhancing reliability
- Mitigated KYC document expiration issues with an automated check, reducing manual intervention by 75% and improving client satisfaction through timely compliance updates.
- Resolved critical e-signature issues for client accreditation, delivering a production fix that reduced downtime by 50% and ensured stability.
- Enhanced security with PDF sanitization and CSP headers to prevent XSS attacks, reducing vulnerabilities by 90% and boosting client trust.
- Implemented token-based authentication with unique nonces in the e-signature module, preventing URL manipulation and reducing unauthorized access attempts by 60%.
- Increased document upload limit in e-signature module to 25 MB and resolved AWS SES attachment restrictions, raising document submission success by 50%.
- Secured document access with end-to-end authentication, eliminating vulnerabilities and improving data security by 85%, reinforcing trust.
- Implemented the Google APIs package for converting document types uploaded in the e-signature module, enabling seamless conversion of DOCX to PDF without affecting text formatting. This fix resolved a critical client-reported bug, improving document conversion accuracy by 90% and enhancing client satisfaction.

### Technologies Used

- Node.js
- TypeScript
- PostgreSQL
- MongoDB
- Google APIs
- REST APIs
- Docker
- Git

---

## Company

### Company Name

Kampd

### Website

https://www.kampd.com/

### Position

Software Engineer

### Employment Type

Full Time

### Location

India

### Start Date

November 2021

### End Date

July 2024

### Summary

Worked on scalable backend services, real-time messaging, and performance optimization for a customer engagement platform.

### Responsibilities

- Developed backend APIs and microservices.
- Built real-time notification systems.
- Improved service communication and system performance.
- Integrated cloud messaging services.

### Major Achievements

- Migrated services by replacing Kafka with gRPC for read requests, reducing latency by 70% and improving client request processing efficiency. The integration of gRPC further enhanced service performance, achieving an additional 30% reduction in overall latency.
- Enhanced Twilio messaging feature on the platform, mitigating malicious attacks by restricting permissions on the authentication token. Reimplemented the feature using API keys and secrets, improving security and reducing unauthorized access attempts by 80%
- Implemented push notifications using Firebase Cloud Messaging, enhancing real-time user engagement by 25% and improving interaction rates.
- Developed log aggregation and observability mechanisms within backend services, achieving a 3x productivity boost in debugging efficiency.
- Optimized MongoDB triggers, yielding a 15% improvement in database operations and enhancing overall platform performance.
- Integrated OpenTelemetry and Zipkin for comprehensive application monitoring, enabling 30% faster identification and resolution of issues.
- Collaborated with the Data team to implement a soft delete module, ensuring user data privacy compliance and secure retention of sensitive data.
- Designed and launched a like/dislike feature, resulting in a 15% increase in user engagement and enhancing content personalization.
- Migrated services to reduce Kafka latency by 70%, significantly improving client request processing efficiency.
- Integrated gRPC technology, reducing service latency by 30% and enhancing overall performance.

### Technologies Used

- Node.js
- TypeScript
- MongoDB
- PostgreSQL
- Kafka
- gRPC
- Firebase Cloud Messaging (FCM)
- AWS
- Git

---

# Projects

Repeat for every project.

---

## Project

### Name

### Category

- Personal
- Professional
- Open Source
- Freelance

### Description

### Features

- Feature 1
- Feature 2
- Feature 3

### Technologies

- React
- Node.js
- MongoDB
- Docker

### Architecture

Describe the architecture if applicable.

### Challenges

### Learnings

### GitHub

### Live Demo

### Images

### Status

- Completed
- Ongoing

---

# Skills

## Programming Languages

- JavaScript
- TypeScript
- Python
- Golang
- SQL

---

## Frontend

- React
- Next.js
- HTML5
- CSS3
- Tailwind CSS

---

## Backend Technologies

- Node.js
- Express.js
- NestJS
- FastAPI
- REST APIs
- GraphQL
- gRPC
- Microservices
- Event-Driven Architecture

---

## Databases

- PostgreSQL
- MongoDB
- SQL Server
- Neo4j
- Redis

---

## Cloud & DevOps

- AWS (EC2, S3, Lambda)
- Docker
- Kubernetes
- CI/CD
- GitHub Actions

---

## Messaging & Background Processing

- Apache Kafka
- Queue-based Systems
- Background Jobs
- Celery

---

## Observability & Monitoring

- OpenTelemetry
- Grafana
- Jaeger
- Zipkin

---

## Integrations

- Twilio
- Firebase Cloud Messaging (FCM)
- AWS SES
- OAuth 2.0 / OIDC

---

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- Jira

---

## Software Engineering

- System Design
- Distributed Systems
- API Design
- Performance Optimization
- Scalability
- Clean Architecture
- Design Patterns

---

## Soft Skills

- Leadership
- Problem Solving
- Communication
- Team Collaboration
- Mentoring
- Agile Development

---

# Education

---

## Degree

A.K.T.U. University, Lucknow, U.P

### Degree Name

Bachelor of Technology

### Branch

Computer Science and Engineering

### Start Year

2018

### End Year

2022

### CGPA / Percentage

8.76
---

# Certificates

Repeat for each certificate.

---

## Certificate

### Name

The Complete Web Developer Masterclass: Beginner To Advanced

### Issuing Organization

UDEMY

### Issue Date

Oct 2021

### Credential ID

### Credential URL

https://www.udemy.com/certificate/UC-f8b33eb8-07c1-4848-844e-c9655ca16391/

### Skills Covered

HTML, CSS, JAVASCRIPT, REACTJS, NODEJS

### Name

Everyday AI Concepts

### Issuing Organization

LINKEDIN LEARNING

### Issue Date

May 2026

### Credential ID

### Credential URL

https://www.linkedin.com/learning/certificates/34d91152eca10d4ee05592004cf5a042b8ac0b05530de42422e9e51456b5ff7e?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_certifications_details%3BEzoQol7FR06dz3dxm5bHYg%3D%3D

### Skills Covered

AI, AGI, RAG

### Name

Introduction to Cloud Computing on AWS for Beginners [2026]

### Issuing Organization

Udemy

### Issue Date

Apr 2026

### Credential ID

### Credential URL

https://www.udemy.com/certificate/UC-b6501459-8015-42a0-aa85-474dc00dcadf/

### Skills Covered

CLOUD, AWS, S3, IAM
---

# Social Links

| Platform       | URL                                                     |
| -------------- | ------------------------------------------------------- |
| GitHub         | https://github.com/yashrsb                              |
| LinkedIn       | https://www.linkedin.com/in/yash-raj-singh-b-2b229a198/ |
| Portfolio      |                                                         |
| LeetCode       | https://leetcode.com/u/YRaj001/                         |
| HackerRank     |                                                         |
| CodeChef       |                                                         |
| Codeforces     |                                                         |
| Stack Overflow |                                                         |
| Medium         |                                                         |
| Dev.to         |                                                         |
| Twitter/X      |                                                         |
| Instagram      |                                                         |
| YouTube        |                                                         |

---

# Resume

## Resume Information

| Field            | Value |
| ---------------- | ----- |
| Resume File Name |       |
| Resume URL       |       |
| Last Updated     |       |
| Version          |       |

---

# SEO

## Meta Title

## Meta Description

## Keywords

Comma-separated keywords.

Example:

```
Full Stack Developer, Node.js, React, TypeScript, AWS, PostgreSQL
```

## Canonical URL

## Open Graph Image

## Twitter Card Image

## Robots

```
index, follow
```

---

# Contact Information

## Contact Details

| Field     | Value                   |
| --------- | ----------------------- |
| Email     | yrajsingh0001@gmail.com |
| Phone     | +91-9278557002          |
| WhatsApp  |                         |
| Location  | Delhi                   |
| Time Zone |                         |

## Contact Form

Recipient Email:

Preferred Subject Prefix:

Auto Reply Message:

## Availability

- Open to Full-Time
- Open to Freelance
- Open to Consulting
- Open Source Collaboration
- Speaking Opportunities

## Preferred Contact Method

- Email
- LinkedIn
- WhatsApp

---

# References (Optional)

## Reference

### Name

### Designation

### Company

### Email

### Phone

### Relationship

---

# Notes

Use this section for any additional information that may be useful for generating portfolio content, resumes, blogs, or future updates.
