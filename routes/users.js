const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let User = require('../models/user');

router.get('/register', function(req, res){
  res.render('register');
});

router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();
  User.findOne({username}, function(err,users){
    if(users){
      console.log("that username already taken!");
      req.flash('success', 'That user Name already taken');
      res.redirect('/users/register');
    } else {
      let newUser = new User({
        name:name,
        email:email,
        username:username,
        password:password
      });
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(function(err){
            if(err){
              console.log(err);
              return;
            } else {
              req.flash('success','Success');
              res.redirect('/users/login');
            }
          });
        });
      });
    }
  })
});

router.get('/secret',Secret,function(req, res){
  res.render('secret');
});

router.get('/login', function(req, res){
  res.render('login');
});

router.post('/login', function(req, res, next){
  if(req.body.username=='admin' &&req.body.password=='admin'){
    res.redirect('/users/admin')
  }else{
    passport.authenticate('local', {
      successRedirect:'/',
      failureRedirect:'/users/login',
      failureFlash: true
    })(req, res, next);
  }
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

router.get('/admin',function(req,res){
  User.find({}, function(err,user){
    res.render('admin',{
      title: 'This is just a users list',
      users : user
    })
  })
})

router.get('/:id',function(req,res){
  let id = req.params.id;
  User.findById(id, function(err,user){
      res.render('users',{
          title: 'Users:',
          users: user
      })
  })
})

router.get('/edit/:id',function(req,res){
  let id = req.params.id;
  User.findById(id, function(err,user){
      res.render('edit',{
          title: 'Edit',
          users: user
      })
  })
})

router.post('/edit/:id', function(req,res){
  let user = {};
  user.username= req.body.username;
  user.name =req.body.name;
  user.email =req.body.email;
  let query = {_id:req.params.id}

  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(req.body.password, salt, function(err, hash){
      if(err){
        console.log(err);
      }
      user.password = hash;
      User.updateOne(query, user, function(err){
        if(err){
            console.log(err);
            return;
        } else{
          console.log('hello');
            res.redirect('/users/'+user._id);
        }
    })
    });
  });

  
})

// 

router.delete('/:id', function(req,res){
  let query = {_id:req.params.id}
  User.deleteOne(query, function(err){
      if(err){
          console.log(err)
      }
      res.send('Success');
  })
})



function Secret(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}
module.exports = router;
