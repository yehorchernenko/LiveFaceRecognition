var express = require('express');
var router = express.Router();
var ffmpeg = require('ffmpeg');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({"message": "Stream app working!"});
});

router.post('/startRecognitionUrl', function (req, res) {
  console.log(req.body.url);
  res.send({"message": "Fuck you"});
});

module.exports = router;
