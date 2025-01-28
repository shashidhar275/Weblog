const mongoose = require('mongoose');
const crypto = require('crypto');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
    },
    profileImageURL: {
        type: String,
        default: '/images/userAvatar.png'
    },
    role: {
        type: String,
        enum: ['USER','ADMIN'],
        default: 'USER',
    }
},{timestamps: true});

userSchema.pre('save',function(next){
    const user = this;  //Must be a traditional function syntax
    
    if(!user.isModified('password')) return ;

    const salt = crypto.randomBytes(16).toString();
    const hashedPassword = crypto.createHmac('SHA256',salt).update(user.password).digest('hex');
    
    this.salt = salt;
    this.password = hashedPassword;

    next();
})

userSchema.static('matchPasswordAndGenerateToken',async function(email,password){
    const user = await this.findOne({email});
    if(!user) throw new Error('User not found!');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = crypto.createHmac('SHA256',salt).update(password).digest('hex');

    if(hashedPassword!==userProvidedHash) throw new Error('Incorrect password');

    const token = createTokenForUser(user);
    return token;
})

const User = mongoose.model('user',userSchema);

module.exports = User;