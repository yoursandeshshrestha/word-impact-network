export interface StudentProfileUpdateData {
  fullName?: string;
  phoneNumber?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  academicQualification?: string;
  profilePictureUrl?: string;
}
