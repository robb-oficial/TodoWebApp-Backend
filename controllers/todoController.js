import sql from "../db.js";
import AppError from "../models/appError.js";

export const getTodos = async (req, res, next) => {
    const userId = req.user.id;
    const todos = await sql`
        SELECT title, content, priority, status, deadline, created_at
        FROM todos
        WHERE user_id = ${userId} AND is_deleted = false;
    `;

    res.status(200).json({
        status: 'success',
        data: todos
    });
};

export const getSingleTodo = async (req, res, next) => {
    const userId = req.user.id;
    const todoId = parseInt(req.params.id);
    if (!todoId) {
        return next(new AppError(400, 'Id must be an integer'));
    }

    const todo = await sql`SELECT * FROM todos WHERE id = ${todoId} AND user_id = ${userId}`;
    if (todo.count === 0) {
        return next(new AppError(404, 'Todo not found'));
    }
    res.status(200).json({
        status: 'success',
        data: {
            todo: todo[0]
        }
    });
};

export const createTodo = async (req, res, next) => {
    const userId = req.user.id;
    const { title, content, priority, deadline } = req.body;
    const photos = req.files;

    if (!title || !content || !priority) {
        return next(new AppError(400, 'Missing any of the fields: title, content, priority'));
    }

    const todo = {
        title,
        content,
        priority: parseInt(priority),
        deadline,
        user_id: userId
    };

    Object.keys(todo).forEach(key => todo[key] === undefined ? delete todo[key] : {});

    const insertion = await sql`INSERT INTO todos ${sql(todo)} RETURNING *`;

    let data = { newTodo: insertion[0] }

    if (photos) {
        const paths = photos.map(photo => ({ path: photo.path.replace(/\\/g, '/') }));
        const photosInserted = await sql`INSERT INTO photos ${sql(paths)} RETURNING *`;

        const joins = photosInserted.map(photo => ({ todo_id: insertion[0].id, photo_id: photo.id }));
        const joinInsertion = await sql`INSERT INTO contains_photos ${sql(joins)}`;
        data = { ...data, photos: photosInserted };
    }

    res.status(201).json({
        status: 'success',
        data
    });
};