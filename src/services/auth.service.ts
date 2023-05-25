import jwt from 'jsonwebtoken';
import RedisService from '@services/redis.service';
import RefreshTokenInterface from '@/interfaces/token.interface';
import AccessTokenInterface from '@interfaces/access-token.interface';
import { HttpResponse } from '@/classes/http-response.class';

const dotenv = require('dotenv');
dotenv.config();
const { JWT_KEY } = process.env;

interface AuthServiceInterface {
  status: number;
  message: string;
  data?: any;
}

class AuthService {
  public async middlewareService(accessToken: string, refreshToken: string): Promise<AuthServiceInterface> {
    try {
      const accessObj = await this.validateRefreshAndAccessToken(accessToken, refreshToken);
      return new HttpResponse(200, 'Success!', accessObj).get();
    } catch (error) {
      if (error.message === 'Invalid token' || error.message === 'Token is not available or expired.') {
        return new HttpResponse(401, error.message).get();
      }
      return new HttpResponse(500, 'An error occurred.').get();
    }
  }

  private async validateRefreshAndAccessToken(accessToken: string, refreshToken: string): Promise<AccessTokenInterface | any> {
    const redisService = new RedisService();

    const refreshObj = this.getRefreshObj(refreshToken);
    await this.validateRefreshToken(redisService, refreshObj, refreshToken);

    const accessObj = this.getAccessObj(accessToken);
    await this.validateAccessToken(redisService, accessObj, refreshObj.userId, accessToken);

    return accessObj;
  }

  private async validateRefreshToken(redisService: RedisService, refreshObj: RefreshTokenInterface | any, refreshToken: string): Promise<void> {
    const refreshTokenFromRedis = await redisService.getRefreshToken(refreshObj.userId);
    if (refreshTokenFromRedis !== refreshToken || new Date() > new Date(refreshObj.expiryTime)) {
      throw new Error('Token is not available or expired.');
    }
  }

  private async validateAccessToken(
    redisService: RedisService,
    accessObj: AccessTokenInterface | any,
    userId: string,
    accessToken: string,
  ): Promise<void> {
    const accessTokenFromRedis = await redisService.getAccessToken(userId);
    if (accessTokenFromRedis !== accessToken) {
      throw new Error('Token is not available or expired.');
    }

    if (new Date() > new Date(accessObj.expiryTime)) {
      // TODO: update access token expiry time and generate new one
      throw new Error('Token is not available or expired.');
    }
  }

  private getRefreshObj(refreshToken: string): RefreshTokenInterface | any {
    try {
      const refreshObj: RefreshTokenInterface | any = jwt.verify(refreshToken, JWT_KEY);
      return refreshObj;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private getAccessObj(accessToken: string): AccessTokenInterface | any {
    try {
      const accessObj: AccessTokenInterface | any = jwt.verify(accessToken, JWT_KEY);
      return accessObj;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default AuthService;
