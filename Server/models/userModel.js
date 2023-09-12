const mongoose = require ('mongoose')

const userSchema = mongoose.Schema({
    userDNI: {
        type: String,
        require: true,
        unique: true
    },
    username: {
        type: String,
        require: true,
        unique: true
    },
    Name: {
        type: String,
        require: true,
        unique: true}
        ,
    userLastName: {
        type: String,
    },
    birthDay: {
        type: Date,
    },
    role: {
        type: String,
        default: 'cliente',
        enum:[
            'cliente',
            'admin',
            'empleado'
        ]
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
    }
})

const User = mongoose.model ("User",userSchema)
module.exports = User