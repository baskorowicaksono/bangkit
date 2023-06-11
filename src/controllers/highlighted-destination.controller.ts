/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from 'express';
import { ILike, getRepository } from 'typeorm';
import HighlightedDestinationEntity from '../entity/highlighted-destination.entity';
import { HighlightedDestinationRequest } from '@/interfaces/highlighted-destination.interface';
import { nanoid } from 'nanoid';
import { TypeLocation } from '@/interfaces/activity.interface';
import { HttpException } from '@/exceptions/HttpException';

class HighlightedDestinationController {
  public addDestination = async (req: Request, res: Response, next: NextFunction) => {
    const destinationRequest: HighlightedDestinationRequest = req.body;
    const destinationRepository = getRepository(HighlightedDestinationEntity);

    const newDestination = new HighlightedDestinationEntity(
      nanoid(32),
      destinationRequest.destination_name,
      destinationRequest.location,
      destinationRequest.description,
      destinationRequest.gmap_link,
      destinationRequest.background_img,
      destinationRequest.image_gallery,
      destinationRequest.activity,
      destinationRequest.contact_number,
    );

    if (!(destinationRequest.location.toUpperCase() in TypeLocation)) {
      next(new HttpException(400, 'Invalid location'));
      return;
    }

    const duplicateDestination =
      (await destinationRepository.count({
        where: {
          destination_name: destinationRequest.destination_name,
          location: destinationRequest.location,
        },
      })) > 0;
    if (duplicateDestination) {
      next(new HttpException(404, 'Duplicate destination found'));
      return;
    }
    destinationRepository
      .save(newDestination)
      .then(async r => {
        res.status(201).send({
          message: 'Successfully add new destination',
          data: r,
        });
      })
      .catch(e => {
        next(new HttpException(500, e));
      });
  };

  public getDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let offsetSize = 10;
      const repository = getRepository(HighlightedDestinationEntity);
      const { city, page, pagesize, sort } = req.params;
      const offset: number = page ? parseInt(page) : 0;
      offsetSize = pagesize ? parseInt(pagesize) : offsetSize;

      const searchKey: string = city == null || typeof city == 'undefined' ? '' : city.toString().toUpperCase() in TypeLocation ? city : 'Invalid';
      if (searchKey == 'Invalid') {
        next(new HttpException(400, 'Search key error: Invalid city.'));
        return;
      }

      // @ts-ignore
      const [destinationData, nDestinationsData] = await repository.findAndCount({
        where: { city: ILike(`%${searchKey}%`) },
        skip: offsetSize * offset,
        take: offsetSize,
        order: {
          location: sort === 'DESC' ? 'DESC' : 'ASC',
        },
      });
      res.status(200).json({
        data: {
          data: destinationData,
          count: nDestinationsData,
          totalPages: Math.ceil(nDestinationsData / 50),
          page: offset,
        },
        message: 'Berhasil get all highlighted destinations',
      });
    } catch (error) {
      next(error);
    }
  };

  public getDestinationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destinationId = req.params.id;
      const repository = getRepository(HighlightedDestinationEntity);
      const data = await repository.findOne({
        where: { id: destinationId },
      });

      res.status(200).json({
        data: data,
        message: 'Berhasil menemukan destinasi',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default HighlightedDestinationController;
