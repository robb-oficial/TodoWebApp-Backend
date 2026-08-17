import express from 'express';
import multer from 'multer';
import { createTodo, getSingleTodo, getTodos } from '../controllers/todoController.js';
import { verifyJWT } from '../controllers/authController.js';

const router = express.Router();

router.get('/', verifyJWT, getTodos);
router.post('/', verifyJWT, createTodo);
router.get('/:id', verifyJWT, getSingleTodo);

export default router;