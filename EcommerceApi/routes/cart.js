const router = require("express").Router();
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const { verifyToken } = require("./verifyToken");

router.get("/cart", verifyToken, async(req, res)=>{
    Cart.findOne({userId: req.user.id},(err,p)=>{
        if(err) {
            return res.status(400).send("error finding cart items");
        }
        return res.status(200).send(p);
    })
});

router.post("/del-cart", verifyToken, async (req, res)=> {
    Cart.updateOne({userId: req.user.id},{"$pull":{products:{productId: req.body.productId}}},
    {safe: true, multi: false},(err,c)=>{
        if(err) {
            return res.status(500).send(JSON.stringify("error deleting cart item"));
        }
        if(c) {
            return res.status(200).send(JSON.stringify("cart item successfully deleted"))
        }

        return res.status(500).send(JSON.stringify("error deleting cart item"));
    });
});

router.post("/cart", verifyToken, async (req, res)=> {
    console.log("request recieved");
    if(req.body.productId==null ||
        req.body.productId=="") {
        return res.status(400).send(JSON.stringify("some fields are empty"));
    }

    try {
        let exists = await Cart.findOne(
            {userId: req.user.id}
        );
        if(exists!=null) {
            let flag = JSON.stringify(exists.toJSON().products).includes(req.body.productId);
            if(flag) {
                return res.status(500).send(JSON.stringify("error, this product is already in your cart"));
            }
        }

        let prod = await Product.findById(req.body.productId);
        if(prod==null) {
            return res.status(400).send(JSON.stringify("product not found"));
        }
        let quantity = 1;
        if(req.body.quantity!=null && req.body.quantity!=""){
            quantity = req.body.quantity;
        }
        var cart = new Cart({
            userId: req.user.id,
            products: {
                productId: req.body.productId,
                product: prod,
                quantity: quantity,
            },
        });

        Cart.findOneAndUpdate({userId: req.user.id},{"$push":{products: cart.products}},async (err, c)=>{
            if(c) {
                return res.status(200).send(JSON.stringify("cart updated successfully"));
            }
            await cart.save();
            return res.status(200).send(JSON.stringify("cart updated successfully"));
        })
    } catch (err) {
        console.log(err)
        return res.status(400).send(JSON.stringify("error occurred updating cart"));
    }

})

router.post("/cart-quantity", verifyToken, async (req, res)=> {
    if(req.body.quantity==null || req.body.quantity=="") {
        return res.status(500).send(JSON.stringify("quantity should not be empty"));
    }
    if(req.body.pid==null || req.body.pid=="") {
        return res.status(500).send(JSON.stringify("product id should not be empty"));
    }

    try {
        Cart.findOne(
            {userId: req.user.id}
        ).then(c=>{
            let item = c.products.filter(x=>{return x.productId==req.body.pid;});
            console.log(c.products, req.body.pid)
            item[0]["quantity"] = req.body.quantity;
            c.save();
            return res.status(200).send(JSON.stringify("updated"))
        })
    } catch (error) {
        return res.status(500).send(JSON.stringify("error occured updating cart!"));
    }
})

module.exports = router;