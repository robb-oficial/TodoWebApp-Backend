import postgres from 'postgres'

const sql = postgres({
    host: '127.0.0.1',
    port: 5432,
    database: 'todos',
    username: 'postgres',
    password: 'megaman7'

});

export default sql