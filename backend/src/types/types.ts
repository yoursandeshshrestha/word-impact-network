export interface StudentProfileUpdateData {
  fullName?: string;
  phoneNumber?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  academicQualification?: string;
  profilePictureUrl?: string;
}

export interface NewsImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}

export interface NewsVideo {
  id: string;
  vimeoId: string;
  embedUrl: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  createdAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
