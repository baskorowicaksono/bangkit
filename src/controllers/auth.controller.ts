import { HttpException } from '@/exceptions/HttpException';
import RefreshTokenInterface from '@/interfaces/token.interface';
import AuthService from '@/services/auth.service';
import RedisService from '@/services/redis.service';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import UserEntity from '@/entity/user.entity';
import { nanoid } from 'nanoid';
import TokenInterface from '@/interfaces/token.interface';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@/interfaces/user.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';

const dotenv = require('dotenv');
dotenv.config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REFRESH_TOKEN_LIFETIME, ACCESS_TOKEN_LIFETIME, JWT_KEY } = process.env;

class AuthController {
  public authService = new AuthService();
  public redisService = new RedisService();
  public googleClient = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  });

  public googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tokenId } = req.body;
      //Throw Exception if tokenId not available
      if (!tokenId) {
        next(new HttpException(404, 'tokenid not found!'));
      }
      //Authenticate with google
      this.googleClient
        .verifyIdToken({
          idToken: tokenId,
          audience: GOOGLE_CLIENT_ID,
        })
        .then(async respon => {
          const { email, picture, sub } = respon.getPayload();
          //Check email
          const userRepository = getRepository(UserEntity);
          const findUser = await userRepository.findOne({ where: { email: email }, relations: ['details'] });
          if (findUser) {
            const date = new Date();
            const authObj: RefreshTokenInterface = {
              expiryTime: new Date(date.getTime() + parseInt(REFRESH_TOKEN_LIFETIME) * 1000),
              userId: findUser.id,
            };
            const refreshToken = this.redisService.setRefreshToken(findUser.id, authObj);
            authObj.expiryTime = new Date(date.getTime() + parseInt(ACCESS_TOKEN_LIFETIME) * 1000);
            const accessToken = this.redisService.setAccessToken(findUser.id, authObj);

            res.status(200).send({
              message: 'berhasil melakukan autentikasi',
              userStatus: {
                userData: {
                  isRegister: !!findUser.googleid,
                  email: findUser.email,
                },
                tokenData: {
                  refreshToken: refreshToken,
                  accessToken: accessToken,
                  accessTokenExpiryTime: authObj.expiryTime,
                },
              },
            });
          } else {
            let newId = nanoid(25);
            let cekId = await userRepository.findOne({ where: { id: newId } });
            while (cekId) {
              newId = nanoid(25);
              cekId = await userRepository.findOne({ where: { id: newId } });
            }
            const newUser: User = {
              email: email,
              googleid: sub,
              id: newId,
              picture_url: picture,
            };

            userRepository.save(newUser);
            const date = new Date();
            const authObj: RefreshTokenInterface = {
              expiryTime: new Date(date.getTime() + parseInt(REFRESH_TOKEN_LIFETIME) * 1000),
              userId: newUser.id,
            };
            const refreshToken = this.redisService.setRefreshToken(newUser.id, authObj);
            authObj.expiryTime = new Date(date.getTime() + parseInt(ACCESS_TOKEN_LIFETIME) * 1000);
            const accessToken = this.redisService.setAccessToken(newUser.id, authObj);

            res.status(200).send({
              message: 'berhasil melakukan autentikasi',
              userStatus: {
                userData: {
                  isRegister: false,
                  email: newUser.email,
                },
                tokenData: {
                  refreshToken: refreshToken,
                  accessToken: accessToken,
                  accessTokenExpiryTime: authObj.expiryTime,
                },
              },
            });
          }
        });
    } catch (e) {
      next(e);
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
}

export default AuthController;
