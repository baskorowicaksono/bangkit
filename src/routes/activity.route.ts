import ActivityController from '@/controllers/activity.controller';
import { Routes } from '@/interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { Router } from 'express';

class ActivityRoute implements Routes {
  public path = '/activity';
  public router = Router();
  public activityController = new ActivityController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, authMiddleware, this.activityController.addActivity);
    this.router.get(`${this.path}`, authMiddleware, this.activityController.getActivity);
    this.router.get(`${this.path}/:id`, authMiddleware, this.activityController.getActivityByID);
    this.router.post(`${this.path}/:id/link`, authMiddleware, this.activityController.linkUser);
    this.router.post(`${this.path}/:id/unlink/`, authMiddleware, this.activityController.unlinkUser);
    this.router.post(`${this.path}/dev`, authMiddleware, this.activityController.getActivityByUser);
  }
}

export default ActivityRoute;
