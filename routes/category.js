let express =require('express')

let auth=require('../services/authentication')
let router =express.Router()
let  checkRole=require('../services/checkrole')
let connection =require('../connection')



router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
let catagory=req.body


let query ="insert into catagory (name) values(?)"
connection.query(query,[catagory.name],(err,results)=>{
    if(!err){
        return res.status(200).json({message:'catagory added successfully'})
    }else{
        return res.status(500).json(err)
    }
})
})



router.get('/get',auth.authenticateToken,(req,res,next)=>{
    
    
    
    let query ="select * from catagory order by name"
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })
    })





    router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
        let product=req.body
        
        
        let query ="update catagory set name=? where id=?"
        connection.query(query,[product.name,product.id],(err,results)=>{
            if(!err){
                if(results.affectedRows==0){
                    return res.status(404).json({message:'catagory does not exist'})
                }
                return res.status(200).json({message:'catagory updated successfully'})
            }else{
                return res.status(500).json(err)
            }
        })
        })


        module.exports =router