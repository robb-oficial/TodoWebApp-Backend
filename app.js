import express from 'express';
import dotenv from 'dotenv'
dotenv.config();

import sql from './db.js';
import userRouter from './routes/userRoutes.js'
import globalErrorHandler from './controllers/errorController.js';

const app = express();
const PORT = 3000 || process.env.PORT;

app.use(express.json());
app.use((req, res, next) => {
    console.log('--------------------');
    console.log('URL REQUESTED ' + req.originalUrl)
    console.log('--------------------');
    next()
})

app.use('/api/v1/users', userRouter)

app.use(globalErrorHandler)

app.listen(PORT, async () => {
    console.log('Running in port ' + PORT);
});