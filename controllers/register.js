const redisClient = require('./signin').redisClient;
const redis = require('redis');
const REDIS_URL = 'redis://h:pf37a69565999be1543016a8a5bec744f7c8fe8313456fae39c4a41d543c76261@ec2-18-215-139-67.compute-1.amazonaws.com:32199'
const redisClient = redis.createClient(process.env.REDIS_URL);

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
				   		createSession(user[0]).then(session=>res.json(session))})
											  .catch(err=>res.status(400).json(err))
		}).then(trx.commit).catch(trx.rollback)
	})
	.catch(err=>res.status(400).json(err))
}

const setToken = (key,value) => {
	return Promise.resolve(redisClient.set(key,value));
}

const signToken = (email) => {
	const payload = { email };
	return jwt.sign(payload,'JWT_SECRET', {expiresIn: '2 days'} );
}

const createSession = (user) => {
	const { id,email } = user;
	const token = signToken(email);
	return setToken(email,id).then(()=>{ return { 'success':true,id,token } })
		   .catch(err=>res.status(400).json('error'))
}

module.exports = {
	handleRegister:handleRegister
};