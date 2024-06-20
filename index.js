import express from "express"
import http from "http"
import router from "./main/route.js"

const app=express()

//middlware for parse json bodies
app.use(express.json())

app.use(router)

app.use((req, res) => {
    res.status(404).json({
      result: {},
      message: "This doesn't exist",
    });
  });

const httpServer=http.createServer(app)

httpServer.listen(3000,'127.0.0.1',(err)=>{
   if(!err){
    console.log("Server successfully started")
   }
   else{
    console.log("err",err)
   }

})