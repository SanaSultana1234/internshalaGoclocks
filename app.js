require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const md5 = require('md5');
const botName = 'ChatBot';
const PORT = process.env.PORT||3000;
const app = express();


app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");

const mongoPass=process.env.MONGO_PASS;
const uri = 'mongodb+srv://sanasultana:'+mongoPass+'@cluster0.qx25xj3.mongodb.net/internDB?retryWrites=true&w=majority';
mongoose.connect(uri);

const userSchema = new mongoose.Schema({
    typeOfUser: String,
    username: String,
    password: String,
    address: String
});

const User = mongoose.model("User", userSchema);


const orderSchema = new mongoose.Schema({
    to: String,
    from: String,
    quantity: {
        type: String,
        enum: ['one', 'two', 'three']
    },
    address: {
        type: String,
        default: 'India'
    },
    transporter: {
        type: String,
        default: 'transporter1'
    }
});

const Order = mongoose.model("Order", orderSchema);

app.get("/login", function(req, res) {
    res.render("login");
});
app.get("/register", function(req, res) {
    res.render("register");
});
app.get("/chat", function(req, res) {
    Order.find()
    .then(function(orders) {
        res.render("chat", {Orders: orders});
    })
    .catch(function(err) {
        console.log(err);
    });
    
});

app.get("/manufacturer", function(req, res) {
    res.render("manufacturer");
});

app.get("/transporter", function(req, res) {
    Order.find()
    .then(function(orders) {
        res.render("transporter", { Options: orders });
    })
    .catch(function(err) {
        console.log(err);
    });
});


app.post("/login", function(req, res) {
    const user = req.body.username;
    const pass = md5(req.body.password);
    const btn = req.body.btn;
    let page='';
    if(btn==="t") 
        page="transporter";
    else
        page="manufacturer";
    User.findOne({username: user, typeOfUser:btn})
    .then(function(foundUser) {
        if(foundUser) {
            if(foundUser.password===pass) {
                res.redirect(page);
            }
        }
    })
    .catch(function(err) {
        console.log(err);
    })
});

app.post("/register", function(req, res) {
    const user = req.body.username;
    const pass = md5(req.body.password);
    const adr = req.body.address;
    let page="";
    const btn = req.body.btn;
    if(btn==="t") 
        page="transporter";
    else
        page="manufacturer";
        User.findOne({username: user, typeOfUser:btn})
        .then(function(foundUser) {
            if(foundUser) {
                if(foundUser.password===pass) {
                    res.render(page);
                }
            } else {
                const newUser = new User({
                    typeOfUser: btn,
                    username: user,
                    password: pass,
                    address: adr
                 });
                 newUser.save()
                   .then(function() {
                      console.log("New user registered");
                      res.redirect(page);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        })
        .catch(function(err) {
            console.log(err);
        })
    
});


app.post("/manufacturer", function(req, res) {
    const fromU = req.body.from;
    const toU = req.body.to;
    const quant = req.body.quantity;
    const trans = req.body.transporter;
    const adr = req.body.address;
    const newOrder = new Order({
        to: toU,
        from: fromU,
        quantity: quant,
        address: adr,
        transporter: trans
     });
     newOrder.save()
       .then(function() {
          console.log("New order registered");
          res.redirect("/chat");
        })
        .catch(function(err) {
            console.log(err);
        });
});
app.post("/transporter", function(req, res) {

    const orderID = req.body.orderID;
    const price = req.body.price;
    res.redirect("/chat");
});

//Connect to the database before listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})