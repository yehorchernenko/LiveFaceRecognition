const express = require('express');
const router = express.Router();
const cmd = require('node-cmd');
const faceCrop = require('../models/FaceCrop');
const enterSnapshotPath = './snapshots/enterSnapshot';
const fs = require('fs');
const path = require('path');

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/uploads/')
  },
  filename: function (req, file, cb) {
    /** filed with image must be last otherwise body won't be reachable*/
    console.log(req.body);
    cb(null, req.body.email + '_' + file.originalname)
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

  faceCrop.cropImages(req.body.email);
  fs.readdir('tmp/uploads', (err, files) => {
    files.forEach((file) => {
      if (file.includes(req.body.email)) {
        fs.unlink(path.resolve('tmp/uploads', file), (removeErr) => {
          if (removeErr) { throw  removeErr }
        })
      }

    })
  });

  res.sendStatus(200)
});

module.exports = router;
