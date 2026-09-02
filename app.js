import express from 'express';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

import userRouter from './routes/userRoutes.js';
import todoRouter from './routes/todoRoutes.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('--------------------');
    console.log('URL REQUESTED ' + req.method + ' ' + req.originalUrl)
    console.log('--------------------');
    next()
})

app.use('/api/v1/users', userRouter)
app.use('/api/v1/todos', todoRouter)

app.use(globalErrorHandler)

app.listen(PORT, async () => {
    console.log('Running in port ' + PORT);
});