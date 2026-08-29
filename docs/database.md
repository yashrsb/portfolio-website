# Database

This document describes the PostgreSQL + Prisma database architecture for the Portfolio project.

## Overview

| Component | Technology | Version |
|-----------|------------|---------|
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 7.x |
| Migrations | Prisma Migrate | - |
| Seeding | Custom seed script | - |

## Entity Relationship Diagram

```mermaid
erDiagram
    Profile {
        String id PK
        String name
        String headline
        String tagline
        String bio
        String[] interests
        String[] goals
        String[] strengths
        Json stats
        Json contact
        String resumeUrl
    }

    Project {
        String id PK
        String slug UK
        String title
        String description
        String summary
        String imageUrl
        String githubUrl
        String demoUrl
        ProjectStatus status
        Boolean featured
        Int displayOrder
        String[] tags
        Json techStack
        String[] features
        String[] challenges
        String[] lessonsLearned
        String architecture
        Json screenshots
    }

    Experience {
        String id PK
        String company
        String role
        DateTime startDate
        DateTime endDate
        Boolean current
        String location
        String description
        String[] technologies
        String[] responsibilities
        String[] achievements
        Int displayOrder
    }

    Skill {
        String id PK
        String name
        SkillCategory category
        Int proficiency
        String icon
        Int displayOrder
    }

    Education {
        String id PK
        String institution
        String degree
        String fieldOfStudy
        Int startYear
        Int endYear
        String grade
        String[] highlights
        Int displayOrder
    }

    Certificate {
        String id PK
        String name
        String issuer
        DateTime date
        String url
        Int displayOrder
    }

    Achievement {
        String id PK
        String title
        String organization
        Int year
        String description
        Int displayOrder
    }

    SocialLink {
        String id PK
        String platform UK
        String url
        String icon
        Int displayOrder
    }

    ContactMessage {
        String id PK
        String name
        String email
        String subject
        String message
        ContactMessageStatus status
        String ipAddress
        String userAgent
        ContactEmailStatus emailStatus
        DateTime emailSentAt
        String emailError
    }

    User {
        String id PK
        String name
        String email UK
        String passwordHash
        UserRole role
        Boolean isActive
        DateTime lastLoginAt
    }

    RefreshToken {
        String id PK
        String tokenHash UK
        String userId FK
        DateTime expiresAt
        DateTime revokedAt
        String replacedBy
    }

    ResumeFile {
        String id PK
        String filename
        String originalName
        String mimeType
        Int size
        String storageKey UK
        String storagePath
        String storedName
        String url
    }

    BlogPost {
        String id PK
        String slug UK
        String title
        String excerpt
        String content
        String coverImage
        BlogPostStatus status
        DateTime publishedAt
        String author
        Boolean featured
        String seoTitle
        String seoDescription
        String canonicalUrl
        String categoryId FK
    }

    BlogCategory {
        String id PK
        String slug UK
        String name
        String description
    }

    BlogTag {
        String id PK
        String slug UK
        String name
    }

    BlogPostTag {
        String postId FK
        String tagId FK
    }

    AnalyticsEvent {
        String id PK
        AnalyticsEventType eventType
        String path
        String projectId FK
        String blogPostId FK
        String visitorHash
        String country
        DeviceType deviceType
        BrowserType browser
        OperatingSystem os
        String referrer
        Json metadata
    }

    BlogPost ||--|| BlogCategory : category
    BlogPost }o--o{ BlogTag : tags
    BlogPostTag }o--|| BlogPost : post
    BlogPostTag }o--|| BlogTag : tag
    RefreshToken }o--|| User : user
    AnalyticsEvent }o--o| Project : project
    AnalyticsEvent }o--o| BlogPost : blogPost
```

## Models

### Profile

Stores the single portfolio profile information.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| name | String | No | Full name |
| headline | String | Yes | Professional headline |
| tagline | String | Yes | Short tagline |
| bio | String | Yes | Biography text |
| interests | String[] | No | List of interests |
| goals | String[] | No | List of goals |
| strengths | String[] | No | List of strengths |
| stats | Json | Yes | Profile statistics |
| contact | Json | Yes | Contact information |
| resumeUrl | String | Yes | URL to latest resume |

### Project

Stores portfolio projects with extended showcase fields.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| slug | String | No | Unique URL-friendly identifier |
| title | String | No | Project title |
| description | String | No | Detailed description |
| summary | String | Yes | Short summary |
| imageUrl | String | Yes | Project image URL |
| githubUrl | String | Yes | GitHub repository URL |
| demoUrl | String | Yes | Live demo URL |
| status | ProjectStatus | No | live, wip, archived |
| featured | Boolean | No | Featured flag |
| displayOrder | Int | No | Sort order |
| tags | String[] | No | Technology tags |
| techStack | Json | Yes | Grouped tech stack |
| features | String[] | No | Key features |
| challenges | String[] | No | Engineering challenges |
| lessonsLearned | String[] | No | Engineering takeaways |
| architecture | String | Yes | Architecture description |
| screenshots | Json | Yes | Array of screenshot objects |

### Experience

Stores work experience entries.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| company | String | No | Company name |
| role | String | No | Job title |
| startDate | DateTime | No | Start date |
| endDate | DateTime | Yes | End date |
| current | Boolean | No | Current position flag |
| location | String | Yes | Location |
| description | String | Yes | Role description |
| technologies | String[] | No | Technologies used |
| responsibilities | String[] | No | Key responsibilities |
| achievements | String[] | No | Achievements |
| displayOrder | Int | No | Sort order |

### Skill

Stores skills with categorization.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| name | String | No | Skill name |
| category | SkillCategory | No | Category enum |
| proficiency | Int | Yes | Proficiency level (1-100) |
| icon | String | Yes | Icon identifier |
| displayOrder | Int | No | Sort order |

**SkillCategory Enum:** languages, frontend, backend, databases, cloud, tools

### Education

Stores education entries.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| institution | String | No | Institution name |
| degree | String | No | Degree title |
| fieldOfStudy | String | Yes | Field of study |
| startYear | Int | No | Start year |
| endYear | Int | Yes | End year |
| grade | String | Yes | Grade/GPA |
| highlights | String[] | No | Highlights |
| displayOrder | Int | No | Sort order |

### Certificate

Stores certificates.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| name | String | No | Certificate name |
| issuer | String | No | Issuing organization |
| date | DateTime | Yes | Issue date |
| url | String | Yes | Certificate URL |
| displayOrder | Int | No | Sort order |

### Achievement

Stores achievements.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| title | String | No | Achievement title |
| organization | String | Yes | Organization |
| year | Int | Yes | Year |
| description | String | Yes | Description |
| displayOrder | Int | No | Sort order |

### SocialLink

Stores social media links.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| platform | String | No | Unique platform name |
| url | String | No | Profile URL |
| icon | String | Yes | Icon identifier |
| displayOrder | Int | No | Sort order |

### ContactMessage

Stores contact form submissions.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| name | String | No | Sender name |
| email | String | No | Sender email |
| subject | String | Yes | Message subject |
| message | String | No | Message content |
| status | ContactMessageStatus | No | new, read, archived |
| ipAddress | String | Yes | Sender IP |
| userAgent | String | Yes | Sender user agent |
| emailStatus | ContactEmailStatus | No | Email notification status |
| emailSentAt | DateTime | Yes | Email sent timestamp |
| emailError | String | Yes | Email error message |

### User

Stores authentication users.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| name | String | No | User name |
| email | String | No | Unique email address |
| passwordHash | String | No | bcrypt password hash |
| role | UserRole | No | ADMIN, EDITOR |
| isActive | Boolean | No | Active flag |
| lastLoginAt | DateTime | Yes | Last login timestamp |

### RefreshToken

Stores refresh token hashes for rotation.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| tokenHash | String | No | SHA-256 hash of token |
| userId | String | No | Foreign key to User |
| expiresAt | DateTime | No | Expiration timestamp |
| revokedAt | DateTime | Yes | Revocation timestamp |
| replacedBy | String | Yes | Replacement token hash |

### ResumeFile

Stores resume file metadata.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| filename | String | No | Stored filename |
| originalName | String | Yes | Original filename |
| mimeType | String | No | MIME type |
| size | Int | No | File size in bytes |
| storageKey | String | No | Unique storage key |
| storagePath | String | Yes | Storage path |
| storedName | String | Yes | Stored file name |
| url | String | Yes | Public URL |

### BlogPost

Stores blog posts.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| slug | String | No | Unique URL slug |
| title | String | No | Post title |
| excerpt | String | Yes | Post excerpt |
| content | String | No | Markdown content |
| coverImage | String | Yes | Cover image URL |
| status | BlogPostStatus | No | DRAFT, PUBLISHED, ARCHIVED |
| publishedAt | DateTime | Yes | Publication date |
| author | String | Yes | Author name |
| featured | Boolean | No | Featured flag |
| seoTitle | String | Yes | SEO title |
| seoDescription | String | Yes | SEO description |
| canonicalUrl | String | Yes | Canonical URL |
| categoryId | String | Yes | Foreign key to BlogCategory |

### BlogCategory

Stores blog categories.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| slug | String | No | Unique URL slug |
| name | String | No | Category name |
| description | String | Yes | Category description |

### BlogTag

Stores blog tags.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| slug | String | No | Unique URL slug |
| name | String | No | Tag name |

### BlogPostTag

Many-to-many join table for posts and tags.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| postId | String | No | Foreign key to BlogPost |
| tagId | String | No | Foreign key to BlogTag |

### AnalyticsEvent

Stores analytics events.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String (UUID) | No | Primary key |
| eventType | AnalyticsEventType | No | Event type enum |
| path | String | Yes | Page path |
| projectId | String | Yes | Foreign key to Project |
| blogPostId | String | Yes | Foreign key to BlogPost |
| visitorHash | String | Yes | Hashed visitor identifier |
| country | String | Yes | Country code |
| deviceType | DeviceType | Yes | Device type enum |
| browser | BrowserType | Yes | Browser type enum |
| os | OperatingSystem | Yes | OS type enum |
| referrer | String | Yes | Referrer URL |
| metadata | Json | Yes | Additional metadata |

## Enums

### UserRole
- `ADMIN` — Full access
- `EDITOR` — Limited access

### ProjectStatus
- `live` — Active project
- `wip` — Work in progress
- `archived` — Archived project

### SkillCategory
- `languages`
- `frontend`
- `backend`
- `databases`
- `cloud`
- `tools`

### ContactMessageStatus
- `new` — Unread
- `read` — Read
- `archived` — Archived

### ContactEmailStatus
- `pending` — Not sent
- `sent` — Successfully sent
- `failed` — Send failed

### BlogPostStatus
- `DRAFT` — Not published
- `PUBLISHED` — Published
- `ARCHIVED` — Archived

### AnalyticsEventType
- `PAGE_VIEW`
- `PROJECT_VIEW`
- `PROJECT_CLICK`
- `BLOG_POST_VIEW`

### DeviceType
- `DESKTOP`
- `MOBILE`
- `TABLET`
- `UNKNOWN`

### BrowserType
- `CHROME`
- `FIREFOX`
- `SAFARI`
- `EDGE`
- `OPERA`
- `OTHER`
- `UNKNOWN`

### OperatingSystem
- `WINDOWS`
- `MACOS`
- `LINUX`
- `ANDROID`
- `IOS`
- `OTHER`
- `UNKNOWN`

## Migrations

### Development Workflow

```bash
# Create a new migration
npm run db:migrate

# Apply migrations
npm run db:migrate

# Reset database (development only)
npx prisma migrate reset
```

### Production Workflow

```bash
# Apply migrations in production
npm run db:migrate:deploy

# Validate schema
npx prisma validate
```

## Seeding

The seed script (`backend/prisma/seed.js`) creates:

1. Admin user with credentials from environment variables
2. Portfolio profile from YAML data
3. Projects, experience, skills, education, certificates, achievements, social links

```bash
# Run seed
npm run db:seed
```

## Indexes

Key indexes for performance:

| Table | Index | Fields |
|-------|-------|--------|
| Project | Unique | slug |
| BlogPost | Unique | slug |
| BlogCategory | Unique | slug |
| BlogTag | Unique | slug |
| User | Unique | email |
| SocialLink | Unique | platform |
| RefreshToken | Unique | tokenHash |
| ResumeFile | Unique | storageKey |
| BlogPostTag | Unique | postId, tagId |
| AnalyticsEvent | Composite | eventType, createdAt |

## Backup and Recovery

### Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## Environment Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |

Example:
```
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
```
