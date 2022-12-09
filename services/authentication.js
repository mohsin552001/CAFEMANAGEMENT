require("dotenv").config();

let jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.Access_Token, (err, response) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    res.locals = response;
    next();
  });

}


module.exports = { authenticateToken: authenticateToken };
