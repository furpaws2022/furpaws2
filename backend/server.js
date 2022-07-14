const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./user");
const app = express();

//-----------------End of import--------------------------------------------------------


//mongoose.connect("mongodb+srv://admin-sarthik:<password>@cluster0.dy4yu.mongodb.net/?retryWrites=true&w=majority");

mongoose.connect("mongodb://localhost:27017/furpawsDB1", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log("Furpaws DB connected...")
})

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // <-- location of the react app were connecting to
    credentials: true,
  })
);
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

//---------------------End of middleware------------------------------------------

//Routes

app.post("/login",(req,res)=>{
    passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log(req.user);
      });
    }
  })(req, res);
});

app.post("/register",(req,res)=>{
    User.findOne({ username: req.body.username }, async (err, doc) => {
        if (err) throw err;
        if (doc) res.send("User Already Exists");
        if (!doc) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

          const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
          });
          await newUser.save();
          res.send("User Created");
        }
      });
});

app.get("/logout",(req,res)=>{
  req.logout(function(err) {
    if (err) {
      console.log(err);
      res.send("Logout unsuccessfull.");
    }
    res.send("Successfully Logged Out");
  });

});

app.get("/user",(req,res)=>{
  res.send(req.user);
});

//---------------------End of Routes-----------------------------

//Start Server
app.listen(4000, () => {
    console.log("Server Has Started on port 4000");
  });