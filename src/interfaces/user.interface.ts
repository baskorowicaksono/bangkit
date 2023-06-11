export enum TypeGender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export interface User extends UserRequest {
  id: string;
}

export interface UserRequest {
  nama: string;
  email: string;
  password: string;
  gender: TypeGender;
  age: number;
  travel_preferences: string[];
  picture_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
