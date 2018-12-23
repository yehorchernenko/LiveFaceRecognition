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

    this.enterSnapshoter = setInterval(() => {
      if (this.enterCameraURL != null && this.enterCameraURL !== '') {
        try {
          let imagePath = path.resolve(this.enterSnapshotPath,`${(new Date()).getMilliseconds()}.jpg`);

          exec(`ffmpeg -i ${this.enterCameraURL} -vframes 1 ${imagePath}`, 2500);

          let prediction = faceRecon.predict(imagePath);
          if (prediction) {
            let message = this.defineVisitorFor(prediction.className, true);
            if (message) onMessage(message);
          }

          fs.unlink(imagePath, (err) => {
            if (err) { console.log(err); }
          })

        } catch (err) {
          console.log(`Error occured on enter snapshot ${err}`);
        }
      }
    }, 5000);
  }

  defineVisitorFor(email, isEnter) {
    User.findOne({email: email}, (err, user) => {
      if (!err && user) {
        Visitor.findOne({'user.email': user.email}, (err, visitor) => {
          if (err) {
            console.log(`Fetching visitors error: ${err}`);
            return null
          } else if (visitor) {

            if (isEnter && !visitor.isPresent) {
              let now = new Date();

              Visitor.findOneAndUpdate({'user.email': user.email}, {$set: {
                  isPresent: true,
                  visitedAt: now
                }}, (err) => {
                if (err) {
                  console.log(`Error when updating visitor on enter ${err}`);
                  return null;

                } else {
                  // console.log(`User ${visitor.user.displayName} entered office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`)
                  // console.log(`Present time ${visitor.presentTime / 1000 | 0}`)
                  return `User ${visitor.user.displayName} entered office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}\n Present time ${visitor.presentTime / 1000 | 0}`;
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
                  console.log(`Error when updating visitor on enter ${err}`);
                  return null;

                } else {
                  // console.log(`User ${visitor.user.displayName} exit office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`)
                  // console.log(`Present time ${(presentTime + visitor.presentTime) / 1000 | 0}`)
                  return `User ${visitor.user.displayName} exit office at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}\n Present time ${(presentTime + visitor.presentTime) / 1000 | 0}`;
                }
              });

            } else {
              console.log(`User ${user.displayName} is cheating`);
              return null
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
              //console.log(`Welcome ${vistor.user.displayName}`)
              return `Welcome ${vistor.user.displayName}`;
            }).catch(err => {
              if (err) {
                console.log(`Error during register new visitor ${err}`);
                return null
              }
            })
          }
        });
      }
    });

  }

}

module.exports = VisitorChecker;
