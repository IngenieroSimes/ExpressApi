import { Router, json, text } from 'express';
import pool from './db.js';
import { Server } from 'socket.io';

export const contactosRouter = Router();

// Configuración de Socket.IO
let io;
export const configureSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Permite conexiones desde cualquier origen
      methods: ["GET", "POST","PUT","DELETE"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};

contactosRouter.use(json());
contactosRouter.use(text());

class Contacto {
    constructor(ap, nom, em) {
        this.apellido = ap;
        this.nombres = nom;
        this.email = em;
    }
}

// ... (mantener las rutas GET existentes sin cambios) ...

contactosRouter.get('/', (req, res) => {
    const sql = 'SELECT * FROM contactos';

    pool.getConnection()
        .then(connection => {
            connection.query(sql)
                .then((rows) => {
                    connection.release()
                    console.log(rows);
                    res.json(rows);
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
                .then((result) => {
                    connection.release()
                    console.log('El contacto :' + JSON.stringify(nuevoContacto) + ' se agregó correctamente');
                    
                    // Añadir el ID del nuevo contacto al objeto
                    nuevoContacto.id = result.insertId;
                    
                    // Emitir el evento de nuevo contacto a todos los clientes conectados
                    if (io) {
                        io.emit('newContact', nuevoContacto);
                    }
                    
                    res.json({
                        message: 'El contacto se agregó correctamente',
                        contact: nuevoContacto
                    });
                })
                .catch(error => {
                    connection.release();
                    console.error('Error al agregar en la base de datos:', error);
                    res.status(500).send('Error al agregar en la base de datos');
                })
        })
        .catch(error => {
            console.error('Error al obtener conexión:', error);
            res.status(500).send('Error interno del servidor');
        })
})

//////////////////////////////////////////////////////////////////////////
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

})
