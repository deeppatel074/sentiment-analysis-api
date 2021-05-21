import { Router } from 'express';
import * as UserController from '../controllers/users.controller';
// import { verify } from '../services/auth';
const routes = Router();


routes.get('/sentiment', UserController.getProductInfo);

export default routes;
