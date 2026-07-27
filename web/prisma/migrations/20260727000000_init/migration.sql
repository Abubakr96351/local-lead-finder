-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "email" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "screenshotPath" TEXT,
    "lastFetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteSignal" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "reachable" BOOLEAN NOT NULL,
    "httpStatus" INTEGER,
    "usesHttps" BOOLEAN NOT NULL,
    "hasViewportMeta" BOOLEAN NOT NULL,
    "copyrightYear" INTEGER,
    "likelyBotBlocked" BOOLEAN NOT NULL,
    "opportunityScore" INTEGER NOT NULL,
    "opportunityLabel" TEXT NOT NULL,
    "flags" TEXT NOT NULL,
    "suggestedOpener" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Search" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "placesApiRequests" INTEGER NOT NULL,
    "estCostUsd" DOUBLE PRECISION NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachTemplate" (
    "id" TEXT NOT NULL,
    "opportunityType" TEXT NOT NULL,
    "scriptText" TEXT NOT NULL,

    CONSTRAINT "OutreachTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Radar" (
    "id" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'United States',
    "maxLeadsPerScan" INTEGER NOT NULL DEFAULT 25,
    "cadence" TEXT NOT NULL DEFAULT 'weekly',
    "notificationEmail" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "nextCityIndex" INTEGER NOT NULL DEFAULT 0,
    "lastScanAt" TIMESTAMP(3),
    "lastScanNewCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Radar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_placeId_key" ON "Business"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteSignal_businessId_key" ON "WebsiteSignal"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchResult_searchId_businessId_key" ON "SearchResult"("searchId", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_businessId_key" ON "Prospect"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachTemplate_opportunityType_key" ON "OutreachTemplate"("opportunityType");

-- AddForeignKey
ALTER TABLE "WebsiteSignal" ADD CONSTRAINT "WebsiteSignal_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "Search"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

