const router = require("express").Router();
const Product = require("../models/Product");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

router.get("/product", async(req, res)=>{
    Product.find((err,p)=>{
        if(err) {
            return res.status(400).send("error finding products");
        }
        
        return res.status(200).send(p);
    })
});

router.get("/product/:id", async(req, res)=>{
    try {
        let product = await Product.findById(req.params.id);
        return res.status(200).send(product);
    } catch (error) {
        return res.status(400).send(JSON.stringify("error finding product"));
    }
});

router.post("/product", verifyTokenAndAdmin, async (req, res)=> {
    console.log("request recieved");
    if(req.body.title=="" || req.body.desc=="" 
    || req.body.img=="" || req.body.category=="" 
    || req.body.size=="" || req.body.color=="" || req.body.price=="") {
        return res.status(400).send("some fields are empty");
    }

    const product = new Product({
        title: req.body.title,
        desc: req.body.desc,
        img: req.body.img,
        category: req.body.category,
        size: req.body.size,
        color: req.body.color,
        price: req.body.price,
    });

    try {
        const savedProduct = await product.save();
        return res.status(200).send("product added successfully");
    } catch (error) {
        return res.status(400).send("error occurred creating product");
    }
})

router.post("/searchByKeyword",async (req, res)=>{
    if(req.body.keyword==null) {
        return res.status(500).send(JSON.stringify("keyword is empty"));
    }

    Product.find((err,p)=>{
        if(err) {
            return res.status(400).send(JSON.stringify("error finding products"));
        }

        return res.status(200).send(p.filter(x=>{
            return JSON.stringify(x).toLowerCase().includes(req.body.keyword.toLowerCase());
        }));
    })
})

module.exports = router;