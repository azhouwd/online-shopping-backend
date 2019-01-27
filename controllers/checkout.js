const handleCheckout = (req,res,db) =>{
	const {order_id,product_id,product_name,quantity,total_price,user_id} = req.body;
	db('order_table').returning('*')
	.insert({
		order_id:order_id,
		product_id:product_id,
		product_name:product_name,
		quantity:quantity,
		total_price:total_price,
		user_id:user_id
	}).then(response=>{
		res.json(response[0])
	}).catch(err=>console.log(err))
}

module.exports = {
	handleCheckout:handleCheckout
}