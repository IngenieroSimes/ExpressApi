
import { createConnection,createPool } from 'mysql2/promise';
import { DB_HOST,DB_NAME,DB_PORT,DB_USER,DB_PASSWORD } from '../config.js';
/*
// Crear una conexión a la base de datos MySQL
/*
const db = createConnection(
    
{
    host: DB_HOST, // Cambia esto si tu base de datos está en otro servidor
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectTimeout: 60000,
    port: DB_PORT
}

);*/

/*
// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error(`Error al conectar a la base de datos: ${DB_NAME}`, err);
        return;
    }
    console.log(`Conexión a la base de datos MySQL ${DB_NAME} establecida`);
});
// export default db;
*/
// conectar usando el pool
const pool=createPool(
    {
        host: DB_HOST, // Cambia esto si tu base de datos está en otro servidor
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        connectTimeout: 60000,
        port: DB_PORT
    }  
)

export default pool;
