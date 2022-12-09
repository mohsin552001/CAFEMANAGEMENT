let mysql =require('mysql')
require('dotenv').config()


let connection=mysql.createConnection({
    user:'mohsin',
    database:'mohsin',

    password:'abc',
    host:'34.133.240.13'

})

connection.connect((err)=>{
    if(!err){
        console.log('Database has been connected')
    }else{
        console.log(err)
    }
})

module.exports =connection;