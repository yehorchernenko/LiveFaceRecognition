const express = require('express');
const router = express.Router();
const cmd=require('node-cmd');

const enterSnapshotPath = './snapshots/enterSnapshot';

var enterCameraUrl = null;

setInterval(() => {
  console.log('enterd');
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
  res.send({"message": "Stream app working!"});
});

router.post('/startRecognition', function (req, res) {
  enterCameraUrl = req.body.enterCameraUrl;

  res.send({"message": "Recognition started"});
});

module.exports = router;
