const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {User,UserPost} = require('./model/user');
const ObjectId = require('mongodb').ObjectId;


const app = express();
//setup path for '.env' file
dotenv.config();

//Mongodb Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database!!!!'))
  .catch(error => console.error(error));

app.use(express.json());

// Create new user
app.post('/user', async (req, res) => {
  const { name, email, password, role_id } = req.body;
  const user = new User({ name, email, password, role_id });
  await user.save();
  res.json(user);
});


// Create post
app.post('/:user_id/post', async (req, res) => {
  const { user_id } = req.params;
  const { post_message } = req.body;
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const post = new UserPost({ user_id, post_message });
  await post.save();
  await user.save();
  res.json(post);
});

//Edit post
app.patch('/post/:id', async (req, res) => {
  const post = await UserPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.user_id.toString() !== req.body.user_id) {
      return res.status(401).json({ message: 'Access denied' });
  }
  if (!post.previous_messages) {
    post.previous_messages = [];
  }
  post.previous_messages.push(post.post_message);
  post.post_message = req.body.post_message;
  await post.save();
  res.json(post);
});

// Delete post
app.delete('/post/:_id', async (req, res) => {
  const { _id } = req.params;
  const post = await UserPost.findById(_id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  post.is_active = false;
  await post.save();
  res.json(post);
});

//Get all posts by user id
app.get('/post/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const posts = await UserPost.find({ user_id, is_active: true });
  res.json(posts);
});

//Get User Information
app.get('/user/:user_id', async (req, res) => {
  try {
    const user = await User.aggregate([
        {
          $match: { _id: new ObjectId(req.params.user_id) }
        },
        {
                $lookup: {
                  from: 'roles',
                  localField: 'role_id',
                  foreignField: 'role_id',
                  as: 'role'
                }
        },
        {
                $project: {
                  _id: 0,
                  user_id: '$_id',
                  name: 1,
                  email: 1,
                  role_id: 1,
                  'role.role_name': '$role.role_name'
                 }
        }  
    ]);
    
    if (user.length > 0) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


//port
app.get('/', (req, res) => {
  res.send('Hello!')
})

app.listen(3000, () => {
    console.log("server running on 3000 port")
})