-- CreateTable
CREATE TABLE "announcement_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "announcementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_files" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_videos" (
    "id" TEXT NOT NULL,
    "vimeoId" TEXT NOT NULL,
    "vimeoUrl" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "duration" INTEGER,
    "announcementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_videos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "announcement_images" ADD CONSTRAINT "announcement_images_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_files" ADD CONSTRAINT "announcement_files_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_videos" ADD CONSTRAINT "announcement_videos_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
