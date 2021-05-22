import { Router } from 'express';
import * as UserController from '../controllers/users.controller';
import upload from '../config/multer';
const routes = Router();
routes.post('/login', UserController.login);
routes.post('/register', UserController.register);
routes.get('/sentiment/text', UserController.getSentimentByText);
routes.get('/sentiment/twitter', UserController.getSentimentFromTwitter);
routes.post('/sentiment/csv', upload.single('file'), UserController.getSentimentByCsv);

export default routes;
