export enum TypeLocation {
  Jakarta = 'jakarta',
  Yogyakarta = 'yogyakarta',
}

export interface Activity {
  id: string;
  activity_name: string;
  location: TypeLocation;
  description?: string;
  background_img?: string;
}
