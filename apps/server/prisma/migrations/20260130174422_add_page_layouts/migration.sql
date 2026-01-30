-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "brandName" TEXT NOT NULL,
    "brandDescription" TEXT,
    "amazonTrackingId" TEXT NOT NULL,
    "amazonMarketplace" TEXT NOT NULL DEFAULT 'amazon.com',
    "brandColors" TEXT NOT NULL DEFAULT '{"primary":"#2563eb","secondary":"#1e40af","accent":"#f59e0b"}',
    "template" TEXT NOT NULL DEFAULT 'modern',
    "selectedBlocks" TEXT NOT NULL DEFAULT '[]',
    "selectedPages" TEXT NOT NULL DEFAULT '["home","products","about"]',
    "pageLayouts" TEXT NOT NULL DEFAULT '{}',
    "languages" TEXT NOT NULL DEFAULT '["en"]',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "assetsConfig" TEXT NOT NULL DEFAULT '{"generateLogo":true,"generateFavicon":true,"generateOgImage":true}',
    "htaccessConfig" TEXT NOT NULL DEFAULT '{"enableGzip":true,"enableCaching":true,"forceHttps":true,"wwwRedirect":"none"}',
    "notes" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastGeneratedAt" DATETIME,
    "generationCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "registrarProvider" TEXT,
    "registrationDate" DATETIME,
    "expirationDate" DATETIME,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "dnsProvider" TEXT,
    "dnsConfigured" BOOLEAN NOT NULL DEFAULT false,
    "nameservers" TEXT,
    "sslEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sslProvider" TEXT,
    "sslExpiresAt" DATETIME,
    "cdnEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cdnProvider" TEXT,
    "cdnZoneId" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "verificationToken" TEXT,
    "lastCheckedAt" DATETIME,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Domain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asin" TEXT NOT NULL,
    "title" TEXT,
    "customTitle" TEXT,
    "customDescription" TEXT,
    "imageUrl" TEXT,
    "generateImage" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "generatedTitle" TEXT,
    "generatedDescription" TEXT,
    "generatedImagePath" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CTA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "linkType" TEXT NOT NULL DEFAULT 'product',
    "productId" TEXT,
    "customUrl" TEXT,
    "amazonSearchQuery" TEXT,
    "amazonNode" TEXT,
    "style" TEXT NOT NULL DEFAULT 'primary',
    "size" TEXT NOT NULL DEFAULT 'md',
    "icon" TEXT,
    "placement" TEXT NOT NULL,
    "blockId" TEXT,
    "translations" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CTA_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CTATemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "style" TEXT NOT NULL DEFAULT 'primary',
    "size" TEXT NOT NULL DEFAULT 'md',
    "icon" TEXT,
    "placement" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" INTEGER NOT NULL,
    "zipPath" TEXT NOT NULL,
    "zipSize" INTEGER,
    "settingsSnapshot" TEXT NOT NULL,
    "pagesGenerated" INTEGER NOT NULL,
    "imagesGenerated" INTEGER NOT NULL,
    "totalFiles" INTEGER NOT NULL,
    "generationTimeMs" INTEGER,
    "aiProvider" TEXT NOT NULL DEFAULT '{"text":"openai","images":"dalle"}',
    "estimatedCost" REAL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "errorLog" TEXT,
    "generationLog" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Generation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HostingProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestedAt" DATETIME,
    "lastTestResult" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationId" TEXT,
    "version" INTEGER NOT NULL,
    "providerId" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "deployedUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "filesUploaded" INTEGER NOT NULL DEFAULT 0,
    "totalFiles" INTEGER NOT NULL DEFAULT 0,
    "deploymentLog" TEXT,
    "errorMessage" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deployment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "HostingProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deployment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CDNProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "accountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DomainRegistrar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "accountId" TEXT,
    "accountEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTestedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "openaiApiKey" TEXT,
    "geminiApiKey" TEXT,
    "defaultTextProvider" TEXT NOT NULL DEFAULT 'openai',
    "defaultImageProvider" TEXT NOT NULL DEFAULT 'dalle',
    "defaultProjectSettings" TEXT,
    "outputDirectory" TEXT NOT NULL DEFAULT './output',
    "keepVersions" INTEGER NOT NULL DEFAULT 5,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Domain_domain_idx" ON "Domain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_projectId_domain_key" ON "Domain"("projectId", "domain");

-- CreateIndex
CREATE INDEX "Product_projectId_idx" ON "Product"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_projectId_asin_key" ON "Product"("projectId", "asin");

-- CreateIndex
CREATE INDEX "CTA_projectId_idx" ON "CTA"("projectId");

-- CreateIndex
CREATE INDEX "CTA_placement_idx" ON "CTA"("placement");

-- CreateIndex
CREATE INDEX "Generation_projectId_idx" ON "Generation"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Generation_projectId_version_key" ON "Generation"("projectId", "version");

-- CreateIndex
CREATE INDEX "Deployment_projectId_idx" ON "Deployment"("projectId");

-- CreateIndex
CREATE INDEX "Deployment_status_idx" ON "Deployment"("status");
