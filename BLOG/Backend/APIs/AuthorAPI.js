import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";
export const authorApp = exp.Router();

//Write article (protected route)
authorApp.post("/article", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    //get articleObj from client
    const articleObj = req.body;
    //get user from decoded token
    let user = req.user;
    //check author exists first
    let author = await UserModel.findById(articleObj.author);
    if (!author) {
      return res.status(404).json({ message: "Invalid author" });
    }
    //cross check emails
    if (author.email != user.email) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    //create article Document
    const articleDoc = new ArticleModel(articleObj);
    //save
    await articleDoc.save();
    //send res
    res.status(201).json({ message: "Article published successfully" });
  } catch (err) {
    next(err);
  }
});

//Read own articles
authorApp.get("/articles", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    //get author id from decoded token
    const authorIdOfToken = req.user?.id;
    //get articles by author id
    const articlesList = await ArticleModel.find({ author: authorIdOfToken });
    //send res
    res.status(200).json({ message: "articles", payload: articlesList });
  } catch (err) {
    next(err);
  }
});

//Edit article
authorApp.put("/articles", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    //get author id from decoded token
    const authorIdOfToken = req.user?.id;
    //get modified article from client
    const { articleId, title, category, content } = req.body;
    const modifiedArticle = await ArticleModel.findOneAndUpdate(
      { _id: articleId, author: authorIdOfToken },
      { $set: { title, category, content } },
      { new: true },
    );

    //if either article id or author not correct
    if (!modifiedArticle) {
      return res.status(403).json({ message: "Not authorized to edit article" });
    }
    //send res
    res.status(200).json({ message: "Article modified", payload: modifiedArticle });
  } catch (err) {
    next(err);
  }
});

//Delete article(soft delete)
authorApp.patch("/articles", verifyToken("AUTHOR"), async (req, res, next) => {
  try {
    //get author id from decoded token
    const authorIdOfToken = req.user?.id;
    //get modified article from client
    const { articleId, isArticleActive } = req.body;
    //get article by id
    const articleOfDB = await ArticleModel.findOne({ _id: articleId, author: authorIdOfToken });
    if (!articleOfDB) {
      return res.status(404).json({ message: "Article not found or not authorized" });
    }
    //check status
    if (isArticleActive === articleOfDB.isArticleActive) {
      return res.status(200).json({ message: "Article already in the same state" });
    }

    articleOfDB.isArticleActive = isArticleActive;
    await articleOfDB.save();
    //SEND RES
    res.status(200).json({ message: "Article modified", payload: articleOfDB });
  } catch (err) {
    next(err);
  }
});
