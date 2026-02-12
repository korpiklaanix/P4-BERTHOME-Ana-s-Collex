import type { RequestHandler } from "express";
import { CategoryRepository } from "./CategoryRepository";

export const getCategories: RequestHandler = async (req, res) => {
  const categories = await CategoryRepository.findAll();
  res.json(categories);
};
