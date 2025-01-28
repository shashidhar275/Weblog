require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.port || 8000;
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const Blog = require('./models/blog');

mongoose.connect(process.env.MONGO_URL)
.then(e=>console.log('MongoDB connected'));

app.use(express.static(path.resolve('./public')));
app.set('view engine','ejs');
app.set('views',path.resolve('./views'));

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.get('/',async (req,res)=>{
    const allBlogs = await Blog.find({}); 
    console.log(req.user);
    res.render('home',{
        user: req.user,
        blogs: allBlogs
    });
})

app.use('/user',userRoute);
app.use('/blog',blogRoute);

app.listen(port,()=> console.log(`Server started at port${port}`));