const express=require("express");
const router=express.Router();

router.get("/user",(req,res)=>{
    res.send("user is working");
});

//Show
router.get("/user/:id",(req,res)=>{
    res.send("get for user");
});

//post
router.post("/user",(req,res)=>{
    res.send("Post for user");
});

//Delete
router.delete("/user/:id",(req,res)=>{
    res.send("Delete for user id");
});
module.exports=router;