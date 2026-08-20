import path from 'path';
import express from 'express';
import multer from 'multer';
import { login, logout, signup, verifyJWT } from '../controllers/authController.js';
import { deleteUser, editUser, getUser } from '../controllers/userController.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('uploads', 'profilePics'))
    },
    filename: function (req, file, cb) {
        const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')
        const lastDotIndex = safeOriginal.lastIndexOf('.');
        const extension = safeOriginal.slice(lastDotIndex);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1000);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
})
const upload = multer({ storage });

const router = express.Router();

router.post('/signup', upload.single('profile-pic'), signup);
router.post('/login', login);
router.post('/logout', verifyJWT, logout);


router.get('/', verifyJWT, getUser);
router.patch('/', verifyJWT, upload.single('profile-pic'), editUser);
router.delete('/delete', verifyJWT, deleteUser);

export default router;