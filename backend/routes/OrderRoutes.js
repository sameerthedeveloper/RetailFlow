import express from 'express';
import { CreateOrder, GetMyOrders } from '../controller/OrderController.js';

const OrderRouter = express.Router();

OrderRouter.post('/new', CreateOrder);
OrderRouter.get('/myorders', GetMyOrders);

export default OrderRouter;
