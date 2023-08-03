const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/articleDB", {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = {
    title: String,
    content: String,
    paragraph1: String,
    paragraph2: String,
    paragraph3: String,
    paragraph4: String,
    conclusion: String
};

const feedbackSchema = {
    feedbackFName : String,
    feedbackLName : String,
    feedbackEmail : String,
    feedbackText : String
};

const Article = mongoose.model("Article", articleSchema);

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.post("/", function(req, res){
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    const url = "url";
    
    const options = {
        method: "POST",
        auth: "auth"
    }

    const request = https.request(url, options, function(response){

        if(response.statusCode === 200){
            res.render("success");           
        } else {
            res.render("failure");
        }

        response.on("data", function(data){
            console.log(JSON.parse(data));
        })
    });

    request.write(jsonData);
    request.end();

});

app.post("/failure", function(req, res){
    res.redirect("/");
});

app.get("/news", function(req, res){
    Article.find({}).then(articles =>{
        res.render("news", {
            articles: articles
        });
    }).catch(err=>{
        console.log(err);
    })
    
});

app.get("/compose", function(req, res){
    res.render("compose");
});

app.post("/compose", function(req, res){
    const article = new Article({
        title: req.body.articleHeading,
        content: req.body.articleIntroduction,
        paragraph1: req.body.articleParagraph1,
        paragraph2: req.body.articleParagraph2,
        paragraph3: req.body.articleParagraph3,
        paragraph4: req.body.articleParagraph4,
        conclusion: req.body.articleConclusion

    });
    article.save();
    res.redirect("/");
});

app.get("/articles/:articleId", function(req, res){
    const requestedArticleId = req.params.articleId;

    Article.findOne({_id: requestedArticleId}).then(
        article =>{
            res.render("article", {
                title: article.title,
                content: article.content,
                paragraph1: article.paragraph1,
                paragraph2: article.paragraph2,
                paragraph3: article.paragraph3,
                paragraph4: article.paragraph4,
                conclusion: article.conclusion
            })
        }
    ).catch(
        err=>{
            console.log(err);
        }
    );
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/contact", function(req, res){
    res.render("contact");
});

app.post("/contact", function(req, res){
    const feedback = new Feedback({
        feedbackFName : req.body.feedbackFName,
        feedbackLName : req.body.feedbackLName,
        feedbackEmail : req.body.feedbackEmail,
        feedbackText : req.body.feedbackText
    });
    feedback.save();
    res.redirect("/feedback");
});

app.get("/feedback", function(req, res){
    res.render("feedback");
});

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});