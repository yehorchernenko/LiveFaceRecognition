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

const cropImages = (name) => {
  const imgsPath = path.resolve('./tmp/uploads/');
  const imgFiles = fs.readdirSync(imgsPath);

  return imgFiles.map(file => path.resolve(imgsPath, file))
    .map(filePath => cv.imread(filePath))
    .map(img => img.bgrToGray())
    .map(getFaceImage)
    .filter(value => value != null)
    .map(faceImg => faceImg.resize(150, 150))
    .forEach(imgData => {
        cv.imwrite(`./uploads/${name}-${new Date().getMilliseconds()}.jpg`, imgData);
    });
};


module.exports.cropImages = cropImages;
