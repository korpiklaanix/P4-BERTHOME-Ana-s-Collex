import express from "express";

const router = express.Router();

/* ************************************************************************* */
// ITEMS (liste + création)
import itemActions from "./modules/Item/itemActions";

router.get("/api/items", itemActions.browse);
router.post("/api/items", itemActions.add);

/* ************************************************************************* */
// COLLECTIONS
import {
  createCollection,
  deleteCollection,
  getCollectionById,
  getCollections,
  updateCollection,
} from "./modules/Collection/CollectionActions";

router.get("/api/collections", getCollections);
router.post("/api/collections", createCollection);
router.get("/api/collections/:id", getCollectionById);
router.put("/api/collections/:id", updateCollection);
router.delete("/api/collections/:id", deleteCollection);

/* ************************************************************************* */
// CATEGORIES
import { getCategories } from "./modules/Category/CategoryActions";

router.get("/api/categories", getCategories);

/* ************************************************************************* */
// ITEMS dans une COLLECTION + CRUD item sécurisé
import {
  addItem,
  browseByCollection,
  deleteItem,
  readItem,
  updateItem,
} from "./modules/ItemColl/ItemCollActions";

router.get("/api/collections/:id/items", browseByCollection);
router.post("/api/collections/:id/items", addItem);

router.get("/api/items/:id", readItem);
router.put("/api/items/:id", updateItem);
router.delete("/api/items/:id", deleteItem);

/* ************************************************************************* */

export default router;
