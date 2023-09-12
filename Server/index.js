const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const basicAuth = require('basic-auth');
const User = require('../Server/models/userModel');

const app = express();
const routes = require('../Server/routes/router');
const cors = require('cors');

require('dotenv').config();

const port = 8000;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors('*'));
app.use('/api', routes);

// Middleware de registro de solicitud
app.use((req, res, next) => {
    console.log(`Recibida una solicitud en la URL ${req.url}`);
    next();
});

// Agregar la línea para cargar la variable de entorno MONGO_URL
const mongoUrl = process.env.MONGO_URL;

const mongoConnect = async () => {
    try {
        // Utilizar la variable mongoUrl en la conexión a la base de datos
        await mongoose.connect(mongoUrl);
        console.log('Base de datos conectada en MB');
    } catch (err) {
        console.log(err);
    }
}

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
    const user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        // Envía la respuesta de autenticación requerida en el encabezado WWW-Authenticate
        res.set('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).json({ message: 'Autenticación Requerida.'});
    }

    try {
        const foundUser = await User.findOne({ username: user.name });

        if (!foundUser) {
            return res.status(401).send('Usuario no encontrado.');
        }

        const passwordMatch = await foundUser.comparePassword(user.pass);

        if (!passwordMatch) {
            return res.status(401).send('Contraseña incorrecta.');
        }

        // Obtener el rol del usuario desde el documento de usuario
        const userRole = foundUser.role;

        // Define los métodos permitidos según el rol
        let allowedMethods = ['GET']; // Inicialmente, permitir solo GET

        if (userRole === 'empleado') {
            allowedMethods.push('POST'); // Permitir POST para empleados
        } else if (userRole === 'admin') {
            allowedMethods.push('POST', 'PUT', 'DELETE'); // Permitir POST, PUT y DELETE para admin
        }

        // Verificar si el método de la solicitud está permitido
        if (!allowedMethods.includes(req.method)) {
            return res.status(403).send('Acceso denegado: Método no permitido para tu rol.');
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor.');
    }
};

app.get('/ruta-protegida', authMiddleware, (req, res) => {
    // Aquí se ejecutará la lógica de la ruta protegida si la autenticación es exitosa
    res.send('¡Has accedido a la ruta protegida!');
});

mongoConnect();
app.listen(port, () => {
    console.log(`Servidor está en ejecución en http:/localhost:${port}`);
});
