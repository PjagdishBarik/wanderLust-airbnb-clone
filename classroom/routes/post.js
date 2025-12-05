const express=require("express");
const router=express.Router();

router.get("/post",(req,res)=>{
    res.send("post is working");
});

//Show 
router.get("/post/:id",(req,res)=>{
    res.send("get for posts");
});

//post 
router.post("/post",(req,res)=>{
    res.send("Post for posts");
});

//Delete
router.delete("/post/:id",(req,res)=>{
    res.send("Delete for post id");
});
module.exports=router;