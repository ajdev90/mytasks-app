const express = require('express')
const taskRouter = new express.Router
const Task = require('../models/task');
const auth = require('../middleware/auth')

taskRouter.post('/tasks',auth,async (req,res)=>{
    try{
        const task = new Task({
            ...req.body,
            owner : req.user._id
        })
        await task.save()
        res.status(201).send(task)
    }
    catch(error){
        res.status(400).send(error)
    }
})

taskRouter.get('/tasks/:id',auth,async (req,res)=>{
    try{
        const _id = req.params.id;
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            res.status(404).send("no task found");
        }
        res.status(200).send(task);
        }
        catch(error){
            res.status(500).send(error);
        }
})

taskRouter.get('/tasks',auth,async (req,res)=>{
    var completedVal = false;
    try{
        
      if(req.query.completed){
        if(req.query.completed === 'true'){
             completedVal = true;
        }
          tasks = await Task.find({owner:req.user._id, completed:completedVal})
       }
       else{
        tasks = await Task.find({owner:req.user._id})
       }
       
       console.log('==>>'+tasks)
       res.status(200).send(tasks)
    }
    catch(error){
        res.status(500).send(error);
    }
})

taskRouter.patch('/tasks/:id',auth,async (req,res)=>{
    try{
    console.log(req.params);
    const updates = Object.keys(req.body)
    const allowed = ['description', 'completed']
    const isValid = updates.every((update) => allowed.includes(update))
    if(!isValid){
        res.status(400).send({"error":"invalid request"});
    }
    
    const task  = await Task.findOne({_id:req.params.id,owner : req.user._id})
    //const task = await Task.findById(taskId)
    
    //const task = await Task.findByIdAndUpdate(taskId,req.body,{new:true ,runValidators:true})
    if(!task){
        return res.status(404).send()
    }

    updates.forEach((update)=>task[update] = req.body[update] )
    await task.save();
    res.status(200).send(task);
    }
    catch(error){
        res.status(400).send(error);
    }
})

taskRouter.delete('/tasks/:id',auth,async (req,res)=>{
    try{
    const task = await Task.findOneAndDelete({_id :req.params.id,owner:req.user._id})
    if(!task){
        res.status(404).send("no task found");
    }
    res.status(200).send(task);
    }
    catch(error){
        res.status(500).send(error);
    }
})

module.exports  = taskRouter