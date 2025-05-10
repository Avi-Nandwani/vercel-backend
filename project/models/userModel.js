const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zip_code: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Create text index for search functionality
userSchema.index({ 
  first_name: 'text', 
  last_name: 'text', 
  email: 'text',
  city: 'text',
  country: 'text'
});

const User = mongoose.model('User', userSchema);

module.exports = User;