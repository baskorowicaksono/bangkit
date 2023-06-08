/* eslint-disable @typescript-eslint/ban-ts-comment */
import ActivityEntity from '@/entity/activity.entity';
import UserEntity from '@/entity/user.entity';
import { HttpException } from '@/exceptions/HttpException';
import { ActivityRequest, TypeLocation } from '@/interfaces/activity.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { ILike, getRepository } from 'typeorm';

class ActivityController {
  public async addActivity(req: Request, res: Response, next: NextFunction) {
    const activityRequest: ActivityRequest = req.body;

    const activityRepository = getRepository(ActivityEntity);
    const userRepository = getRepository(UserEntity);

    const newActivity = new ActivityEntity(
      nanoid(32),
      activityRequest.activity_name,
      activityRequest.location,
      activityRequest.description,
      activityRequest.background_img,
    );

    if (!(activityRequest.location in TypeLocation)) {
      next(new HttpException(400, 'Invalid location'));
    }

    const duplicateActivity =
      (await activityRepository.count({
        where: {
          activity_name: activityRequest.activity_name,
          location: activityRequest.location,
        },
      })) > 0;
    if (duplicateActivity) {
      next(new HttpException(404, 'Duplicate activity found'));
      return;
    }

    if (activityRequest.users) {
      const userList = [];
      for (let i = 0; i < activityRequest.users.length; i++) {
        const checkUser = await userRepository.findOne({
          where: {
            id: activityRequest.users[i].id,
            email: activityRequest.users[i].email,
          },
        });
        if (checkUser) userList.push(checkUser);
      }

      newActivity.users = userList;

      if (activityRequest.users.length === userList.length) {
        activityRepository.save(newActivity).then(async r => {
          res.status(200).send({
            message: 'Successfully add new activity',
            data: r,
          });
        });
      }
    } else {
      activityRepository
        .save(newActivity)
        .then(async r => {
          res.status(200).send({
            message: 'Successfully add new activity',
            data: r,
          });
        })
        .catch(e => {
          next(new HttpException(500, e));
        });
    }
  }

  public async getActivity(req: RequestWithUser, res: Response, next: NextFunction) {
    const { page, activity_name, pagesize, sort } = req.query;
    const activityRepository = getRepository(ActivityEntity);
    // @ts-ignore
    const pageSize = pagesize ? parseInt(pagesize) : 5;
    // @ts-ignore
    const searchKey: string = activity_name == null || typeof activity_name == 'undefined' ? '' : activity_name;
    let pageNumber: number;
    if (typeof page === 'string') {
      pageNumber = typeof page == 'undefined' ? 0 : parseInt(page);
    } else if (typeof page === 'number') {
      pageNumber = typeof page == 'undefined' ? 0 : parseInt(page);
    } else {
      pageNumber = 0;
    }

    const totalActivity = await activityRepository.count({
      where: { activity_name: ILike(`%${searchKey}%`) },
    });

    const allActivity = await activityRepository.find({
      where: { activity_name: ILike(`%${searchKey}%`) },
      take: pageSize,
      skip: pageNumber & pageSize,
      order: {
        activity_name: sort === 'DESC' ? 'DESC' : 'ASC',
      },
    });

    if (totalActivity != null && allActivity != null) {
      res.status(200).send({
        message: 'Successfully get all activities',
        data: allActivity,
        page: page,
        totalActivity: totalActivity,
        totalPage: Math.floor(totalActivity / pageSize) + (totalActivity % pageSize > 0 ? 1 : 0),
      });
    } else {
      next(new HttpException(500, 'Something went wrong while querying for results.'));
    }
  }

  public async getActivityByID(req: RequestWithUser, res: Response, next: NextFunction) {
    const { id } = req.params;
    const activityRepository = getRepository(ActivityEntity);
    const findActivity = await activityRepository.findOne({
      where: { id: id },
      relations: ['users'],
    });

    if (findActivity) {
      res.status(200).send({
        message: 'Successfuly get activity with id: ' + id,
        data: findActivity,
      });
    } else {
      next(new HttpException(404, 'This course does not exist'));
    }
  }

  public async deleteActivity(req: RequestWithUser, res: Response, next: NextFunction) {
    const { id } = req.params;
    const activityRepository = getRepository(ActivityEntity);

    const findActivity = await activityRepository.findOne(id);
    if (!findActivity) {
      next(new HttpException(404, 'Activity not found!'));
      return;
    }

    activityRepository
      .softRemove(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'Successfully removed activity with id: ' + id,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async linkUser(req: RequestWithUser, res: Response, next: NextFunction) {
    const { id } = req.params;
    const userId = req.user.userId;

    const userRepository = getRepository(UserEntity);
    const activityRepository = getRepository(ActivityEntity);

    const findActivity = await activityRepository.findOne(id, { relations: ['users'] });
    if (!findActivity) {
      next(new HttpException(404, 'activity not found'));
      return;
    }

    const findUser = await userRepository.findOne(userId);
    if (!findUser) {
      next(new HttpException(404, 'user not found'));
      return;
    }

    if (!findActivity.users) {
      findActivity.users = [];
    }

    const flag = true;
    findActivity.users.map(user => {
      if (user.id === userId) {
        next(new HttpException(400, 'User already exists in this activity'));
        return;
      }
    });
    if (!flag) {
      return;
    }

    findActivity.users.push(findUser);
    activityRepository
      .save(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'Successfully add user: ' + findUser.nama + ' to activity: ' + r.activity_name,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  public async unlinkUser(req: RequestWithUser, res: Response, next: NextFunction) {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRepository = getRepository(UserEntity);
    const activityRepository = getRepository(ActivityEntity);

    const findActivity = await activityRepository.findOne(id, { relations: ['users'] });
    if (!findActivity) {
      next(new HttpException(404, 'Activity not found'));
      return;
    }

    const findUser = await userRepository.findOne(userId);
    if (!findUser) {
      next(new HttpException(404, 'User not found'));
      return;
    }
    const newUsers = [];
    findActivity.users.map(user => {
      if (user.id !== userId) {
        newUsers.push(user);
      }
    });
    findActivity.users = newUsers;

    activityRepository
      .save(findActivity)
      .then(r => {
        res.status(200).send({
          message: 'Successfully remove user: ' + userId + ' from activity: ' + r.activity_name,
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, 'Something went wrong: ' + e));
      });
  }

  // TODO: Fix query for this endpoint
  public async getActivityByUser(req: RequestWithUser, res: Response, next: NextFunction) {
    const { allActivities } = req.body;
    const activityRepository = getRepository(ActivityEntity);

    const findActivities = await activityRepository
      .createQueryBuilder('activity_entity')
      .where('activity_entity.id IN(:...activityId)', { activityId: allActivities })
      .leftJoinAndSelect('activity_entity.activities', 'user_activities_entity')
      .leftJoinAndSelect('activity_entity.users', 'user_entity');

    res.status(200).send({
      message: 'Berhasil mendapatkan aktivitas',
      data: findActivities,
    });
  }
}

export default ActivityController;
