import express from 'express';
const app=express();
import {PORT} from './config.js';
import cors from 'cors'
//const cors = require('cors');

const PUERTO=PORT;

// requerimos el router de contactos
//const contactosRouter=require('./rutas/contactosRouter').default;
import {contactosRouter} from './rutas/contactosRouter.js'
// requerimos el módulo cors para permitir accesos de cualquier origen
app.use(cors()); 

app.use('/api/1.0/contactos',contactosRouter);

app.listen(PUERTO,console.log('Express está escuchando en el puerto: ' + PUERTO));