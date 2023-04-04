const mongoose = require('mongoose');

//Define User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role_id: { type: Number, default: 2 },
  createdAt: { type: Date, default: Date.now }
});
 
//Define UserPost 
const userPostSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  post_message: { type: String, required: true },
  previous_messages: {type:Array ,message: String, timestamp: Date },
  is_active: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);
const UserPost = mongoose.model('UserPost', userPostSchema);

module.exports = {User,UserPost};