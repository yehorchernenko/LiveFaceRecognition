const express = require('express');
const router = express.Router();
const cmd = require('node-cmd');
const FaceRecognizer = require('../models/FaceRecognizer');
const enterSnapshotPath = 'snapshots/enterSnapshot';
const fs = require('fs');
const path = require('path');
const User = require('../entities/User');
const _ = require('lodash');
let faceRecon = new FaceRecognizer();
let exec = require('sync-exec');


const tmpStoragePath = 'tmp/uploads/';

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpStoragePath)
  },
  filename: function (req, file, cb) {
    /** filed with image must be last otherwise body won't be reachable*/
    console.log(req.body);
    cb(null, req.body.email + '_' + file.originalname);
  }
});

var upload = multer({ storage: storage }).array('images');


var enterCameraUrl = null;

setInterval(() => {
  if (enterCameraUrl != null) {
    try {
      let imagePath = path.resolve(enterSnapshotPath,`${(new Date()).getMilliseconds()}.jpg`);

      exec(`ffmpeg -i ${enterCameraUrl} -vframes 1 ${imagePath}`, 2500);
      faceRecon.predict(imagePath);

      fs.unlink(imagePath, (err) => {
        if (err) { console.log(err); }
      })

    } catch (err) {
      console.log(err);
    }
  }
}, 5000);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200);
});

router.post('/startRecognition', function (req, res) {
  enterCameraUrl = req.body.enterCameraUrl;

  res.send({"message": "Recognition started"});
});

router.post('/user/new', upload, function (req, res) {

  let body = _.pick(req.body, ['displayName','email']);
  let user = new User(body);

  user.save().then((newUser) => {
    console.log('User created');

    faceRecon.cropImages(req.body.email, tmpStoragePath);


    faceRecon.trainFaceByUser(newUser);

    emptyTmpDir(req.body.email);
    res.sendStatus(200)

  }).catch(error => {
    emptyTmpDir(req.body.email);
    console.log(`User creation error ${error}`);

    res.sendStatus(404)
  });

});

router.post('/user/predict', upload, function (req, res) {
  const imgsPath = path.resolve(tmpStoragePath);
  const imgFiles = fs.readdirSync(imgsPath);

  imgFiles.forEach(imgPath => {
    faceRecon.predict(path.resolve(imgsPath, imgPath))
  });

  emptyTmpDir();

  res.sendStatus(200);
});

function emptyTmpDir(fileName) {
  fs.readdir(tmpStoragePath, (err, files) => {
    files.forEach((file) => {
      if (file.includes(fileName)) {
        fs.unlink(path.resolve(tmpStoragePath, file), (removeErr) => {
          if (removeErr) { throw  removeErr }
        })
      }

    })
  });
}

module.exports = router;
