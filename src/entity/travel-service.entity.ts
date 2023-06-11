import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TypeLocation } from '../interfaces/activity.interface';
import { nanoid } from 'nanoid';
import { TravelService } from '@/interfaces/travel-service.interface';

@Entity()
class TravelServiceEntity implements TravelService {
  constructor(
    id = nanoid(32),
    service_name: string,
    location: TypeLocation,
    description: string,
    service_provider: string,
    service_price: number,
    gmap_link: string,
    background_img: string,
    image_gallery: string[],
    contact_number: string,
  ) {
    this.id = id;
    this.service_name = service_name;
    this.location = location;
    this.description = description;
    this.service_provider = service_provider;
    this.service_price = service_price;
    this.gmap_link = gmap_link;
    this.background_img = background_img;
    this.image_gallery = image_gallery;
    this.contact_number = contact_number;
  }

  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  service_name: string;

  @Column({
    type: 'varchar',
    length: 12,
    nullable: false,
  })
  location: TypeLocation;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ nullable: false })
  service_provider: string;

  @Column({ nullable: false })
  service_price: number;

  @Column({ nullable: false })
  gmap_link: string;

  @Column({ nullable: false })
  background_img: string;

  @Column('simple-array', { nullable: false })
  image_gallery: string[];

  @Column({ nullable: false })
  contact_number: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;
}

export default TravelServiceEntity;
