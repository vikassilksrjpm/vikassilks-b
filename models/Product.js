const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      enum: ['womens', 'mens', 'sarees']
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      lowercase: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
