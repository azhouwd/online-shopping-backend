const redisClient = require('./signin').redisClient;

const requireAuth = (req,res,next) => {
	const { authorization } = req.headers;
	console.log(authorization);
	if(!authorization){
		res.status(401).json('unauthorized');
	}
	return redisClient.get(authorization,(err,reply)=>{
		if(err || !reply){
			res.status(401).json('unauthorized');
		}
	})
	return next();
}

module.exports = {
	requireAuth:requireAuth
}