const express = require('express');
const router = express.Router();
const cmd = require('node-cmd');
const FaceRecognizer = require('../models/FaceRecognizer');
const enterSnapshotPath = 'snapshots/enterSnapshot';
const fs = require('fs');
const path = require('path');
const User = require('../entities/User');
const Visitor = require('../entities/Visitor');
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

    if (prediction.distance < 0.6) {
      console.log(prediction);
      defineVisitorFor(prediction.className, true);

      emptyTmpDir('jpg').then(() => {
        res.status(200).send(prediction);
      });
    }
  });
});

router.post('/user/predict/exit', upload, function (req, res) {
  const imgsPath = path.resolve(tmpStoragePath);
  const imgFiles = fs.readdirSync(imgsPath);

  imgFiles.map(imgPath => {
    let prediction = faceRecon.predict(path.resolve(imgsPath, imgPath));

    if (prediction.distance < 0.6) {
      console.log(prediction);
      defineVisitorFor(prediction.className, false);

      emptyTmpDir('jpg').then(() => {
        res.status(200).send(prediction);
      });
    }
  });
});

function defineVisitorFor(email, isEnter) {
  User.findOne({email: email}, (err, user) => {
    if (!err && user) {
      Visitor.findOne({'user.email': user.email}, (err, visitor) => {
        if (err) {
          console.log(`Fetching visitors error: ${err}`)

        } else if (visitor) {
          console.log(isEnter + ' ' + visitor.isPresent);

          if (isEnter && !visitor.isPresent) {
            let now = new Date();

            Visitor.findOneAndUpdate({'user.email': user.email}, {$set: {
                isPresent: true,
                visitedAt: now
            }}, (err) => {
              if (err) {
                console.log(`Error when updating visitor on enter ${err}`)
              } else {
                console.log(`User ${visitor.user.displayName} entered office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`)
                console.log(`Present time ${visitor.presentTime / 1000 | 0}`)
              }
            });

          } else if (!isEnter && visitor.isPresent){
            let now = new Date();
            let presentTime = now - visitor.visitedAt;

            Visitor.findOneAndUpdate({'user.email': user.email}, {$set: {
                isPresent: false,
                presentTime: presentTime + visitor.presentTime
              }}, (err) => {
              if (err) {
                console.log(`Error when updating visitor on enter ${err}`)
              } else {
                console.log(`User ${visitor.user.displayName} exit office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`)
                console.log(`Present time ${(presentTime + visitor.presentTime) / 1000 | 0}`)
              }
            });

          } else {
            console.log(`User ${user.displayName} is cheating`);
          }


        } else {
          let newVisitor = new Visitor({
            user: {
              _id: user._id,
              email: user.email,
              displayName: user.displayName
            }
          });
          newVisitor.save().then( vistor => {
            console.log(`Welcome ${vistor.user.displayName}`)
          }).catch(err => { if (err) console.log(`Error during register new visitor ${err}`) })
        }
      });
    }
  });

}

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
