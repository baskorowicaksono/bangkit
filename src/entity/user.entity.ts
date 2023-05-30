import { User } from '@/interfaces/user.interface';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { nanoid } from 'nanoid';

@Entity()
class UserEntity implements User {
  constructor(id = nanoid(32), googleid: string, nama: string, email: string, password: string, picture_url: string, umur: string) {
    this.id = id;
    this.googleid = googleid;
    this.nama = nama;
    this.email = email;
    this.picture_url = picture_url;
  }

  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  googleid: string;

  @Column({ nullable: false })
  nama: string;

  @Column({ nullable: false, unique: true })
  email: string;

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
}

export default UserEntity;
