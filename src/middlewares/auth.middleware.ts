import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import AuthService from '@services/auth.service';

const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authService = new AuthService();

  try {
    const Authorization = req.header('Access_Token') && req.header('Refresh_Token');
    if (Authorization) {
      const accessToken = req.header('Access_Token');
      const refreshToken = req.header('Refresh_Token');

      authService.middlewareService(accessToken, refreshToken).then(r => {
        if (r.status === 200) {
          req['user'] = r.data;
          next();
        } else {
          next(new HttpException(r.status, r.message));
        }
      });
    } else {
      next(new HttpException(403, 'Authentication tokens missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
