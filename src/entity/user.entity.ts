import { User } from '@/interfaces/user.interface';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryColumn, Unique, UpdateDateColumn } from 'typeorm';
import { nanoid } from 'nanoid';

@Entity()
class UserEntity implements User {
  constructor(id = nanoid(32), nama: string, email: string, password: string, picture_url: string, umur: string) {
    this.id = id;
    this.nama = nama;
    this.email = email;
    this.password = password;
    this.picture_url = picture_url;
    this.umur = umur;
  }

  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  nama: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  picture_url: string;

  @Column({ nullable: false })
  umur: string;

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

export default UserEntity;
