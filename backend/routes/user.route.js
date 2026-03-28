import express from 'express'
import userAuth from '../Middleware/auth.middleware.js' ;
import { getUserData, getUserFavorites, addFavorite, removeFavorite } from '../Controller/user.controller.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.get('/favorites', userAuth, getUserFavorites);
userRouter.post('/favorites/:id', userAuth, addFavorite);
userRouter.delete('/favorites/:id', userAuth, removeFavorite);

export default userRouter;