const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require('https');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const app = express();
require('./auth'); //for google OAuth2.0
const port = process.env.PORT || 3000;


/* From disk */
const data = require('./javascript/index.js');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

// User logged in or not
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://Umang:umang319@cluster0.hs3gd7l.mongodb.net/Storage`,{useNewUrlParser:true});

const documentSchema = new mongoose.Schema({
    name:String,
    heading:String,
    aboutPost:String,
    parent:String,
    content1:String,
    content2:String,
    content3:String,
    imgLink:String,
    keywords: String
});



let sub = false;
let fullname = "Sign Up";

const Document = new mongoose.model("Document",documentSchema);

app.get('/',(req,res)=>{
    res.render('home',{data:data,subscribed:sub,fullname:fullname});
});


app.post('/subscribe',(req,res)=>{
    sub = true;
    const user_email = req.body.email;
    const data = {
        members : [
            {
                email_address:user_email,
                status : "subscribed"
            }
        ]
    };

    const jsonData = JSON.stringify(data);
    const url = "https://us14.api.mailchimp.com/3.0/lists/ca2bc538b4";
    const options = {
        method: 'POST',
        auth: "umang:ffb918718614100a92364c1a6441ab02-us14"
    }
    const request = https.request(url,options,(resp)=>{
        resp.on('data',(d)=>{
            // console.log(JSON.parse(d));
        });
    }).on('error',(e)=>{
        console.error(e);
    })

    request.write(jsonData);
    request.end();

    res.redirect('/');
});


app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
});








app.get('/writing',(req,res)=>{
    res.render('filewriter', {data:data});
});



app.get('/testing',(req,res)=>{
    Document.find({parent:"design"}, (err,result)=>{
        if(!err){
            console.log(result);
        }
    });
});

app.post('/more',(req,res)=>{
    const query = req.body.query;
    let heading = "";
    if(query==="webDev") heading="Web development blogs";
    else if(query==="design") heading="Design related blogs"
    Document.find({parent:query}, (err, result)=>{
        if(!err){
            res.render('moreArticles', {data:result, webSiteName:data.webSiteName, heading:heading});
        }
    });
});

app.get('/signup', (req,res)=>{
    res.render('signup', {webSiteName:data.webSiteName});
});

app.get('/signin', (req,res)=>{
    res.render('signin', {webSiteName:data.webSiteName});
});

/* User schema */
const userSchema = mongoose.Schema({
    fname: String,
    lname: String,
    email:String,
    password:String
});

const User = new mongoose.model("User",userSchema);

app.post('/signupSubmit',(req,res)=>{
    const fnameX = req.body.fname;
    const lnameX = req.body.lname;
    const emailX = req.body.email;
    const passwordX = req.body.password;
    fullname = fnameX + " " + lnameX;
    bcrypt.hash(passwordX,10,(err,hash)=>{
        const newUser = new User({
            fname:fnameX,
            lnameX:lnameX,
            email:emailX,
            password:hash
        });
        newUser.save();
        res.redirect('/');
    });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));


app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/result',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/result', isLoggedIn, (req, res) => {
    const data = {
        name : req.user.displayName,
        email : req.user.email
    }
  res.render('result', {data:data});
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});






/* Get requested article from database */
app.get('/:articleName',(req,res)=>{
    const article_name = req.params.articleName;
    Document.findOne({name:article_name}, (err, result)=>{
        if(err){
            res.render('filenotfound');
        }
        else{
            if(result != null){
                Document.find({parent:result.parent}, (err, recommended)=>{
                    res.render('article',{data:result, webSiteName:data.webSiteName, recommended:recommended});
                });
            }
            else{
                res.render('filenotfound');
            }
        }
    });
});

