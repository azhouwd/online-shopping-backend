const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient({host:'127.0.0.1'});

const handleSignin = (req,res,db,bcrypt) => {
	const { email,password } = req.body;
	if(!email || !password){
		return Promise.reject('Please fill in all the information');
	}
	return db.select('email','password').from('login')
	.where('email','=',email)
	.then(result=>{
		const isValid = bcrypt.compareSync(password,result[0].password);
		if(isValid){
			return db.select('*').from('users')
			.where('email','=',email)
			.then(response=>response[0])
			.catch(err=>Promise.reject('error logging in'))
		}else{
			Promise.reject('incorrect email or password');
		}
	}).catch(err=>Promise.reject('unable to get the user'))
}

const signToken = (email) => {
	const jwtPayload = {email};
	return jwt.sign(jwtPayload, 'JWT_SECRET', {expiresIn: '2 days'});
}

const getTokenId = (req,res) => {
	const { authorization } = req.headers;
	return redisClient.get(authorization, (err,reply)=>{
		if(err || !reply){
			return res.status(400).json('unauthorized');
		}
		return res.json({id:reply});
	} )
}

const setToken = (key,value) => {
	return Promise.resolve(redisClient.set(key,value))
}

const createSession = (user) => {
	const { email,id } = user;
	const token = signToken(email);
	return setToken(token,id)
		   .then(()=>{ return {'success':true, id, token} })
		   .catch(console.log)
}

const signinAuthentication = (req,res,db,bcrypt) => {
	const { authorization } = req.headers;
	return authorization ? getTokenId(req,res) : 
	handleSignin(req,res,db,bcrypt)
	.then(data=>{
		return data.id && data.email ? createSession(data) : Promise.reject(data)
	})
	.then(session=>res.json(session))
	.catch(err=>res.status(400).json(err)) 
}

module.exports = {
	handleSignin:handleSignin,
	signinAuthentication:signinAuthentication,
	redisClient:redisClient
}