let express = require("express");
let connection = require("../connection");
let router = express.Router();
let jwt = require("jsonwebtoken");
let auth = require("../services/authentication");
let checkRole = require("../services/checkrole");
let nodemailler = require("nodemailer");
router.post("/signup", (req, res) => {
  let user = req.body;
  let query = "select email,password,role,status from user where email=?";

  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        let query =
          "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
        connection.query(
          query,
          [
            user.name,
            user.contactNumber,
            user.email,
            user.password,
            user.status,
            user.role,
          ],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Successfully Registered" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(404).json({
          message: "Email already exist",
        });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  let user = req.body;
  console.log(user);
  let query = "select email,password,role,status from user where email=?";

  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "Incorrect user name or password" });
      } else if (results[0].status === "false") {
        return res.status(400).json({ message: "wait for admin approvel" });
      } else if (results[0].password == user.password) {
        let response = { email: results[0].email, role: results[0].role };
        let accessToken = jwt.sign(response, process.env.Access_Token, {
          expiresIn: "8h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res.status(404).json(err, console.log("err is at login page"));
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

let transporter = nodemailler.createTransport({
  service: "email",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post("/forgotPassword", (req, res) => {
  let user = req.body;
  let query = "select email,password from user where email=?";

  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(200)
          .json({ message: "password sent succesfully to your email" });
      } else {
        let mailOptions = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "password by cafe management system",
          html:
            "<p><b>Your Login details for Cafe Management System <br><b>Email:</b>" +
            results[0].email +
            "<br> <b>password:</b>" +
            results[0].password +
            '<br><a href="localhost:4200/user/login">Click here to login </a></b></p>',
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("email sent successfully", +info.response);
          }
        });
        return res
          .status(200)
          .json({ message: "password sent successfully to your email" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/get", auth.authenticateToken, checkRole.checkRole, (req, res) => {
  let query =
    "select id,name,email,contactNumber,status  from user where role ='user' ";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    let user = req.body;
    let query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "user id does not exist" });
        } else {
          return res.status(200).json({ message: "user updated successfully" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

router.get("/chekcToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: true });
});

router.post("/changePassword", auth.authenticateToken, (req, res) => {
  let user = req.body;
  let email = res.locals.email;
  let query = "select * from user where email=? and password=?";
  connection.query(query, [email, user.oldPassword], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "incorrect Old Password" });
      } else if (results[0].password == user.oldPassword) 
      {
        let query = "update user set password=? where email=?";
        connection.query(query, [user.newPassword, email], (err, results) => {
          if (!err) {
            return res
              .status(200)
              .json({ message: "password updated successfully" });
          } else {
            return res.status(500).json(err);
          }
        });
      } else 
      {
        return res
          .status(400)
          .json({ message: "something went wrong ! plz try again later" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
