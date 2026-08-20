import sql from "../db.js";
import AppError from "../models/appError.js"

export const getUser = async (req, res, next) => {
    const userId = req.user.id;
    const user = await sql`
        SELECT username, email, profile_pic FROM users
        WHERE id = ${userId} AND is_deleted = false
    `;
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
};

export const editUser = async (req, res, next) => {
    const userId = req.user.id;
    const { username, email } = req.body;
    let path;
    if (req.file) {
        path = req.file.path.replace(/\\/g, '/');
    }

    const user = {
        username,
        email,
        profile_pic: path
    };

    Object.keys(user).forEach(key => user[key] === undefined ? delete user[key] : {});
    const columnsToUpdate = Object.keys(user);
    if (columnsToUpdate.length === 0) {
        return next(new AppError(400, 'No fields to update'));
    }
    let update;
    try {
        update = await sql`
            UPDATE users SET ${sql(user, columnsToUpdate)}
            WHERE id = ${userId} AND is_deleted = false
            RETURNING users.username, users.email, users.profile_pic
        `;
    } catch (e) {
        if (e.code === '23505') {
            const regex = /\(([^)]+)\)/g;
            const results = [...e.detail.matchAll(regex)].map(match => match[1]);
            return next(new AppError(409, `That ${results[0]} is already taken`));
        }
        return next(e)
    }

    if (update.count === 0) {
        return next(new AppError(404, 'User does not exist'));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: update[0]
        }
    });
};

export const deleteUser = async (req, res, next) => {
    const userId = req.user.id;
    const deletion = await sql`
        UPDATE users SET is_deleted = true
        WHERE id = ${userId} AND is_deleted = false RETURNING users.id
    `;
    if (deletion.count === 0) {
        return next(new AppError(404, 'User does not exist'));
    }
    res.clearCookie('jwt_token', {
        httpOnly: true
    });
    res.status(204).end();
};