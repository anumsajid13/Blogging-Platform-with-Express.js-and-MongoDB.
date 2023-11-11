# Blogging Platform

This is a simple blogging platform developed using Node.js, Express.js, and MongoDB. The platform allows users to register, log in, create, update, and delete blog posts. It also includes features such as user roles, notifications, comments, and ratings.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Blog Operations](#blog-operations)
  - [User Operations](#user-operations)
  - [Admin Operations](#admin-operations)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/blogging-platform.git
2. Install Dependencies:

    ```bash
   cd blogging-platform
   npm install
   npm install express
   npm install mongoose

3. Start the Server:

    ```bash
    npm app.js

## Project Structure

The project follows the following structure:

- `app.js`: The main entry point for the application.
- `router/routes.js`: Contains all the API routes and middleware functions.
- `models/mongodb.js`: Defines MongoDB schemas for User, BlogPost, UserInteraction, Notification, Search, comment, and rating.

### Authentication

- **Register:** `POST /register`
  - Creates a new user account.

- **Login:** `POST /login`
  - Authenticates the user and returns a JSON web token.

- **Update Password:** `POST /profile/updatePass`
  - Updates the user's password.

- **Update Email:** `POST /profile/updateEmail`
  - Updates the user's email.

- **Create Blog:** `POST /profile/CreateBlog`
  - Creates a new blog post.

### Blog Operations

- **Read Blog:** `GET /profile/ReadBlog/:id`
  - Retrieves the content of a blog post.

- **Update Blog:** `PUT /profile/UpdateBlog/:id`
  - Updates an existing blog post.

- **Delete Blog:** `DELETE /profile/DeleteBlog/:id`
  - Deletes a blog post.

- **Filter Blogs by Date:** `GET /profile/filter/:date`
  - Filters blogs based on creation date.

- **Filter Blogs by Author:** `GET /profile/filterByAuthor/:author`
  - Filters blogs based on the author's username.

### User Operations

- **Follow User:** `POST /profile/follow/:userId`
  - Follows another user.

- **View My Followings:** `GET /profile/viewMyFollowings`
  - Retrieves the list of users being followed.

- **View My Followers:** `GET /profile/viewMyFollowers`
  - Retrieves the list of users following the current user.

- **Display Feed:** `GET /profile/DisplayFeed`
  - Displays the user's feed (blogs from followed users).

- **Notifications:** `GET /profile/Notifications`
  - Retrieves user notifications.

### Admin Operations

- **List Users:** `GET /admin/ListUsers`
  - Retrieves a list of all users.

- **Disable User:** `GET /admin/DisableUser/:id`
  - Disables a user account.

- **List All Blogs:** `GET /admin/ListAllBlogs`
  - Retrieves a list of all blog posts.

- **View Blog:** `GET /admin/ViewBlog/:id`
  - Retrieves details of a specific blog post.

- **Disable Blog:** `GET /admin/DisableBlog/:id`
  - Disables a blog post.

## API Documentation

[Profile API Documentation](https://documenter.getpostman.com/view/30796738/2s9YXk2LhX)
[Blogs API Documentation](https://documenter.getpostman.com/view/30796738/2s9YXk2LhW)
[UserInteraction API Documentation](https://documenter.getpostman.com/view/30796738/2s9YXk2LhY)
[Admin API Documentation](https://documenter.getpostman.com/view/30796738/2s9YXk2LhV)

## Contributing

Feel free to contribute to this project. Create a fork, make your changes, and submit a pull request.

