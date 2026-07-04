import express from 'express';
import { CreateOrder, GetMyOrders, GetAllOrders, UpdateOrderStatus } from '../controller/OrderController.js';

const OrderRouter = express.Router();

OrderRouter.post('/new', CreateOrder);
OrderRouter.get('/myorders', GetMyOrders);
OrderRouter.get('/all', GetAllOrders);
OrderRouter.put('/status', UpdateOrderStatus);

export default OrderRouter;
