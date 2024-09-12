const mysql = require("mysql2");


const con = mysql.createConnection
    ({
        host:'localhost',
        user:'root',
        password:'',
        database:'users',
    });

    con.connect((err)=>
    {
        if(err)
            throw err;
        console.log("connected");
    })

            module.exports=con.promise();
   