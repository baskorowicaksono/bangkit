/* eslint-disable @typescript-eslint/ban-ts-comment */
import UserEntity from '@/entity/user.entity';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { NextFunction, Request, Response } from 'express';
import { Like, getRepository } from 'typeorm';

class UserController {
  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let offsetSize = 20;
      const repository = getRepository(UserEntity);
      const { q, page, id, pagesize } = req.params;
      const offset: number = page ? parseInt(page) : 0;
      offsetSize = pagesize ? parseInt(pagesize) : offsetSize;
      // @ts-ignore
      const [usersData, nUsersData] = await repository.findAndCount({
        relations: ['activities'],
        where: [{ email: Like(`%${q}%`) }, { id: Like(`%${id}%`) }],
        skip: offsetSize * offset,
        take: offsetSize,
      });
      res.status(200).json({
        data: {
          data: usersData,
          count: nUsersData,
          totalPages: Math.ceil(nUsersData / 50),
          page: offset,
        },
        message: 'Berhasil get all user',
      });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const repository = getRepository(UserEntity);
      const userData = await repository.findOne({
        where: { id: userId },
        relations: ['activities'],
      });

      res.status(200).json({
        data: userData,
        message: 'Berhasil menemukan user',
      });
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRepository = getRepository(UserEntity);
      const userData = await userRepository.find({});
      res.status(200).json({
        data: userData,
        message: 'Berhasil menemukan semua user',
      });
    } catch (e) {
      next(new HttpException(500, e));
    }
  };

  public getMySelf = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.userId;
      const repository = getRepository(UserEntity);
      const userData = await repository.findOne({
        where: { id: userId },
        relations: ['activities'],
      });

      res.status(200).json({
        data: userData,
        message: 'Berhasil menemukan user',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
