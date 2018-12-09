const cv = require('opencv4nodejs');
const path = require('path');
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
var fs = require('fs');

const getFaceImage = (grayImg) => {
  const faceRects = classifier.detectMultiScale(grayImg).objects;
  if (!faceRects.length) {
    return null;
  }
  return grayImg.getRegion(faceRects[0]);
};

const startTraining = () => {
  const imgsPath = path.resolve('./snapshots/');
  const imgFiles = fs.readdirSync(imgsPath);

  const images = imgFiles.map(file => path.resolve(imgsPath, file))
    .map(filePath => cv.imread(filePath))
    .map(img => img.bgrToGray())
    .map(getFaceImage)
    .filter(value => value != null)
    .map(faceImg => faceImg.resize(150, 150))
    .forEach(imgData => {
        cv.imwrite('./snapshots/face.jpg', imgData);
      // fs.writeFile('./snapshots/face.txt', imgData, 'binary', function(err){
      //   if (err) throw err;
      //   console.log('File saved.');
      // })
    });
};



module.exports.startTraining = startTraining;
