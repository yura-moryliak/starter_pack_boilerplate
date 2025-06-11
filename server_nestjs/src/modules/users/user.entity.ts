import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export class UserDto {
  fullName: string;
  city: string;
  email: string;
  phoneNumber: string;
  password: string;
  refreshToken?: string;
}

export const USER_ENTITY_WITH_PASSWORD = [
  'id',
  'fullName',
  'city',
  'email',
  'phoneNumber',
  'googleId',
  'lang',
];

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ default: '', nullable: false })
  fullName: string;

  @Column({ default: '', nullable: false })
  city: string;

  @Column({ default: '', nullable: false, unique: true })
  email: string;

  @Column({ default: '', nullable: false, unique: true })
  phoneNumber: string;

  @Column({ default: '', nullable: false, unique: true })
  password: string;

  @Column({ default: '', nullable: true, unique: true })
  googleId: string;

  @Column({ default: '', nullable: false })
  lang: string;

  @Column({ default: '', nullable: false })
  refreshToken: string;

  @Column({ default: '', nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;
}
