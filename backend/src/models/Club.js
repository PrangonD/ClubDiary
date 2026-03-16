const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a club name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description can not be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Academic', 'Sports', 'Cultural', 'Technology', 'Other'],
    default: 'Other'
  },
  admins: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Inactive'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Club', ClubSchema);
