const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const checkout = require('./controllers/checkout');
const profile = require('./controllers/profile');
const auth = require('./controllers/authorization');

const db = knex({
	client: 'pg',
	connection: {
    host : '127.0.0.1',
    user : 'dumplingman',
    password : '',
    database : 'shopping'
  }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/',(req,res)=>{res.json('success')});
app.post('/register',(req,res)=>{register.handleRegister(db,bcrypt,req,res)});
app.post('/signin',(req,res)=>{signin.signinAuthentication(req,res,db,bcrypt)});
app.post('/checkout',(req,res)=>{checkout.handleCheckout(req,res,db)});
app.post('/updateProfile/',(req,res)=>{profile.handleProfileUpdate(req,res,db)});
app.get('/profile/:id',(req,res)=>{profile.handleProfileGet(req,res,db)});
app.get('/getOrderHistory/:id',(req,res)=>{profile.handleOrderGet(req,res,db)})

app.listen(process.env.PORT || 3000, ()=>{
	console.log(`app is running on ${process.env.PORT}`)
});