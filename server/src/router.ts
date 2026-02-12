import express from "express";
import { upload } from "./modules/upload/uploadCongig";

import itemActions from "./modules/Item/itemActions";

import {
  addItem,
  browseByCollection,
  deleteItem,
  readItem,
  updateItem,
} from "./modules/ItemColl/ItemCollActions";

import {
  createCollection,
  deleteCollection,
  getCollectionById,
  getCollections,
  updateCollection,
} from "./modules/Collection/CollectionActions";

import { getCategories } from "./modules/Category/CategoryActions";

const router = express.Router();

/* ************************************************************************* */
/* COLLECTIONS */
router.get("/api/collections", getCollections);
router.post("/api/collections", createCollection);
router.get("/api/collections/:id", getCollectionById);
router.put("/api/collections/:id", updateCollection);
router.delete("/api/collections/:id", deleteCollection);

/* ************************************************************************* */
/* CATEGORIES */
router.get("/api/categories", getCategories);

/* ************************************************************************* */
/* ITEMS DANS UNE COLLECTION */
router.get("/api/collections/:id/items", browseByCollection);
router.post("/api/collections/:id/items", addItem);

/* ************************************************************************* */
/* ITEM CRUD */
router.get("/api/items/:id", readItem);
router.put("/api/items/:id", updateItem);
router.delete("/api/items/:id", deleteItem);

/* PHOTOS (multi max 5) */
router.get("/api/items/:id/photos", itemActions.listPhotos);

router.post(
  "/api/items/:id/photos",
  upload.array("photos", 5),
  itemActions.addPhotos,
);

router.patch(
  "/api/items/:itemId/photos/:photoId/primary",
  itemActions.setPrimaryPhoto,
);

router.delete("/api/items/:itemId/photos/:photoId", itemActions.deletePhoto);

/* ************************************************************************* */
export default router;
