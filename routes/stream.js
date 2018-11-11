const express = require('express');
const router = express.Router();
const cmd=require('node-cmd');

const enterSnapshotPath = './snapshots/enterSnapshot.jpg';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({"message": "Stream app working!"});
});

router.post('/startRecognition', function (req, res) {

  cmd.run(`ffmpeg -i ${req.body.enterCameraUrl} -vframes 1 ${enterSnapshotPath}`);

  res.send({"message": "Image created"});
});

module.exports = router;
