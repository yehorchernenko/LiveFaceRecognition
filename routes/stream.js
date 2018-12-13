const express = require('express');
const router = express.Router();
const cmd = require('node-cmd');
const faceCrop = require('../models/FaceCrop');
const enterSnapshotPath = './snapshots/enterSnapshot';

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/uploads/')
  },
  filename: function (req, file, cb) {
    console.log(req.body);
    cb(null, req.body.email + '_' + file.originalname + '.jpg')
  }
});

var upload = multer({ storage: storage }).array('images');


var enterCameraUrl = null;

setInterval(() => {
  if (enterCameraUrl != null) {
    console.log('try');
    try {
      cmd.run(`ffmpeg -i ${enterCameraUrl} -vframes 1 ${enterSnapshotPath}${Date.now()}.jpg`);
      console.log('success');
    } catch (err) {
      console.log(err);
    }

  }
}, 1000);

/* GET home page. */
router.get('/', function(req, res, next) {
  faceCrop.startTraining();
  res.status(200);
});

router.post('/startRecognition', function (req, res) {
  enterCameraUrl = req.body.enterCameraUrl;

  res.send({"message": "Recognition started"});
});

router.post('/user/new', upload, function (req, res) {

  res.sendStatus(200)
});

module.exports = router;
