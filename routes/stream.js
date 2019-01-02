const express = require('express');
const router = express.Router();
const cmd = require('node-cmd');
const FaceRecognizer = require('../models/FaceRecognizer');
const VisitorChecker = require('../models/VisitorChecker');
const enterSnapshotPath = 'snapshots/enterSnapshot';
const fs = require('fs');
const path = require('path');
const User = require('../entities/User');
const Visitor = require('../entities/Visitor');
const _ = require('lodash');
const EmailService = require('../models/EmailService');
const generator = require('generate-password');
require('dotenv').config();

let faceRecon = new FaceRecognizer();
let visitorChecker = new VisitorChecker((message) => {
  console.log(message);
});
let emailService = new EmailService();

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200);
});

router.post('/startRecognition', function (req, res) {
  visitorChecker.enterCameraURL = req.body.enterCameraUrl;
  visitorChecker.exitCameraURL = req.body.exitCameraURL;

  res.send({"message": "Recognition started"});
});

router.post('/user/new', upload, function (req, res) {
  const password = generator.generate({
    length: 6,
    numbers: true
  });

  let user = new User({displayName: req.body.displayName, email: req.body.email, password: password});

  user.save().then((newUser) => {
    console.log('User created');

    emailService.sendPassword(newUser.email, password);

    faceRecon.cropImages(req.body.email, tmpStoragePath);
    faceRecon.trainFaceByUser(newUser);

    emptyTmpDir(req.body.email).then(() => {
      res.status(200).send('User created')
    });

  }).catch(error => {
    emptyTmpDir(req.body.email).then(() => {
      console.log(`User creation error ${error}`);
      res.status(404).send(`User creation error ${error}`);
    });
  });

});

router.post('/user/login', function (req, res) {
  User.findOne({email: req.body.email, password: req.body.pass}).then( user => {
      if (user) {
        res.status(200).json({message: 'Logged successfully'})
      } else {
        res.status(404).json({message: 'Invalid credentials'})
      }
  }).catch(err => {
      if (err) res.status(404).json({message: err});
  })
});

router.post('/user/profile', function (req, res) {
  User.findOne({email: req.body.email, password: req.body.pass}).then( user => {
    if (user) {
      Visitor.findOne({'user.email': user.email}).then(visitor => {
        res.status(200).json(visitor.toJSON());
      }).catch(() => {
        res.status(200).json({user: {displayName: user.displayName, email: user.email, message: 'Visitor info does not exist'}});
      })

    } else {
      res.status(404).json({message: 'Invalid credentials'})
    }
  }).catch(err => {
    if (err) res.status(404).json({message: err});
  })
});

router.post('/user/update', upload, function (req, res) {

  User.findOne({email: req.body.email}, (err, obj) => {
    if (err) res.send({message: `User update error: ${err}`}, 404);

    if (obj) {
      faceRecon.cropImages(obj.email, tmpStoragePath);
      faceRecon.addFacesFor(obj);

      emptyTmpDir(obj.email).then(() => {
        res.status(200).send({message: `Added new photo for email: ${req.body.email}`});
      });

    } else {
      emptyTmpDir(req.body.email).then(() => {
        res.status(404).send({message: `User not found for email: ${req.body.email}`});
      });
    }
  });

});

router.post('/user/predict/enter', upload, function (req, res) {
  const imgsPath = path.resolve(tmpStoragePath);
  const imgFiles = fs.readdirSync(imgsPath);

  imgFiles.map(imgPath => {
    let prediction = faceRecon.predict(path.resolve(imgsPath, imgPath));

    if (prediction && prediction.distance < 0.6) {
      visitorChecker.defineVisitorFor(prediction.className, true, (message) => {
        console.log(message)
      });

      emptyTmpDir('jpg').then(() => {
        res.status(200).send(prediction);
      });

    } else {
      emptyTmpDir('jpg').then(() => {
        res.status(404).json({message: "User not recognized"});
      });
    }
  });
});

router.post('/user/predict/exit', upload, function (req, res) {
  const imgsPath = path.resolve(tmpStoragePath);
  const imgFiles = fs.readdirSync(imgsPath);

  imgFiles.map(imgPath => {
    let prediction = faceRecon.predict(path.resolve(imgsPath, imgPath));

    if (prediction && prediction.distance < 0.6) {
      visitorChecker.defineVisitorFor(prediction.className, false, (message) => {
        console.log(message)
      });

      emptyTmpDir('jpg').then(() => {
        res.status(200).send(prediction);
      });
    } else {
      emptyTmpDir('jpg').then(() => {
        res.status(404).json({message: "User not recognized"});
      });
    }
  });
});

router.get('/visitor/list', function (req, res) {
  Visitor.find({}, (err, visitors) => {

    res.status(200).json(visitors.map((visitor) => visitor.toJSON()))
  });
});

router.post('/admin/login', function (req, res) {
  if (req.body.login === process.env.ADMIN_LOGIN && req.body.pass === process.env.ADMIN_PASS) {
    res.status(200).send({message: 'Admin successfully logged in'});
  } else {
    res.status(404).send({message: 'Incorrect password'});
  }
});

async function emptyTmpDir(fileName) {
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
