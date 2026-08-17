import path from "path";
import express from 'express';
import multer from 'multer';
import { createTodo, getSingleTodo, getTodos } from '../controllers/todoController.js';
import { verifyJWT } from '../controllers/authController.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('uploads', 'todoPhotos'));
    },
    filename: (req, file, cb) => {
        const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')
        const lastDotIndex = safeOriginal.lastIndexOf('.');
        const extension = safeOriginal.slice(lastDotIndex);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1000);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({storage})

const router = express.Router();

router.get('/', verifyJWT, getTodos);
router.post('/', verifyJWT, upload.array('todo-photos'), createTodo);
router.get('/:id', verifyJWT, getSingleTodo);

export default router;