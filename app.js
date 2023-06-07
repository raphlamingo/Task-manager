// Template for further use
const express = require('express');
const app = express();
let ejs = require('ejs');
const port = 3000;
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));


// mongodb
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/taskmanagerDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    lists:[{todo:String}]
  });

const User= mongoose.model('User',UserSchema);

//security
const bcrypt = require('bcrypt');

// sessions
const session = require('express-session');

app.use(session({
  secret: 'kasififi',
  resave: false,
  saveUninitialized: false
}));

// app routes

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req,res)=>{
    const errorMessage = req.query.error;
    res.render('login', { error: errorMessage })
})

app.get('/register',(req,res)=>{
    const errorMessage = req.query.error;
    res.render('register', { error: errorMessage })
})

app.post('/register', function(req,res){
    var username= req.body.name;
    var useremail= req.body.email;
    var userpassword= req.body.password;

    async function findUser() {
        try {
          var user = await User.findOne({ email: useremail });
          if (user) {
              var errorMessage = 'User already exists';
              res.redirect('/login?error=' + encodeURIComponent(errorMessage))
          } else {
              bcrypt.genSalt(5, (err, salt) => {
                  bcrypt.hash(userpassword, salt, (err, hash) => {
                    if (err) {
                      console.error(err);
                    } else {
                      var new_user= new User({
                          name: username,
                          email: useremail,
                          password:hash
                      })
                      new_user.save()
                      req.session.username = new_user.name;
                      res.redirect('/list')
                    }
                  });
                });
          }
        }
        catch (err) {
            console.error(err);}

}
findUser()
})

app.post('/login', (req,res)=>{
    var useremail= req.body.email;
    var userpassword= req.body.password;

    async function findUser() {
        try {
          var user = await User.findOne({ email: useremail });
          if (user) {
            storedHash= user.password
            bcrypt.compare(userpassword, storedHash, (err, result) => {
            if (err) {
              console.error(err);
            } 
            else if (result === true) {
                req.session.username = user.name;
                res.redirect('/list')
            } 
            else {
              var errorMessage= 'Password does not match'
              res.redirect('/login?error='+ encodeURIComponent(errorMessage))
            }
          });
        } 
        else {
          var errorMessage= 'Email does not exist'
          res.redirect('/register?error='+ encodeURIComponent(errorMessage))
        }
      }
      catch (err) {
        console.error(err);}
    }
findUser()
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/login');
    });
  });


app .get('/list', (req,res)=>{
    var username= req.session.username
    async function findUser() {
        try {
          var user = await User.findOne({ name: username });
          if (user) {
            res.render("list",{new_stuff: user})
        } 
        else {
          var errorMessage= 'Please log in'
          res.redirect('/login?error='+ encodeURIComponent(errorMessage))
        }
      }
      catch (err) {
        console.error(err);}
    }
findUser()

})

app.post('/list',(req,res)=>{
    var add= req.body.new_to_do;
    var username= req.session.username
    var updates={todo:add}
    var filter = {name:username };
    var update = { $push: { lists: updates } };
    User.updateOne(filter, update).exec()
    .then(result => {
      res.redirect('/list')
    })
    .catch(error => {
    });
})

app.post('/delete/:item', function(req,res){
    check= req.body.bod
    del= req.params.item
    var username= req.session.username
    if (check==='on'){
        var updates={todo:del}
        var filter = {name:username };
        User.updateOne(filter, { $pull: { lists: updates } }).exec()
        .then(result => {
          res.redirect('/list')
        })
        .catch(error => {
        });
    }
})

app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/login');
    });
  });


app.listen(process.env.PORT||port, () => {
    console.log(`Example app listening on port ${port}`);
  })
  