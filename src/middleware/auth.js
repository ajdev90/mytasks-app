const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) =>{
    try{
        console.log('inside auth middleware')
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_KEY)
        console.log('decoded='+JSON.stringify(decoded))
        const user =  await User.findOne({_id: decoded._id,'tokens.token':token})
        //console.log('user='+JSON.stringify(user))
        if(!user){
            throw new Error()
        }
        req.user = user
        req.token = token
        console.log('before next')
        next()
    }
    catch(e){
        res.status(401).send({error : 'authentication required'})
    }
}

module.exports = auth