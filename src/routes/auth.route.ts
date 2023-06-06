import AuthController from '@/controllers/auth.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import { Router } from 'express';

class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}auth/authenticate`, this.authController.googleAuth);
    this.router.post(`${this.path}auth/refresh`, this.authController.refreshToken);
    this.router.post(`${this.path}auth/logout`, authMiddleware, this.authController.logOut);
  }
}

export default AuthRoute;
