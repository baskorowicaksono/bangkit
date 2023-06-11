import UserEntity from '@/entity/user.entity';

export enum TypeLocation {
  JAKARTA = 'Jakarta',
  YOGYAKARTA = 'Yogyakarta',
}

export interface Activity extends ActivityRequest {
  id: string;
}

export interface ActivityRequest {
  activity_name: string;
  location: TypeLocation;
  description: string;
  background_img: string;
  gmap_link: string;
  start_time: Date;
  end_time: Date;
  users?: UserEntity[];
}
