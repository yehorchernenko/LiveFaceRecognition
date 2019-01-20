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
const exec = require('sync-exec');
const base64Img = require('base64-img');


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

    const dataPath = path.resolve('./uploads/', user.email);
    const allFiles = fs.readdirSync(dataPath)
      .map(fp => path.resolve(dataPath, fp))
      .map(fp => {
        return base64Img.base64Sync(fp);
      });

    User.findOneAndUpdate({_id: newUser._id}, {$set: {images: allFiles}}, (option, u) => {
      console.log('Images successfully added');
    });

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

router.post('/user/update/photo', upload, function (req, res) {

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

router.post('/user/open/door', function (req, res) {
  let email = req.body.email
  let isEnter = req.body.isEnter

  visitorChecker.defineVisitorFor(email, isEnter, (message) => {
    console.log(message);
    res.status(200).send({"email": email});
  });
});


router.get('/visitor/list', function (req, res) {
  Visitor.find({}, (err, visitors) => {

    res.status(200).json(visitors.map((visitor) => visitor.toJSON()))
  });
});


router.get('/user/list', function (req, res) {
  User.find({}, (err, visitors) => {

    res.status(200).json(visitors.map((visitor) => visitor.toJSON()))
  });
});

router.post('/user/delete', function (req, res) {
//TODO: - remove from net
  User.findOne({_id: req.body._id}, (options, result) => {
      exec(`rm -Rf ${path.resolve('./uploads/', result.email)}`);
      Visitor.findOneAndRemove(`user.email: ${result.email}`).then(() => {
        User.findOneAndRemove({_id: result._id}).then(() => {
          res.status(200).send();
        });
      })
  })
});

router.post('/admin/login', function (req, res) {
  if (req.body.login === process.env.ADMIN_LOGIN && req.body.pass === process.env.ADMIN_PASS) {
    res.status(200).send({message: 'Admin successfully logged in'});
  } else {
    res.status(404).send({message: 'Incorrect password'});
  }
});

router.post('/user/by/id', function (req, res) {
  User.findOne({_id: req.body.id}, (options, result) => {
    if (result === null) {
      res.status(404).send();
    } else {
      res.status(200).send(result.toJSON())
    }
  })
});

router.post('/user/update', function (req, res) {

  let newUser = {
    email: req.body.email,
    displayName: req.body.displayName,
    password: req.body.password
  };

  User.findOneAndUpdate({_id: req.body.id}, {$set: newUser }, (err, oldValue) => {
    if (err !== null) throw err;

    Visitor.findOneAndUpdate(`user.email: ${oldValue.email}`, {$set: {user: newUser}},(err2, result2) => {
      faceRecon.renameClass(oldValue.email, req.body.email);

      const oldPath = path.resolve('./uploads/', oldValue.email);
      const newPath = path.resolve('./uploads/', req.body.email);

      fs.rename(oldPath, newPath, err3 => {

        res.status(200).send();
     })
    })
  })
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
