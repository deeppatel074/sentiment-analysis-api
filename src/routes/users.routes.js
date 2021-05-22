import { Router } from 'express';
import * as UserController from '../controllers/users.controller';
// import { verify } from '../services/auth';
const routes = Router();
routes.post('/login', UserController.login);
routes.post('/register', UserController.register);
routes.get('/sentiment/text', UserController.getSentimentByText);
routes.get('/sentiment/twitter', UserController.getSentimentFromTwitter);

export default routes;
