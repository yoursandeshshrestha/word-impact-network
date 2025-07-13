export interface NewsImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface NewsVideo {
  id: string;
  vimeoId: string;
  vimeoUrl: string;
  embedUrl: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdBy: {
    id: string;
    fullName: string;
  };
  images: NewsImage[];
  videos: NewsVideo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsData {
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateNewsData {
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface NewsResponse {
  news: News[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
