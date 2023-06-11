/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from 'express';
import { ILike, getRepository } from 'typeorm';
import { nanoid } from 'nanoid';
import { TypeLocation } from '@/interfaces/activity.interface';
import { HttpException } from '@/exceptions/HttpException';
import { TravelServiceRequest } from '@/interfaces/travel-service.interface';
import TravelServiceEntity from '@/entity/travel-service.entity';

class TravelServiceController {
  public addTravelService = async (req: Request, res: Response, next: NextFunction) => {
    const travelServiceRequest: TravelServiceRequest = req.body;
    const travelServiceRepository = getRepository(TravelServiceEntity);

    const newTravelService = new TravelServiceEntity(
      nanoid(32),
      travelServiceRequest.service_name,
      travelServiceRequest.location,
      travelServiceRequest.description,
      travelServiceRequest.service_provider,
      travelServiceRequest.service_price,
      travelServiceRequest.gmap_link,
      travelServiceRequest.background_img,
      travelServiceRequest.image_gallery,
      travelServiceRequest.contact_number,
    );

    if (!(travelServiceRequest.location.toUpperCase() in TypeLocation)) {
      next(new HttpException(400, 'Invalid location'));
      return;
    }

    const duplicateDestination =
      (await travelServiceRepository.count({
        where: {
          service_name: travelServiceRequest.service_name,
          service_provider: travelServiceRequest.service_provider,
          location: travelServiceRequest.location,
        },
      })) > 0;
    if (duplicateDestination) {
      next(new HttpException(404, 'Duplicate travel service found'));
      return;
    }
    travelServiceRepository
      .save(newTravelService)
      .then(async r => {
        res.status(201).send({
          message: 'Successfully add new travel service',
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, e));
      });
  };

  public getTravelServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let offsetSize = 10;
      const repository = getRepository(TravelServiceEntity);
      const { city, page, pagesize, sort } = req.params;
      const offset: number = page ? parseInt(page) : 0;
      offsetSize = pagesize ? parseInt(pagesize) : offsetSize;

      const searchKey: string = city == null || typeof city == 'undefined' ? '' : city.toString().toUpperCase() in TypeLocation ? city : 'Invalid';
      if (searchKey == 'Invalid') {
        next(new HttpException(400, 'Search key error: Invalid city.'));
        return;
      }

      // @ts-ignore
      const [travelServiceData, nTravelServiceData] = await repository.findAndCount({
        where: { location: ILike(`%${searchKey}%`) },
        skip: offsetSize * offset,
        take: offsetSize,
        order: {
          location: sort === 'DESC' ? 'DESC' : 'ASC',
        },
      });
      res.status(200).json({
        data: {
          data: travelServiceData,
          count: nTravelServiceData,
          totalPages: Math.ceil(nTravelServiceData / 50),
          page: offset,
        },
        message: 'Berhasil get all travel services',
      });
    } catch (error) {
      next(error);
    }
  };

  public getTravelServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const serviceId = req.params.id;
      const repository = getRepository(TravelServiceEntity);
      const data = await repository.findOne({
        where: { id: serviceId },
      });

      res.status(200).json({
        data: data,
        message: 'Berhasil menemukan travel service',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TravelServiceController;
