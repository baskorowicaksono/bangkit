import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Activity, TypeLocation } from '../interfaces/activity.interface';
import { nanoid } from 'nanoid';
import UserEntity from './user.entity';

@Entity()
class ActivityEntity implements Activity {
  constructor(id = nanoid(32), activity_name: string, location: TypeLocation, description: string, background_img: string) {
    this.id = id;
    this.activity_name = activity_name;
    this.location = location;
    this.description = description;
    this.background_img = background_img;
  }

  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  activity_name: string;

  @Column({
    type: 'varchar',
    length: 12,
    nullable: false,
  })
  location: TypeLocation;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  background_img: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => UserEntity, user => user.activities)
  @JoinTable({
    name: 'user_activities_entity',
    joinColumn: {
      name: 'activities',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
  })
  users: UserEntity[];
}

export default ActivityEntity;
