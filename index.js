const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const mongoose=require("mongoose")
mongoose.connect("mongodb+srv://admin:admin@cluster0.opycpb3.mongodb.net/project?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>console.log("reussit"))
.catch((err)=>console.log(err))
const UserShema=mongoose.Schema({
  username:String
})
const ExerciceShema=mongoose.Schema({
  user_id:{type:String,required:true},
  description:String,
  duration:Number,
  date:Date
})
const Exercice=mongoose.model("Exercices",ExerciceShema,"Exercices")
const User=mongoose.model("Users",UserShema,"Users")
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users",async(req,res)=>{
const user=req.body
const newuser=new User(user)
newuser.save()
res.send(newuser)
})
app.get("/api/users",async(req,res)=>{
  const newuser=await User.find({}).select("id users")
  if(!newuser){
    return res.json({err:"aucun user"})
  }
  else
  {res.send(newuser)}
  })
app.post("/api/users/:_id/exercises",async(req,res)=>{
  const id=req.params._id
  console.log("id",id)
  const info=req.body
  console.log("info",info)
  try{
    const user=await User.findById(id)
    console.log("user",user)
    if(!user){
      return res.json({error:"could not found user"})
    }else{
      info.user_id=id
      if(info.date==''){
        info.date=new Date()
      }
      console.log("newInfo",info)
      const newExercice=new Exercice(info)
      console.log("newExercice",newExercice)
      const newex=await newExercice.save()
      console.log("newex",newex)
      res.send(newex)
      
    }
  }
  catch{res.send("err")}
})
app.get("/api/users/:_id/logs",async(req,res)=>{
  const {form,to,limit}=req.query
  const id=req.params._id
  const user=await User.findById(id)
  if(!user){
    return res.json({error:"could not found user"})
  }
  let dateobj={}
  if(form){
    dateobj["$gte"]=new Date(form)
  }
  if(to){
    dateobj["$lte"]=new Date(to)
  }
  let filter={user_id:id}
  if(form || to){
    filter.date=dateobj
  }
  const exercice=await Exercice.find(filter).limit(+limit ?? 500)
  let log=exercice.map(e=>(
 {
    description:e.description,
    duration:e.duration,
    date:(new Date(e.date)).toDateString()
  } 

))
  res.json({
    username: user.username,
    count: exercice.length,
    _id: user._id,
    log
  })
})
  
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
