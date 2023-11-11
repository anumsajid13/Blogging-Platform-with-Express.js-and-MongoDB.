
//routes.js

const express= require('express')
const mongoose = require('mongoose');
require('dotenv').config();
//const secretKey = process.env.SECRET_KEY;
console.log("secretKey:"+process.env.SECRET_KEY)
const router=express.Router()
const DB= require('../models/mongodb')
const secretKey = 'abc';

const jwt = require('jsonwebtoken');


router.get('/', (req, res)=>{
    res.send('Hello World!');
})


router.use((req, res, next) => {
  req.DB = DB;
  console.log(DB.User._id); 
  next();
});


router.post('/login', async (req, res) => {  //route for login
    const { username, password } = req.body;
    try {
        const user = await DB.User.findOne({ username, password });
        console.log("username: "+ username + "password"+ password)
        if (username=='admin' && password=='admin123') {
            
            res.send('Admin LoggedIn Successfully!');
           
            const token = jwt.sign({ username, _id:DB.User._id }, secretKey, { expiresIn: '5h' });
            console.log( 'secret-key: '+secretKey+' Admin token: '+ token )
        } 
        else if(username && password )
        {

          if(user && (user.isDisabled==false) )
            {
              //res.sendFile(path.join(__dirname, '../public', 'user.html'));
              const token = jwt.sign({ username, _id: DB.User._id }, secretKey, { expiresIn: '5h' });
              console.log( 'secret-key: '+secretKey+' token: '+ token )
              res.send('User LoggedIn Successfully!');
            }
            else{
              res.send('User Account is Disabled!');
            }
            
        }
        else {
           
            res.send('Authentication failed' + username +'&'+password);

        }

        
    } catch (error) {
     
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/register', async (req, res) => {// route to register a new user
    const { username, email, password } = req.body;

    try {
       
        const existingUser = await DB.User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ message: 'Username or email is already in use.' });
        }

        const role='user';
        const newUser = new DB.User({ username, email, password, role });

        
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const AllowAuthors = async (req, res, next) => {  //middleware
  try { 
    const blogId = req.params.id; 
    const blog = await DB.BlogPost.findById(blogId);

    // Check if the blog exists
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user._id;

      if (blog.author.toString() === userId.toString()) { //if the user is an author of the blog, allow access
      
        next();
      } else {
        return res.status(403).json({ message: 'This operation can only be performed by the author of the Blog' });
      }
     
   
  } catch (error) {
    console.error('Error checking blog accessibility:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const isBlogAccessible = async (req, res, next) => {
  try {
    const blogId = req.params.id; 
    const blog = await DB.BlogPost.findById(blogId);

    // Check if the blog exists
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user._id;
    // Check if the blog is disabled
    if (blog.disabled) {

      if (blog.author.toString() === userId.toString()) { //if the user is an author of the blog, allow access
      
        next();
      } else {
        return res.status(403).json({ message: 'Blog is disabled for the users oher than the author' });
      }
     
    }
    else{
      console.log("Blog not disabled")
      next();
    }

   
  } catch (error) {
    console.error('Error checking blog accessibility:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function verifyToken(req, res, next){   //authentcation middleware
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(token == null){
          return res.sendStatus(403);
  }
  if (!token) {
      return res.sendStatus(403);
  }
  else{
      console.log('Auth Header:', authHeader);

      console.log("secretKey: "+secretKey)
jwt.verify(token, secretKey, async (err, user) => {
  if (err) {
      console.log('JWT Verification Error:', err);
      return res.sendStatus(403);
  } else {
      
      req.user = user;
      const userDetails = await DB.User.findOne({ username: user.username });
     
      if (userDetails) {
          req.user.name = userDetails.name;
          req.user._id = userDetails._id;
          console.log(req.user._id);
      }

      console.log('Decoded User:', req.user);
      console.log(token);
      next();
  }
});
}
}


//update password
router.post('/profile/updatePass', verifyToken, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Both username and new password are required' });
      }
      console.log("Username: "+ username)
      console.log(" password: "+ password)
      console.log(" req.user.username: "+ req.user.username)
      if(req.user.username!=username)
      {
        return res.status(400).json({ message: 'You cannot update password for another user!' });
      }
      const updatedUser = await DB.User.findOneAndUpdate(
        { username: username },
        { password: password },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating user password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  //update email
router.post('/profile/updateEmail', verifyToken, async (req, res) => {
    try {
      const { username, email } = req.body;
      if (!username || !email) {
        return res.status(400).json({ message: 'Both username and new email are required' });
      }

      if(req.user.username!=username)
      {
        return res.status(400).json({ message: 'You cannot update email for another user!' });
      }

      console.log("Username: "+ username)
      console.log(" Email: "+ email)
      const updatedUser = await DB.User.findOneAndUpdate(
        { username: username },
        { email: email },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
      console.error('Error updating useremail:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  



  //Create blog
  router.post('/profile/CreateBlog',verifyToken, async (req, res) => {
    try {

      let authorId
      let user1;
      const authorUsername = req.user.username; 
      try {
          const user = await DB.User.findOne({ username: authorUsername }).exec();
          user1=user;
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
          authorId = user._id;
      } catch (error) {
          return res.status(500).json({ error: 'Internal Server Error' });
      }
        
      console.log(authorUsername)
      console.log(authorId)

      const { title, content } = req.body;
      const blogPost = new DB.BlogPost({ title, content, author: authorId }); 
      await blogPost.save();

      //for notification to all the followers 
      const followers = user1.followers; // Retrieve the followers

      // Create notifications for each follower
      followers.forEach(async (followerId) => {
        const notification = new DB.Notification({
          user: followerId,
          type: 'Notification: A new blog has been created by '+ authorUsername,
        });
        await notification.save();
      });

      res.status(201).json({ message: 'Blog Created' });
      
    } catch (error) {
      console.error('Error Creatng Blog:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
//Delete blog
router.delete('/profile/DeleteBlog/:id',verifyToken,AllowAuthors, async (req, res) => {
  try {
      console.log("nside delete!")
      const blogId = req.params.id;
      console.log("Blog id: "+ blogId)
      await DB.BlogPost.findByIdAndRemove(blogId);

      res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

//update blog
router.put('/profile/UpdateBlog/:id',verifyToken,AllowAuthors, async (req, res) => {
  const blogId = req.params.authorId;
  const updatedData = req.body;

  try {
    const existingBlog = await DB.BlogPost.findById(blogId);
    const updatedBlog = await DB.BlogPost.findByIdAndUpdate(
      blogId,
      updatedData,
      { new: true }
    );
      console.log(updatedData)
    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//read blog
router.get('/profile/ReadBlog/:id',verifyToken,isBlogAccessible, async (req, res) => {
  const blogId = req.params.id;
 
  try {
    const blog = await DB.BlogPost.findById(blogId)
    .populate('comments')
    .populate('rating')
    .exec();
    const blogtitle=blog.title;
    const content=blog.content;
    console.log(content)
    res.send(blogtitle+'\n'+content);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile/DisplayBlogs',async(req,res)=>{
  try {
  const blogs= await DB.BlogPost.find({disabled: { $ne: true }})
  const array=blogs;
  res.send(array);
  } catch (error) {
    console.error('Error displaying blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
})

router.get('/profile/filter/:date', async (req, res) =>{ //filter blog for creation date

  try {
      const filterDate = new Date(req.params.date); // Convert the date parameter to a Date object

     
      const blogs = await DB.BlogPost.find({
          createdAt: {
              $gte: filterDate, // Greater than or equal to filterDate
              $lt: new Date(filterDate.getTime() + 86400000) // Less than filterDate + 1 day (86400000 milliseconds in a day)
          },
          disabled: { $ne: true }
      })
      .populate('comments')
      .populate('rating')
      .exec();

      res.status(200).json(blogs);
    } catch (error) {
        console.error('Error filtering blogs by date:', error);
        res.status(500).json({ message: 'Server error' });
    }

})

router.get('/profile/filterByAuthor/:author', async (req, res) =>{ //filter blogs by author 

  try {
    const user_name = req.params.author;

    const author = await DB.User.findOne({ username: user_name }).exec();
    console.log(author);
    if (!author) {
        return res.status(404).json({ error: 'author not found' });
    }

    const authorId = author._id;

    const blog = await DB.BlogPost.find({ author: authorId, disabled: { $ne: true } })
    .populate({
      path: 'author',
      select: 'username', 
    })
    .populate('comments')
    .populate('rating')
    .exec();

  
    res.status(200).json(blog);
} catch (error) {
    console.error('Error retrieving blogs by user:', error);
    res.status(500).json({ message: 'Server error' });
}
})

router.post('/profile/blog/Comment/:id',verifyToken,isBlogAccessible,verifyToken, async (req, res) => {
  try {
    // console.log("inside")
      const blogId = req.params.id;
      const { comment: newComment } = req.body;

      // Find the blog post
      const blogPost = await DB.BlogPost.findById(blogId).exec();
      if (!blogPost) {
          return res.status(404).json({ error: 'Blog post not found' });
      }

      // Creating a new comment
      const comment = new DB.comment({
          comment: newComment,
          author: req.user._id, 
          Commented_blog: blogPost._id
      });

      await comment.save();

      //sending notfication 
      const blog = await DB.BlogPost.findById(blogId).exec(); // To Retrieve the blog
      const authorId = blog.author; // Get the author's ID

      const notification = new DB.Notification({
        user: authorId,
        type: 'Notifcation Comment has been added on your blog by'+req.user.username,
      });
      await notification.save();

      // Adding the comment to the blog post's comments array
      blogPost.comments.push(comment._id);
      await blogPost.save();

      res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


router.post('/profile/blog/Rate/:id',verifyToken, isBlogAccessible,verifyToken, async (req, res) =>{

  try {
     console.log("inside")
      const blogId = req.params.id;
      const { rating: newRating } = req.body;

      // Find the blog post
      const blogPost = await DB.BlogPost.findById(blogId).exec();
      if (!blogPost) {
          return res.status(404).json({ error: 'Blog post not found' });
      }

      // Creating a new rating
      const rating = new DB.rating({
          rating: newRating,
          author: req.user._id, 
          Rated_blog: blogPost._id
      });

      await rating.save();

      // Adding the comment to the blog post's comments array
      blogPost.rating.push(rating._id);
      await blogPost.save();

      res.status(201).json({ message: 'Rating added successfully' });
      } catch (error) {
          console.error('Error adding Rating:', error);
          res.status(500).json({ message: 'Server error' });
      }

})


router.get('/profile/blog/sort/date', async (req, res) =>{

     try {
      const blogs= await DB.BlogPost.find({disabled: { $ne: true }})
      .sort({ createdAt: 'desc' })
      .populate({
        path: 'author',
        select: 'username', 
      })
      .populate('comments')
      .populate('rating')
      .exec();
      const array=blogs;
      res.send(array);
      } catch (error) {
        console.error('Error displaying blog post:', error);
        res.status(500).json({ message: 'Server error' });
      }
})

router.post('/profile/follow/:userId',verifyToken, async (req, res) => {
  try {
      
      const following_Id = req.params.userId;
   //   const follower_Id =  req.user._id; 
       console.log("id: "+req.user._id)
      // Checking if the users exist
      const following = await DB.User.findById(following_Id).exec();
      const follower = await DB.User.findById(req.user._id).exec();

      console.log(following)
      console.log(follower)

      if ( !following) {
          return res.status(404).json({ error: 'User not found' });
      }

    
      if (follower.followings.includes(following_Id) || following.followers.includes(req.user._id)) {
          return res.status(400).json({ error: 'You already follow this user' });
      }

      follower.followings.push(following_Id);
      await follower.save();

      following.followers.push(req.user._id);
      await following.save();

      res.status(200).json({ message: 'Successfully followed user' });
  } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


router.get('/profile/viewMyFollowings',verifyToken, async (req, res) => {

  try {
    const userId = req.user._id;
    const user = await DB.User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followings = await DB.User.find({ _id: { $in: user.followings } })
    .select('username email')
    .exec();

    res.status(200).json({ followings });
  } catch (error) {
    console.error('Error retrieving followings:', error);
    res.status(500).json({ message: 'Server error' });
  }

});

router.get('/profile/viewMyFollowers',verifyToken, async (req, res) => {

  try {
    const userId = req.user._id;
    const user = await DB.User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await DB.User.find({ _id: { $in: user.followers } })
    .select('username email')
    .exec();

    res.status(200).json({ followers });
  } catch (error) {
    console.error('Error retrieving followers:', error);
    res.status(500).json({ message: 'Server error' });
  }

});

router.get('/profile/DisplayFeed',verifyToken, async (req, res) => { //display user's feed

  try {
    const userId = req.user._id;
    const user = await DB.User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followings = user.followings;

    // Finding blogs created by followers
    const blogs = await DB.BlogPost.find({ author: { $in: followings }, disabled: { $ne: true } })
      .populate('comments')
      .populate('rating')
      .exec();

    res.status(200).json({ blogs });
  } catch (error) {
    console.error('Error retrieving Blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }

})

router.get('/profile/Notifications',verifyToken, async (req, res) => { //To display notifications

  try {
   
    const notifications = await DB.Notification.find({ user: req.user._id }).exec(); // Retrieve notifications for the user
    res.json(notifications);
  } catch (error) {
    console.error('Error retrieving Notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }

})

router.get('/profile/SearchbyAuthor/:author', async (req, res) =>{ //search blogs by author 

  try {
    const user_name = req.params.author;

    const author = await DB.User.findOne({ username: user_name }).exec();
    console.log(author);
    if (!author) {
        return res.status(404).json({ error: 'author not found' });
    }

    const authorId = author._id;

    const blog = await DB.BlogPost.find({ author: authorId })
    .populate('comments')
    .populate('rating')
    .select('comments comment title content  rating rating author')
    .exec();

  
    res.status(200).json(blog);
} catch (error) {
    console.error('Error retrieving blogs by user:', error);
    res.status(500).json({ message: 'Server error' });
}
})


router.get('/profile/SearchbyBlog/:name', async (req, res) =>{ //search blogs by author 

  try {
    const blog_name = req.params.name;
    const blog = await DB.BlogPost.find({ title:blog_name, disabled: { $ne: true } })
    .populate('comments')
    .populate('rating')
    .exec();

  
    res.status(200).json(blog);
} catch (error) {
    console.error('Error retrieving blogs by user:', error);
    res.status(500).json({ message: 'Server error' });
}
})

router.get('/profile/SearchbyKeyword', async (req, res) =>{ //search blogs by KeyWords 

  try {
    const keyword = req.query.keyword;

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required for search' });
    }

    const blogs = await DB.BlogPost.find({ content: { $regex: keyword, $options: 'i' }, disabled: { $ne: true } })
      .populate('comments')
      .populate('rating')
      .exec();

    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error searching blogs by keyword:', error);
    res.status(500).json({ message: 'Server error' });
  }
})


function isAdmin(req, res, next) {  //Admin Middleware

  console.log("role:" + req.user.username)
  if (req.user && req.user.username === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Permission denied' });
  }
}

router.get('/admin/ListUsers', verifyToken, isAdmin, async (req, res) => {
  
  try {

    const users = await DB.User.find({ role: "user" }, '-password')
      .exec();

    res.status(200).json(users);
  } catch (error) {
    console.error('Error Dislying Users :', error);
    res.status(500).json({ message: 'Server error' });
  }
})

router.get('/admin/DisableUser/:id', verifyToken, isAdmin, async (req, res) => {
   
  try {

    const userId = req.params.id;
    const user = await DB.User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.isDisabled = true;
    await user.save();

    res.status(200).json({ message: 'User disabled successfully' });

  } catch (error) {
    console.error('Error Disabling Users :', error);
    res.status(500).json({ message: 'Server error' });
  }

})
  
router.get('/admin/ListAllBlogs', verifyToken, isAdmin, async (req, res) => {
   
  try {
        const blogs = await DB.BlogPost.find()
        .select('title author createdAt  disabled') 
        .populate('author', 'username') 
        .populate('comments')
        .exec();
        

         res.status(200).json(blogs);
   

      } catch (error) {
        console.error('Error Listing Blogs :', error);
        res.status(500).json({ message: 'Server error' });
      }

})

router.get('/admin/ViewBlog/:id', verifyToken, isAdmin, async (req, res) => {
   
  try {
        const blogId=req.params.id;
        const blogs = await DB.BlogPost.findById(blogId)
        .populate('author', 'username') 
        .exec();
  
         res.status(200).json(blogs);
   
      } catch (error) {
        console.error('Error Displaying Blog :', error);
        res.status(500).json({ message: 'Server error' });
      }
})

router.get('/admin/DisableBlog/:id', verifyToken, isAdmin, async (req, res) => {
   
  try {

    const BlogId = req.params.id;
    const blog = await DB.BlogPost.findById(BlogId);

    if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
    }

    blog.disabled = true;
    await blog.save();

    res.status(200).json({ message: 'Blog disabled successfully' });

  } catch (error) {
    console.error('Error Disabling Blog :', error);
    res.status(500).json({ message: 'Server error' });
  }

})
module.exports=router;