import express from 'express';
import { AddProduct, EditProduct, UpdateCount, DeleteProduct, getProductWithName, getAllProducts } from "../controller/ProductController.js";


const ProductRoutes = express.Router();


ProductRoutes.post("/add", AddProduct);
ProductRoutes.put("/edit", EditProduct);
ProductRoutes.put("/updatecount", UpdateCount);
ProductRoutes.delete("/delete", DeleteProduct);
ProductRoutes.get("/search", getProductWithName);
ProductRoutes.get("/all", getAllProducts);

export default ProductRoutes;