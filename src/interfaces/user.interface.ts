export interface User extends UserRequest {
  id: string;
}

export interface UserRequest {
  nama: string;
  email: string;
  password: string;
  picture_url: string;
  umur: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
