import { HttpException } from '@/exceptions/HttpException';
import RefreshTokenInterface from '@/interfaces/token.interface';
import AuthService from '@/services/auth.service';
import RedisService from '@/services/redis.service';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RequestWithUser } from '../../../studyboard/studyboard-backend/src/interfaces/auth.interface';
import { getRepository } from 'typeorm';
import { LoginRequest, UserRequest } from '@/interfaces/user.interface';
import UserEntity from '@/entity/user.entity';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { logger } from '@/utils/logger';
import TokenInterface from '@/interfaces/token.interface';

const dotenv = require('dotenv');
dotenv.config();

const { REFRESH_TOKEN_LIFETIME, ACCESS_TOKEN_LIFETIME, JWT_KEY } = process.env;

class AuthController {
  public authService = new AuthService();
  public redisService = new RedisService();

  public register = async (req: Request, res: Response, next: NextFunction) => {
    // get request body and initiate repository
    const newUserRequest: UserRequest = req.body;
    const userRepository = getRepository(UserEntity);

    const id = nanoid(32);

    // hash password
    const hashed_password = await this.hashPassword(newUserRequest.password);

    const newUser = new UserEntity(id, newUserRequest.nama, newUserRequest.email, hashed_password, newUserRequest.picture_url, newUserRequest.umur);

    userRepository
      .save(newUser)
      .then(async r => {
        res.status(201).send({
          message: 'Successfully register a new user',
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, e));
      });
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    const loginRequest: LoginRequest = req.body;
    const userRepository = getRepository(UserEntity);

    const foundUserByEmail = await userRepository.findOne({ where: { email: loginRequest.email } });
    if (foundUserByEmail) {
      // password comparing
      const isPasswordTrue = await bcrypt.compare(loginRequest.password, foundUserByEmail.password);
      if (!isPasswordTrue) {
        next(new HttpException(401, 'Invalid password'));
      }

      const date = new Date();
      const authObj: RefreshTokenInterface = {
        expiryTime: new Date(date.getTime() + parseInt(REFRESH_TOKEN_LIFETIME) * 1000),
        userId: foundUserByEmail.id,
      };
      const refreshToken = this.redisService.setRefreshToken(foundUserByEmail.id, authObj);
      authObj.expiryTime = new Date(date.getTime() + parseInt(ACCESS_TOKEN_LIFETIME) * 1000);
      const accessToken = this.redisService.setAccessToken(foundUserByEmail.id, authObj);

      res.status(200).send({
        message: 'berhasil melakukan autentikasi',
        userStatus: {
          userData: {
            isRegister: false,
            email: foundUserByEmail.email,
          },
          tokenData: {
            refreshToken: refreshToken,
            accessToken: accessToken,
            accessTokenExpiryTime: authObj.expiryTime,
          },
        },
      });
    } else {
      next(new HttpException(404, 'User not found with inputed email'));
      return;
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const Authorization = req.header('Access_Token') && req.header('Refresh_Token');
      if (Authorization) {
        const accessToken = req.header('Access_Token');
        const refreshToken = req.header('Refresh_Token');
        const refreshObj: RefreshTokenInterface | any = jwt.verify(refreshToken, JWT_KEY);
        this.redisService
          .getRefreshToken(refreshObj.userId)
          .then(async r => {
            if (refreshToken === r) {
              const exp = new Date(refreshObj.expiryTime);
              if (new Date() > exp) {
                next(new HttpException(401, 'Refresh token expire'));
              } else {
                const accessObj: TokenInterface | any = jwt.verify(accessToken, JWT_KEY);
                if (accessObj.userId !== refreshObj.userId) {
                  this.redisService.removeToken(refreshObj.userId);
                  next(new HttpException(401, 'Couldnt Authorize user id'));
                  return;
                }

                //New: if accesstoken still available so use current, not create new one
                const currAccessToken = await this.redisService.getAccessToken(accessObj.userId);
                if (currAccessToken) {
                  res.status(200).send({
                    tokenData: {
                      accessToken: currAccessToken,
                      accessTokenExpiryTime: accessObj.expiryTime,
                      refreshToken: refreshToken,
                    },
                  });
                  return;
                }
                const date = new Date();
                accessObj.expiryTime = new Date(date.getTime() + parseInt(ACCESS_TOKEN_LIFETIME) * 1000);
                const newAccessToken = this.redisService.setAccessToken(refreshObj.userId, accessObj);

                res.status(200).send({
                  tokenData: {
                    accessToken: newAccessToken,
                    accessTokenExpiryTime: accessObj.expiryTime,
                    refreshToken: refreshToken,
                  },
                  // role: relatedUser.role,
                });
              }
            } else {
              next(new HttpException(401, 'Token is expire not available'));
            }
          })
          .catch(err => next(new HttpException(500, 'terjadi kesalahan karena ' + err)));
      } else {
        next(new HttpException(403, 'Authentication token missing'));
      }
    } catch (e) {
      next(new HttpException(401, 'Wrong authentication token'));
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.redisService.removeToken(req.user.userId);
      res.status(200).send({
        message: 'berhasil menghapus sesi user ' + req.user.userId + ' dari server',
      });
    } catch (error) {
      console.error(error);
      next(new HttpException(500, 'Something wrong when trying to logout from server'));
    }
  };

  private async hashPassword(password: string) {
    const saltRounds = 10;
    bcrypt
      .genSalt(saltRounds)
      .then(salt => {
        return bcrypt.hash(password, salt);
      })
      .catch(e => {
        logger.error(new HttpException(500, e));
      });
  }
}
