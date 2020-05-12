const express = require('express')
require('./db/mongoose')

const taskRouter = require('./routers/tasks');
const userRouter = require('./routers/users')

const app = express();

const port = process.env.PORT || 5000

app.use(express.json())
app.use(taskRouter)
app.use(userRouter)

app.listen(port,()=>{
    console.log('server started in port '+port);
})




