const mongoose = require('mongoose');
const bcrypt= require('bcryptjs')

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    }, 
    password: {
        type: String,
        required: true,
        minLength: 8

    },
    createdAt: {
        type: Date,
        default: Date.now

    }
});

// save hashed passwords into the database so that even DB admin cannot be read user passwords
userSchema.pre('save', async function (next) {
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)
module.exports = User;