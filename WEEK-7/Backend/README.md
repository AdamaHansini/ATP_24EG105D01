1. Generate package.json
2. Create .env file
3. Create express app & assign port number
4. Connect to db
5. Define schemas and create Models
    - UserTypeSchema
        firstName
        lastName
        email(unique)
        password
        role
        profileImageUrl
        isUserActive


    - ArticleSchema
        author
        title
        category
        content
        comments
        isArticleActive


6. Implement APIs
7. Create common api for register, login and logout






### Frontend
    Dynamic, Responsive User Interfaces(UI== web page--->Browser)
                               HTML
                  CSS(styles & Responsiveness)  , Bootstrap, TailwindCSS    
    JavaScript
    ReactJS/Angular/Vue/NextJS        



# STORING FILES IN MERN APP

    Client                              Backend
    --------------------------------------------
    JSON                                req.body(exp.json()->body parser )  ---> DB
    Binary data(File)                   req.file ( multer ) ---> DB (X)

                                        3rd party cloud(AWS, Cloudinary)
                                            |
                                            CDN link of the file
                                            |
                                            Store in DB


- Install cloudinary & multer
        npm install cloudinary multer

















cloudinary.js
-------------
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default cloudinary;




cloudinaryUpload.js
-------------------
import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "blog_users" }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};



multer.js
---------
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  //to avoid RAM overflow
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  //for security validation
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      const err = new Error("Only JPG and PNG allowed");
      err.status = 400;
      cb(err, false);
    }
  },
});
