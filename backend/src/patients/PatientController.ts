import { Request, Response, NextFunction } from "express";
import { PatientModel } from "../models";
import { AppError } from "../errors/AppError";

export class PatientController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patients = await PatientModel.find().sort({ nome: 1 }).exec();
      res.json(patients);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await PatientModel.create(req.body);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const patient = await PatientModel.findByIdAndUpdate(id, req.body, { new: true }).exec();
      if (!patient) {
        throw new AppError("Paciente nao encontrado.", 404);
      }
      res.json(patient);
    } catch (error) {
      next(error);
    }
  };
}
