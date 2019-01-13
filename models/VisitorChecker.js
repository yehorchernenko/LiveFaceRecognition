const FaceRecognizer = require('../models/FaceRecognizer');
const fs = require('fs');
const path = require('path');
const User = require('../entities/User');
const Visitor = require('../entities/Visitor');

let faceRecon = new FaceRecognizer();
let exec = require('sync-exec');

class VisitorChecker {

  constructor(onMessage) {
    this.enterSnapshotPath = 'snapshots/enterSnapshot';
    this.enterCameraURL = null;
    this.exitSnapshotPath = 'snapshots/exitSnapshot';
    this.exitCameraURL = null;

    this.enterSnapshoter = setInterval(() => {
      if (this.enterCameraURL != null && this.enterCameraURL !== '') {
        try {
          let imagePath = path.resolve(this.enterSnapshotPath,`${(new Date()).getMilliseconds()}.jpg`);

          exec(`ffmpeg -i ${this.enterCameraURL} -vframes 1 ${imagePath}`, 2500);

          let prediction = faceRecon.predict(imagePath);
          if (prediction) {
            this.defineVisitorFor(prediction.className, true, onMessage);
          }

          fs.unlink(imagePath, (err) => {
            if (err) { console.log(err); }
          })

        } catch (err) {
          console.log(`Error occurred on enter snapshot ${err}`);
        }
      }
    }, 5000);

    this.exitSnapshoter = setInterval(() => {
      if (this.exitCameraURL != null && this.exitCameraURL !== '') {
        try {
          let imagePath = path.resolve(this.exitSnapshotPath,`${(new Date()).getMilliseconds()}.jpg`);

          exec(`ffmpeg -i ${this.exitCameraURL} -vframes 1 ${imagePath}`, 2500);

          let prediction = faceRecon.predict(imagePath);
          if (prediction) {
            this.defineVisitorFor(prediction.className, false, onMessage);
          }

          fs.unlink(imagePath, (err) => {
            if (err) { console.log(err); }
          })

        } catch (err) {
          console.log(`Error occurred on exit snapshot ${err}`);
        }
      }
    }, 5000);
  }

  defineVisitorFor(email, isEnter, cb) {
    User.findOne({email: email}, (err, user) => {
      if (!err && user) {
        Visitor.findOne({'user.email': user.email}, (err, visitor) => {
          if (err) {
            console.log(`Fetching visitors error: ${err}`);
            cb(null);
          } else if (visitor) {
            let now = new Date();

            if (isEnter && !visitor.isPresent) {

              Visitor.findOneAndUpdate({'user.email': user.email}, {$set: {
                  isPresent: true
                }, $push: {
                  history: {
                    enteredAt: now,
                    exitedAt: null,
                  }
                }}, (err) => {
                if (err) {
                  console.log(`Error when updating visitor on enter ${err}`);
                  cb(null);

                } else {
                  // console.log(`User ${visitor.user.displayName} entered office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`)
                  // console.log(`Present time ${visitor.presentTime / 1000 | 0}`)
                  cb(`User ${visitor.user.displayName} entered office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
                }
              });

            } else if (!isEnter && visitor.isPresent){

              visitor.history[visitor.history.length - 1] = {
                enteredAt: visitor.history[visitor.history.length - 1].enteredAt,
                exitedAt: now,
              };

              Visitor.findOneAndUpdate({'user.email': user.email}, {$set: {
                  isPresent: false,
                  history: visitor.history
                }}, (err) => {
                if (err) {
                  console.log(`Error when updating visitor on enter ${err}`);
                  cb(null)

                } else {
                  // console.log(`User ${visitor.user.displayName} exit office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`)
                  // console.log(`Present time ${(presentTime + visitor.presentTime) / 1000 | 0}`)
                  cb(`User ${visitor.user.displayName} exit office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
                }
              });

            } else {
              cb(`User ${user.displayName} is cheating`);
            }


          } else {
            let newVisitor = new Visitor({
              user: {
                _id: user._id,
                email: user.email,
                displayName: user.displayName
              },
              isPresent: true,
              history: [{
                enteredAt: (new Date()),
                exitedAt: null,
              }]
            });
            newVisitor.save().then( vistor => {
              //console.log(`Welcome ${vistor.user.displayName}`)
              cb(`Welcome ${vistor.user.displayName}`);
            }).catch(err => {
              if (err) {
                console.log(`Error during register new visitor ${err}`);
                cb(null);
              }
            })
          }
        });
      }
    });

  }

}

module.exports = VisitorChecker;
