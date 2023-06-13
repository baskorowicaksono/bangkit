import UserEntity from '@/entity/user.entity';

export enum TypeLocation {
  KEPULAUAN_SERIBU = 'Kepulauan Seribu',
  JAKARTA_BARAT = 'Jakarta Barat',
  JAKARTA_PUSAT = 'Jakarta Pusat',
  JAKARTA_SELATAN = 'Jakarta Selatan',
  JAKARTA_TIMUR = 'Jakarta Timur',
  JAKARTA_UTARA = 'Jakarta Utara',
  YOGYAKARTA = 'Yogyakarta',
  BANTUL = 'Bantul',
  GUNUNGKIDUL = 'Gunungkidul',
  KULON_PROGO = 'Kulon Progo',
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
