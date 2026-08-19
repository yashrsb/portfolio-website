-- Phase 13: Analytics infrastructure

-- Create enums
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'PROJECT_VIEW', 'PROJECT_CLICK', 'BLOG_POST_VIEW');

CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN');

CREATE TYPE "BrowserType" AS ENUM ('CHROME', 'FIREFOX', 'SAFARI', 'EDGE', 'OPERA', 'OTHER', 'UNKNOWN');

CREATE TYPE "OperatingSystem" AS ENUM ('WINDOWS', 'MACOS', 'LINUX', 'ANDROID', 'IOS', 'OTHER', 'UNKNOWN');

-- Create analytics events table
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "eventType" "AnalyticsEventType" NOT NULL,
    "path" TEXT NOT NULL,
    "projectId" TEXT,
    "blogPostId" TEXT,
    "visitorHash" TEXT NOT NULL,
    "country" TEXT,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "browser" "BrowserType" NOT NULL DEFAULT 'UNKNOWN',
    "os" "OperatingSystem" NOT NULL DEFAULT 'UNKNOWN',
    "referrer" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- Create indexes for query performance
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX "AnalyticsEvent_projectId_idx" ON "AnalyticsEvent"("projectId");
CREATE INDEX "AnalyticsEvent_blogPostId_idx" ON "AnalyticsEvent"("blogPostId");
CREATE INDEX "AnalyticsEvent_visitorHash_idx" ON "AnalyticsEvent"("visitorHash");
CREATE INDEX "AnalyticsEvent_country_idx" ON "AnalyticsEvent"("country");
CREATE INDEX "AnalyticsEvent_deviceType_idx" ON "AnalyticsEvent"("deviceType");
CREATE INDEX "AnalyticsEvent_browser_idx" ON "AnalyticsEvent"("browser");
CREATE INDEX "AnalyticsEvent_eventType_path_idx" ON "AnalyticsEvent"("eventType", "path");

-- Create foreign keys
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_analyticsEvents_fkey" FOREIGN KEY ("id") REFERENCES "AnalyticsEvent"("blogPostId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_analyticsEvents_fkey" FOREIGN KEY ("id") REFERENCES "AnalyticsEvent"("projectId") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create foreign key constraints for existing tables
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
