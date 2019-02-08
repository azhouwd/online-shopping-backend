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
				   		res.json(user[0]);
				   })
		}).then(trx.commit).catch(trx.rollback)
	})
	.catch(err=>res.status(400).json(err))
}

module.exports = {
	handleRegister:handleRegister
};