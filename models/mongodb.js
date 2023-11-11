
//mongodb.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    notification: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
    }]
});

const User = mongoose.model('User', userSchema);

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }],
    rating: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rating'
    }],
  
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

const userInteractionSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String, 
        required: true,
    },
    time:{
        type: Date,
        default: Date.now,
    }
   
});

const Notification = mongoose.model('Notification', notificationSchema);

const searchSchema = new mongoose.Schema({
    keywords: {
        type: [String],
        required: true,
    },
    categories: {
        type: [String],
    },
    authors: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    },
    time: {
        type: Date,
        default: Date.now, // Set a default value to the current timestamp
    }
});

const Search = mongoose.model('Search', searchSchema);

const commentschema = new mongoose.Schema({
    comment: {
        type: [String],
        required: true,
    },
    author: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    },
    time: {
        type: Date,
        default: Date.now,
    },
    Commented_blog:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'BlogPost',
    }
});
const comment = mongoose.model('comment', commentschema);

const ratingschema = new mongoose.Schema({
    rating: {
        type: [String],
        required: true,
    },
    author: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    },
    Rated_blog:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'BlogPost',
    }
 
});
const rating = mongoose.model('rating', ratingschema);

module.exports = { User, BlogPost, UserInteraction, Notification, Search, comment, rating };
