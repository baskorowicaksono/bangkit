import { TypeLocation } from './activity.interface';

export interface TravelService extends TravelServiceRequest {
  id: string;
}

export interface TravelServiceRequest {
  service_name: string;
  location: TypeLocation;
  description: string;
  service_provider: string;
  service_price: number;
  gmap_link: string;
  background_img: string;
  image_gallery: string[];
  contact_number: string;
}
