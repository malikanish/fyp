const mongoose = require("mongoose");

const Products = new mongoose.Schema({
  productId: {type:String},
  product:{
      type: Object,
  },
  quantity:{
      type: String,
      default:1,
  },
})

const CartSchema = new mongoose.Schema(
    {
  userId: { type: String, required: true, unique: true },
  products: [
    Products
  ],

},
{timestamps:true}
);

module.exports = mongoose.model("Cart", CartSchema);
