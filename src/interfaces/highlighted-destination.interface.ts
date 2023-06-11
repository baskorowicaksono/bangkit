import { TypeLocation } from './activity.interface';

export interface HighlightedDestination extends HighlightedDestinationRequest {
  id: string;
}

export interface HighlightedDestinationRequest {
  destination_name: string;
  location: TypeLocation;
  description: string;
  gmap_link: string;
  background_img: string;
  image_gallery: string[];
  activity: string[];
  contact_number: string;
}
