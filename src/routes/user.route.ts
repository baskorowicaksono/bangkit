import UserController from '@/controllers/user.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Router } from 'express';

class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/self`, authMiddleware, this.userController.getMySelf);
    this.router.get(`${this.path}/`, this.userController.getUsers);
    this.router.get(`${this.path}/`, this.userController.getUser);
    this.router.get(`${this.path}/:id`, this.userController.getUserById);
  }
}

export default UserRoute;
