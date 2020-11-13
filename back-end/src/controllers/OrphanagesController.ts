import { Request, Response} from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import  orphanageView from '../views/orphanages_view';
import Orphanage from '../models/orphanage';

export default {
  async index(req: Request, res: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages  = await orphanagesRepository.find({
      relations: ['images']
    });

    return res.json(orphanageView.renderMany(orphanages));
  },
  async show(req: Request, res: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const { id } = req.params
    const orphanage  = await orphanagesRepository.findOneOrFail(id,{
      relations: ['images']
    });

    return res.json(orphanageView.render(orphanage));
  },

  async create(req: Request, res: Response){
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = req.body;
  
    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = req.files as Express.Multer.File[];
    
    const images = requestImages.map(image => {
      return { path: image.filename }
    })

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome é um campo obrigatório'),
      latitude: Yup.number().required('Latitude é um campo obrigatório'),
      longitude: Yup.number().required('Longitude é um campo obrigatório'),
      about: Yup.string().required('Sobre é um campo obrigatório').max(300),
      instructions: Yup.string().required('Instruções é um campo obrigatório'),
      opening_hours: Yup.string().required('Horário de funcionamento é um campo obrigatório'),
      open_on_weekends: Yup.boolean().required('Abre nos fins de semana é um campo obrigatório'),
      imagaes: Yup.array(Yup.object().shape({
        path: Yup.string().required()
      }))
    })

    await schema.validate(data, {
      abortEarly: false
    })

    const orphanage = orphanagesRepository.create(data);
  
    
    await orphanagesRepository.save(orphanage);
    
    return res.status(201).json(orphanage);
  }
}