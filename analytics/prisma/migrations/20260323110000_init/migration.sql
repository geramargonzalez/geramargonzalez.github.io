CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "page_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "ipHash" VARCHAR(64) NOT NULL,
    "uaHash" VARCHAR(64),
    "isBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt");
CREATE INDEX "page_views_ipHash_idx" ON "page_views"("ipHash");
CREATE INDEX "page_views_path_idx" ON "page_views"("path");