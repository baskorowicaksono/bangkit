import UserEntity from '@/entity/user.entity';

export enum TypeLocation {
  Jakarta = 'jakarta',
  Yogyakarta = 'yogyakarta',
}

export interface Activity extends ActivityRequest {
  id: string;
}

export interface ActivityRequest {
  activity_name: string;
  location: TypeLocation;
  description?: string;
  background_img?: string;
  users?: UserEntity[];
}
