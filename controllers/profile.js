const handleProfileUpdate = (req,res,db) => {
	const { id,name,phone,address } = req.body;
	db('users').where('id','=',id).update({
		name:name,
		phone:phone,
		address:address
	}).then(resp=>{
		if(resp){
			res.json('successfully update')
		}
		else{
			res.status(400).json('error')
		}
	}).catch(err=>console.log(err))
}

const handleProfileGet = (req,res,db) => {
	const { id } = req.params;
	db.select('*').from('users')
	  .where('id','=',id)
	  .then(result=>res.json(result[0]))
	  .catch(err=>res.json(err));
}

const handleOrderGet = (req,res,db) => {
	const { id } = req.params;
	db.select('*').from('order_table')
	  .where('user_id','=',id)
	  .then(result=>res.json(result))
	  .catch(err=>console.log(err))
}

module.exports = {
	handleProfileUpdate:handleProfileUpdate,
	handleProfileGet:handleProfileGet,
	handleOrderGet:handleOrderGet
}