const { verifyToken } = require("./verifyToken");
const Order = require("../models/Order");
const product = require("./product");
const Product = require("../models/Product");

const router = require("express") .Router();

router.post("/order",verifyToken, async (req, res)=>{
    console.log(req.body)
    if(!req.body.userinfo || !req.body.amount || !req.body.products || req.body.products.length<1
        || !req.body.userinfo.name || !req.body.userinfo.phone || !req.body.userinfo.address) {
        return res.status(500).send(JSON.stringify("error, some required fields are empty"));
    }
    let order = new Order({
        userId: req.user.id,
        name: req.body.userinfo.name,
        phone: req.body.userinfo.phone,
        address: req.body.userinfo.address,
        products: req.body.products,
        amount: req.body.amount
    })

    try {
        let flag = await order.save();
        return res.status(200).send(JSON.stringify("order created successfully"))
    } catch (error) {
        return res.status(500).send(JSON.stringify(error));
    }
});

router.get("/order", verifyToken, async (req, res)=>{
    Order.find(async (error, o)=>{
        if(error) {
            return res.status(404).send(JSON.stringify("No order found!"));
        }
        
        var orders = [];
        await new Promise((resolve, reject)=>{
            o.map(async x=>{
                try {
                    var order = x.toJSON();
                    var products = [];
                    let prods = await Product.find({"_id":{$in: x.products.map(x=>x.productId)}});
                    if(prods) {
                        for(let i=0; i<prods.length; i++) {
                            let json = {
                                productId: x.products[i].productId,
                                product: prods[i],
                                quantity: x.products[i].quantity
                            }
                            products.push(json);
                        }
                        order.products = products;
                    }
                } catch(err) {
                    console.log("error pend")
                }
                orders.push(order);
                if(o.lastIndexOf(x)==o.length-1) {
                    resolve(true);
                }
                return x;
            })
        })

        return res.status(200).send(orders);
    })
});

router.get("/order/:userId", verifyToken, async (req,res)=>{
    if(!req.params.userId) {
        return res.status(500).send(JSON.stringify("error, some required fields are empty"));
    }
    Order.find({"userId":req.params.userId}, async (error, o)=>{
        if(error) {
            return res.status(404).send(JSON.stringify("No order found!"));
        }
        
        var orders = [];
        await new Promise((resolve, reject)=>{
            o.map(async x=>{
                try {
                    var order = x.toJSON();
                    var products = [];
                    let prods = await Product.find({"_id":{$in: x.products.map(x=>x.productId)}});
                    if(prods) {
                        for(let i=0; i<prods.length; i++) {
                            let json = {
                                productId: x.products[i].productId,
                                product: prods[i],
                                quantity: x.products[i].quantity
                            }
                            products.push(json);
                        }
                        order.products = products;
                    }
                } catch(err) {
                    console.log("error pend")
                }
                orders.push(order);
                if(o.lastIndexOf(x)==o.length-1) {
                    resolve(true);
                }
                return x;
            })
        })

        return res.status(200).send(orders);
    })
});

router.delete("/order", verifyToken, async (req, res)=>{
    if(!req.body.orderId) {
        return res.status(500).send(JSON.stringify("error, some required fields are empty"));
    }

    try {
       let flag = await Order.deleteOne({id: req.body.orderId});
       return res.status(200).send(JSON.stringify("order deleted successfully"));
    } catch (error) {
        return res.status(500).send(JSON.stringify("error deleting order!"));
    }
})
module.exports = router;