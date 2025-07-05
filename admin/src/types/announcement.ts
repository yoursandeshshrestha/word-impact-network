export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: {
    id: string;
    fullName: string;
  };
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
