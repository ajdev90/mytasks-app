const express = require('express')
const userRouter = new express.Router
const User = require('../models/user');
const auth = require('../middleware/auth')
const multer = require('multer')
const upload = multer({
    //dest: 'useruploads',
    limits:{
        fileSize: 5000000
    },
    fileFilter(req,file,cb){
       if(file.originalname.toLowerCase().endsWith('.png')||file.originalname.toLowerCase().endsWith('.jpeg')||file.originalname.toLowerCase().endsWith('.jpg')){
        return cb(undefined,true)   
        
       }
       return cb(new Error('invalid file extension'))
    }
})

userRouter.post('/users',async (req,res)=>{
    try{
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }
    catch(error){
        res.status(400).send(error)
    }
})

userRouter.post('/users/login',async (req,res)=>{
    try{
        
        const user = await  User.findUserByCredentials(req.body.email,req.body.password)
        
        const token = await user.generateAuthToken()
      
        res.send({user,token})
    }
    catch(error){
        res.status(400).send(error)
    }
})

userRouter.post('/users/logout',auth,async (req,res)=>{
    try{
       req.user.tokens = req.user.tokens.filter((t)=>{
           return t.token != req.token
       })
       await req.user.save();
       res.send()
    }
    catch(error){
        res.status(500).send()
    }
})

userRouter.post('/users/upload',auth,upload.single('file'),async (req,res)=>{
    try{
        req.user.data = req.file.buffer
        await req.user.save()
       res.send();
    }
    catch(error){
        res.status(500).send()
    }
},(error,req,res,next)=>{
    res.status(400).send({error: 'file upload failed'})
})

userRouter.delete('/users/upload',auth,async (req,res)=>{
    try{
        req.user.data = undefined
        await req.user.save()
        res.send();
    }
    catch(error){
        res.status(500).send()
    }
},(error,req,res,next)=>{
    res.status(400).send({error: 'file upload failed'})
})

userRouter.post('/users/logoutall',auth,async (req,res)=>{
    try{
       req.user.tokens =[];
       await req.user.save();
       res.send()
    }
    catch(error){
        res.status(500).send()
    }
})

userRouter.get('/users/me',auth,async (req,res)=>{
   console.log('inside get users');
    try{
       
       res.status(200).send(req.user);
    }
    catch(error)
    {
        res.status(500).send(error);
    }
})

/* userRouter.get('/users/:id',async (req,res)=>{
    try{
    console.log(req.params);
    const userId = req.params.id;
    const user  = await User.findById(userId)
    if(!user){
        res.status(404).send("no user found");
    }
    res.status(200).send(user);
    }
    catch(error){
        res.status(500).send(error);
    }
}) */

userRouter.patch('/users/me',auth,async (req,res)=>{
    try{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:'invalid update'})

    }

    //console.log(req.params);
    //const userId = req.params.id
    //const user = await User.findById(req.params.id)
    const user = req.user
    updates.forEach((update)=>user[update] = req.body[update] )
    await user.save();
    //const user = await User.findByIdAndUpdate(userId,req.body,{new:true ,runValidators:true})
    if(!user){
        return res.status(404).send()
    }
    res.status(200).send(user);
    }
    catch(error){
        res.status(400).send(error);
    }
})

userRouter.delete('/users/me',auth,async (req,res)=>{
    try{
    await req.user.remove()
    res.status(200).send(req.user);
    }
    catch(error){
        res.status(500).send(error);
    }
})

module.exports  = userRouter