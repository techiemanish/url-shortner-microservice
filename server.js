// @Author : techiemanish
require('dotenv').config();
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : false}));
const cors = require('cors');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
var db = mongoose.connection;

//Schema
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url : String,
  short_url: Number
});

let URL = mongoose.model('URL', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res){
  let counter = db.collection('counters').findOne();
  var input_url = req.body.url;

  var data = {
    original_url : input_url
  }
  var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

  if(expression.test(input_url)){
    db.collection('url').insertOne(data, function(err, collection){
      if(err) return console.log(err);
      console.log("Record Save Successfully");
      counter.then(function(count){
        res.json({
          original_url : input_url,
          short_url: count["seq_value"]+1
        });
      })
    })
  }
  else{
    res.json({error : "invalid url"});
  }
  
});

app.get('/api/shorturl/:url_id?', function(req, res){
  let input = +req.params.url_id;
  let result = db.collection('url').findOne({short_url : input});
  result.then(function(result){
    if(result == null){
      res.status(404).json("Not found")
    }
    else{
      res.redirect(result["original_url"]);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
