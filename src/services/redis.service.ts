import jwt from 'jsonwebtoken';
import RefreshTokenInterface from '@/interfaces/token.interface';
import TokenInterface from '@/interfaces/token.interface';

const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const { REDIS_URI, REDIS_PORT, JWT_KEY, ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME } = process.env;

export default class RedisService {
  public client;
  private jwtKey;
  private accessLife;
  private refreshLife;

  constructor() {
    const PORT = REDIS_PORT ? REDIS_PORT : 6379;
    const HOST = REDIS_URI ? REDIS_URI : 'localhost';
    // this.client = redis.createClient(HOST+':'+PORT);
    try {
      this.client = redis.createClient({
        host: HOST,
        port: PORT,
      });
      this.jwtKey = JWT_KEY ? JWT_KEY : 'test1234';
      this.accessLife = ACCESS_TOKEN_LIFETIME ? ACCESS_TOKEN_LIFETIME : 900;
      this.refreshLife = REFRESH_TOKEN_LIFETIME ? REFRESH_TOKEN_LIFETIME : 86400;
      this.client.on('connect', () => console.log('redis telah terhubung!'));
    } catch (e) {
      console.log(e);
      console.log('from catch');
    }
  }

  public async getAccessToken(uuid: string): Promise<string | boolean> {
    const token = await this.readRedis('accesstoken-' + uuid);
    return token;
  }

  public setAccessToken(uuid: string, accessToken: TokenInterface): string {
    const token = jwt.sign(accessToken, this.jwtKey);
    this.client.setex('accesstoken-' + uuid, this.accessLife, token);
    return token;
  }

  public async getRefreshToken(uuid: string): Promise<string | boolean> {
    const token = await this.readRedis('refreshtoken-' + uuid);
    return token;
  }

  public setRefreshToken(uuid: string, refreshToken: RefreshTokenInterface): string {
    const token = jwt.sign(refreshToken, this.jwtKey);
    this.client.setex('refreshtoken-' + uuid, this.refreshLife, token);
    return token;
  }

  public removeToken(uuid: string): void {
    this.client.del('refreshtoken-' + uuid, function (err, response) {
      if (response == 1) {
        console.log('Deleted Successfully!');
      } else {
        console.log('Cannot delete');
      }
    });
    this.client.del('accesstoken-' + uuid, function (err, response) {
      if (response == 1) {
        console.log('Deleted Successfully!');
      } else {
        console.log('Cannot delete');
      }
    });
  }

  public async getMetadata(key: string) {
    return await this.readRedis('metadata-' + key);
  }

  public setMetadata(key: string, content: any, expire = 1000000) {
    this.client.setex('metadata-' + key, expire, content);
  }

  public removeMetadata(key: string) {
    this.client.del('metadata-' + key, (err, response) => {
      if (response == 1) {
        console.log('Deleted Successfully!');
      } else {
        console.log('Cannot delete');
      }
    });
  }

  private readRedis(searchKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.get(searchKey, (err, jobs) => {
        if (err) {
          return reject(err);
        }
        resolve(jobs);
      });
    });
  }
}
