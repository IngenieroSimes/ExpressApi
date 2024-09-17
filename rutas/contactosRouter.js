import { Router, json, text } from 'express';
import { DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD } from '../config.js';
export const contactosRouter = Router();

//import { createConnection } from 'mysql2';
import pool from './db.js';

// Crear una conexión a la base de datos MySQL
/*
const db = createConnection({
    host: DB_HOST, // Cambia esto si tu base de datos está en otro servidor
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectTimeout: 60000,
});
// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log(`Conexión a la base de datos MySQL: ${DB_NAME} establecida`);
});
*/
// ruta de contactos 
// previo a la api, procesamos el midlleware para que devuelva json / texto

contactosRouter.use(json());
contactosRouter.use(text());

// vamos a construir una API REST DE CONTACTOS QUE IMPLEMENTARÁ CRUD
// devuelve todos los contactos
class Contacto {
    constructor(ap, nom, em) {
        this.apellido = ap;
        this.nombres = nom;
        this.email = em;
    }
}

contactosRouter.get('/', (req, res) => {
    const sql = 'SELECT * FROM contactos';

    pool.getConnection()
        .then(connection => {
            connection.query(sql)
                .then(([rows]) => {
                    connection.release()
                    console.log([rows]);
                    res.json([rows]);
                })
                .catch(error => {
                    connection.release();
                    console.error('Error al consultar la base de datos:', err);
                    res.send('Error interno del servidor.');
                    reject(error);
                })
        })
        .catch(error => {
            reject(error);
        })
})
/*
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            res.send('Error interno del servidor.');
        } else {
            console.log(rows);
            res.json(rows);
        }
    });
})
*/
contactosRouter.get('/:id', (req, res) => {
    let idContacto = req.params.id;
    console.log(idContacto);
    const sql = 'SELECT * FROM contactos where idContacto=?';

    // funcion para saber si el array está vacío
    const arrayVacio = (arr) => !Array.isArray(arr) || arr.length === 0;
    pool.getConnection()
        .then(connection => {
            connection.query(sql, idContacto)
                .then(([rows]) => {
                    if (arrayVacio([rows])) {
                        console.log([rows]);
                        res.json([{ mensaje: 'No existe el contacto solicitado' }])
                    } else {
                        res.json([rows])
                        console.log([rows]);
                    }
                    connection.release()
                })
                .catch(error => {
                    connection.release();
                    console.error('Error al consultar la base de datos:', err);
                    res.send('Error al consultar la base de datos:', err);
                    reject(error);
                })
        })
        .catch(error => {
            reject(error);
        })
})

/*
    db.query(sql, idContacto, (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            res.send('Error interno del servidor.');
        } else {
            if (arrayVacio(rows)) {
                console.log(rows);
                res.json([{ mensaje: 'No existe el contacto solicitado' }])
            } else {
                res.json(rows)
                console.log(rows);
            }
        }
    });
})
    */
// hay que parsear la info que manda el formulario, se usa el modulo bodyparser
//const bodyParser=require('body-parser')
// pasamos el bodyparser al middleware, con extended=false para que solo procese texto
//contactosRouter.use(bodyParser.urlencoded({ extended: false }));

contactosRouter.post('/nuevo', (req, res) => {

    let apellido = req.body.apellido;
    let nombres = req.body.nombres;
    let email = req.body.email;

    const sql = 'INSERT INTO contactos (apellido, nombres, email) VALUES (?, ?, ?)';
    const values = [apellido, nombres, email];
    const nuevoContacto = new Contacto(apellido, nombres, email);

    pool.getConnection()
        .then(connection => {
            connection.query(sql, values)
                .then(() => {
                    connection.release()
                    console.log('El contacto :' + JSON.stringify(nuevoContacto) + ' se agregó correctamente');
                    res.json('El contacto :' + JSON.stringify(nuevoContacto) + ' se agregó correctamente');
                })
                .catch(error => {
                    connection.release();
                    console.error('Error al agregar en la base de datos:', err);
                    res.send('Error al agregar en la base de datos:', err);
                    reject(error);
                })
        })
        .catch(error => {
            reject(error);
        })



    /*
    db.query(sql, values, (err, rows) => {
        if (err) {
            console.error('Error al agregar en la base de datos:', err);
            res.send('Los Datos no se pudieron agregar en la base de datos');
        } else {
            res.send('El contacto :' + JSON.stringify(nuevoContacto) + ' se agregó correctamente');
        }
    }); */

})


contactosRouter.put('/modificar', (req, res) => {
    let idContacto = req.body.idContacto;
    let apellido = req.body.apellido;
    let nombres = req.body.nombres;
    let email = req.body.email;
    const sql = 'UPDATE contactos SET apellido=?,nombres=?,email=? where idContacto= ? ';
    const values = [apellido, nombres, email, idContacto];
    const contactoActualizado = new Contacto(apellido, nombres, email);
    pool.getConnection()
        .then(connection => {
            connection.query(sql, values)
                .then(() => {
                    connection.release()
                    console.log('Se modificaron los datos del contacto con los siguientes datos ' + JSON.stringify(contactoActualizado));
                    res.json('Se modificaron los datos del contacto con los siguientes datos ' + JSON.stringify(contactoActualizado));
                })
                .catch(error => {
                    connection.release();
                    console.error('Error al modificar en la base de datos:', err);
                    res.send('Error al modificar en la base de datos:', err);
                    reject(error);
                })
        })
        .catch(error => {
            reject(error);
        })


    /*
    db.query(sql, values, (err, rows) => {
        if (err) {
            console.error('Error al modificar en la base de datos:', err);
            res.send('Los Datos no se pudieron modificar en la base de datos');
        } else {
            res.send('Se modificaron los datos del contacto con los siguientes datos ' + JSON.stringify(contactoActualizado));
        }
    });
    */
})

contactosRouter.delete('/:id', (req, res) => {
    let idContacto = req.params.id;
    const sql = 'DELETE FROM contactos where idContacto=' + idContacto;
    pool.getConnection()
        .then(connection => {
            connection.query(sql)
                .then(() => {
                    connection.release()
                    console.log('Se eliminó el contacto cuyo id es ' + idContacto);
                    res.json('Se eliminó el contacto cuyo id es ' + idContacto);
                })
                .catch(error => {
                    connection.release();
                    console.error('Error al intentar Borrar en la base de datos:', err);
                    res.send('Error al intentar Borrar en la base de datos:', err);
                    reject(error);
                })
        })
        .catch(error => {
            reject(error);
        })

    /*
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            res.send('Error interno del servidor.');
        } else {
            res.send('Se eliminó el contacto cuyo id es ' + idContacto);
        }
    });
    */
})
