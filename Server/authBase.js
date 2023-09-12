const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const auth = async (req, res, next) => {
    const user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return res.status(401).send('Autenticación Requerida.');
    }

    try {
        const foundUser = await User.findOne({ username: user.name });

        if (!foundUser) {
            return res.status(401).send('Usuario no encontrado.');
        }

        const passwordMatch = await bcrypt.compare(user.pass, foundUser.password);

        if (!passwordMatch) {
            return res.status(401).send('Contraseña incorrecta.');
        }

        // El usuario y la contraseña son válidos
        // Continuar con la lógica de autenticación y permisos
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error interno del servidor.');
    }
};

module.exports = auth;