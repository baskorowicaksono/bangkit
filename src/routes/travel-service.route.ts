import TravelServiceController from '@/controllers/travel-service.controller';
import { Routes } from '@/interfaces/routes.interface';
import { Router } from 'express';

class TravelServiceRoute implements Routes {
  public path = '/travel/service';
  public router = Router();
  public serviceController = new TravelServiceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.serviceController.addTravelService);
    this.router.get(`${this.path}`, this.serviceController.getTravelServices);
    this.router.get(`${this.path}/:id`, this.serviceController.getTravelServiceById);
  }
}

export default TravelServiceRoute;
