import { TypeGender, User } from '@/interfaces/user.interface';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { nanoid } from 'nanoid';
import ActivityEntity from './activity.entity';

@Entity()
class UserEntity implements User {
  constructor(
    id = nanoid(32),
    nama: string,
    email: string,
    password: string,
    gender: TypeGender,
    age: number,
    travel_preferences: string[],
    picture_url: string,
  ) {
    this.id = id;
    this.nama = nama;
    this.email = email;
    this.password = password;
    this.gender = gender;
    this.age = age;
    this.travel_preferences = travel_preferences;
    this.picture_url = picture_url;
  }

  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  nama: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, type: 'varchar', length: 12 })
  gender: TypeGender;

  @Column({ nullable: false })
  age: number;

  @Column('simple-array', { nullable: false })
  travel_preferences: string[];

  @Column({ nullable: true })
  picture_url: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => ActivityEntity, activity => activity.users)
  activities: ActivityEntity[];
}

export default UserEntity;
