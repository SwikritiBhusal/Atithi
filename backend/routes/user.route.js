import express from 'express'
import userAuth from '../Middleware/auth.middleware.js' ;
import { getUserData } from '../Controller/user.controller.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData); 

export default userRouter;