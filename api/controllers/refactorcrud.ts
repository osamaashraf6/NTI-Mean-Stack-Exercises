import { Document } from "mongoose";
// All required import
import asyncHandler from "express-async-handler";
import express from "express";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError";
import { IFilterData } from "../interfaces/FilterData";
import Features from "../utils/Features";

// createOneHandler
export const createOneHandler = <modelType>(model: mongoose.Model<any>) => {
  return asyncHandler(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const document: modelType = await model.create(req.body);
      if (!document) {
        return next(new ApiError(404, "Document Not Found!"));
      }
      res.status(200).json({ data: document });
    }
  );
};
// getAllHandler
export const getAllHandler = <modelType>(
  model: mongoose.Model<any>,
  modelName: string
) => {
  return asyncHandler(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      let filterData: any = {};
      let searchLength: number = 0;
      if (req.filterData) {
        filterData = req.filterData;
      }
      if (req.query) {
        const searchResult: Features = new Features(
          model.find(filterData),
          req.query
        )
          .filter()
          .search(modelName);
        const searchData: modelType[] = await searchResult.mongooseQuery;
        searchLength = searchData.length;
      }
      //
      const documentsCount: number =
        searchLength || (await model.find(filterData).countDocuments());
      const features: Features = new Features(model.find(filterData), req.query)
        .filter()
        .sort()
        .limitFields()
        .search(modelName)
        .pagination(documentsCount);
      const { mongooseQuery, paginationResult } = features;
      const documents: modelType[] = await mongooseQuery;
      if (!documents) {
        return next(new ApiError(404, "Documents Not Found!"));
      }
      res.status(200).json({
        length: documents.length,
        pagination: paginationResult,
        data: documents,
      });
    }
  );
};
// getOneHandler
export const getOneHandler = <modelType>(
  model: mongoose.Model<any>,
  populateOptions?: string
) => {
  return asyncHandler(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      let query = model.findById(req.params.id);
      if (populateOptions) {
        query = query.populate(populateOptions);
      }
      const document: modelType | null = await query;
      if (!document) {
        return next(new ApiError(404, "Document Not Found!"));
      }
      res.status(200).json({ data: document });
    }
  );
};
// updateOneHandler
export const updateOneHandler = <modelType>(model: mongoose.Model<any>) => {
  return asyncHandler(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const document: modelType | null = await model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      if (!document) {
        return next(new ApiError(404, "Document Not Found!"));
      }
      res.status(200).json({ data: document });
    }
  );
};
// deleteOneHandler
export const deleteOneHandler = <modelType>(model: mongoose.Model<any>) => {
  return asyncHandler(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const document: modelType | null = await model.findByIdAndDelete(
        req.params.id
      );

      if (!document) {
        return next(new ApiError(404, "Document Not Found!"));
      }
      res.status(200).json("Document has been deleted successfully");
    }
  );
};