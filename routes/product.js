let express = require("express");
require("dotenv").config();

let auth = require("../services/authentication");
let checkRole = require("../services/checkrole");
let router = express.Router();
let connection = require("../connection");

router.post("/add", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let product = req.body;

  let query =
    "insert into product (name,catagoryId,description,price,status ) values(?,?,?,?,'true')";

  connection.query(
    query,
    [product.name, product.catagoryId, product.description, product.price],
    (err, results) => {
      if (!err) {
        return res.status(200).json({ message: "product added successfully" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

router.get("/get", (req, res) => {
  let query =
    "select p.id,p.name,p.description,p.price,p.status, c.id as catagoryId, c.name as catagoryName from product as p INNER JOIN catagory as c where p.catagoryId =c.id ";

  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/getBycatagory/:id", auth.authenticateToken, (req, res, next) => {
  let query =
    "select id,name from product where catagoryId =? and status ='true'";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      console.log(err);
      return res.status(500).json(err);
    }
  });
});

router.get("/getById/:id", auth.authenticateToken, (req, res, next) => {
  let id = req.params.id;
  let query = "select id,name,description,price from product where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else {
      console.log(err);
      return res.status(500).json(err);
    }
  });
});

router.patch("/update", auth.authenticateToken, (req, res) => {
  let product = req.body;
  let query =
    "update product set name =? ,catagoryId=?,description=?,price=? where id=?";
  connection.query(
    query,
    [
      product.name,
      product.catagoryId,
      product.description,
      product.price,
      product.id,
    ],
    (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(401).json({ message: "product id does not found" });
        }
        return res.status(200).json({ message: "product Edit successfully" });
      } else {
        console.log(err);
        return res.status(500).json(err);
      }
    }
  );
});


router.delete('/delete/:id',(req,res,next)=>{
    let query ="delete from product where id =?"
    connection.query(query,[id],(err,results)=>{
        if(!err){ 
            if (results.affectedRows == 0) {
            return res.status(404).json({ message: "product id does not found" });
          }
            return res.status(200).json({message:'prodcts Deleted successfully'})
        }else{
            console.log(err);
            return res.status(500).json(err);
        }
    })
})


router.patch('/updatedStatus',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
let user =req.body
let query ="update product set status =? where id=?"
connection.query(query,[user.status,user.id],(err,results)=>{
    if(!err){ 
        if (results.affectedRows == 0) {
        return res.status(404).json({ message: "product id does not found" });
      }
        return res.status(200).json({message:'prodcts status updated successfully'})
    }else{
        console.log(err);
        return res.status(500).json(err);
    }
})
})





module.exports = router;
