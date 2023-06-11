import HighlightedDestinationController from '@/controllers/highlighted-destination.controller';
import { Routes } from '@/interfaces/routes.interface';
import { Router } from 'express';

class HighlightedDestinationRoute implements Routes {
  public path = '/destination';
  public router = Router();
  public destinationController = new HighlightedDestinationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.destinationController.addDestination);
    this.router.get(`${this.path}`, this.destinationController.getDestinations);
    this.router.get(`${this.path}/:id`, this.destinationController.getDestinationById);
  }
}

export default HighlightedDestinationRoute;
