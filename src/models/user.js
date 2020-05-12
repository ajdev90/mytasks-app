const mongoose = require('mongoose')
const validator =  require('validator')
const bcrypt = require('bcryptjs')
const jwt =  require('jsonwebtoken')
const Task =  require('../models/task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim:true
    },
    email:{
       type: String,
       required: true,
       unique: true,
       trim:true,
       lowercase:true,
       validate(value){
           if(!validator.isEmail(value)){
               throw new Error("invalid email..!!");
           }
       }
    },
    password: {
       type: String,
       required: true,
       trim:true,
       validate(value){
           if(value.toLowerCase().includes('password')){
               throw new Error('password canot contain password string');
           }
           if(value && value.length<= 6){
            throw new Error('password length should be greater than 6');
           }
       },
       
    },
    age: {
       type: Number,
       default:0,
       validate(value){
           if(value<0){
               throw new Error("invalid age");
           }
       }
    },
    tokens: [{
      token : {
          type: String,
          required: true
      }      
    }],
    data:{
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref:  'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Model method --- as it is available in Model
userSchema.statics.findUserByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}
// Instance method 
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_KEY) 
    user.tokens = user.tokens.concat({token:token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.tokens
    delete userObject.password
    return userObject
}


userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove',async function (next){
  const user = this
  await Task.deleteMany({ownew:user._id})
  next()
})

const User = mongoose.model('User',userSchema)

module.exports = User