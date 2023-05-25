import { Request, Response } from 'express';
import { User } from '@interfaces/user.interface';

export interface DataStoredInToken {
  id: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface SessionBody {
  expiryTime: string | Date;
  userId: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: SessionBody;
}

export interface ResponseWithUser extends Response {
  user: User;
}
