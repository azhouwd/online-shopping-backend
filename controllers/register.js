const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = require('./signin').redisClient;

const handleRegister = (db,bcrypt,req,res) => {
	const { email,name,password,phone,address } = req.body;
	if(!email || !name || !password || !phone){
		return res.status(400).json('incomplete registration information');
	}
	db('users').where('email',email).returning('*').then(result=>{
		if(Object.getOwnPropertyNames(result[0]).length!==0){
			return res.status(400).json('user already exists');
		}
	})
	const hash = bcrypt.hashSync(password,10);
	db.transaction(trx=>{
		trx.insert({
			email:email,
			password:hash
		})
		.into('login').returning('email')
		.then(loginEmail=>{
			return trx('users').returning('*')
				   .insert({
				   		email:loginEmail[0],
				   		phone:phone,
				   		name:name,
				   		address:address
				   })
				   .then(user=>{
				   		createSession(user[0]).then(session=>res.json(session))
						.catch(console.log)
				   })
		}).then(trx.commit).catch(trx.rollback)
	})
	.catch(err=>res.status(400).json(err))
}

const setToken = (key,value) => {
	return Promise.resolve(redisClient.set(key,value));
}

const createSession = (user) => {
	const { email.id } = user;
	const token = signToken(email);
	return setToken(token,id).then(()=>{ return { 'success':true,token,id } })
		   .catch(console.log)
}

const signToken = (email) => {
	const jwtPayload = { email };
	return jwt.sign(email,'shit so lit',{guess:'what'});
}

module.exports = {
	handleRegister:handleRegister
};