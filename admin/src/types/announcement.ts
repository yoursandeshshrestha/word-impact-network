export interface AnnouncementImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface AnnouncementFile {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export interface AnnouncementVideo {
  id: string;
  vimeoId: string;
  embedUrl: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string; // Legacy field for backward compatibility
  isActive: boolean;
  createdBy: {
    id: string;
    fullName: string;
  };
  images: AnnouncementImage[];
  files: AnnouncementFile[];
  videos: AnnouncementVideo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface UpdateAnnouncementData {
  title: string;
  content: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
