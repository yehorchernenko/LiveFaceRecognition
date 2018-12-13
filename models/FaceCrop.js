const cv = require('opencv4nodejs');
const path = require('path');
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const fs = require('fs');
const fr = require('face-recognition');

const getFaceImage = (grayImg) => {
  const faceRects = classifier.detectMultiScale(grayImg).objects;
  if (!faceRects.length) {
    return null;
  }
  return grayImg.getRegion(faceRects[0]);
};

const cropImages = (name, tmp) => {
  const imgsPath = path.resolve(tmp);
  const imgFiles = fs.readdirSync(imgsPath);

  return imgFiles.map(file => path.resolve(imgsPath, file))
    .map(filePath => cv.imread(filePath))
    .map(img => img.bgrToGray())
    .map(getFaceImage)
    .filter(value => value != null)
    .map(faceImg => faceImg.resize(150, 150))
    .forEach(imgData => {
      let dirName = `./uploads/${name}/`;

      if (fs.existsSync(dirName)) {
        cv.imwrite(`${dirName}${new Date().getMilliseconds()}.jpg`, imgData);
      } else {
        fs.mkdirSync(dirName);

        cv.imwrite(`${dirName}${new Date().getMilliseconds()}.jpg`, imgData);
      }
    });
};


/* MARK: - Slow algorithm
const cropImagesWithFR = (name) => {
  const imgsPath = path.resolve('./tmp/uploads/');
  const imgFiles = fs.readdirSync(imgsPath);

  console.log('1fd')
  return imgFiles.map(file => path.resolve(imgsPath, file))
    .map(filePath => fr.loadImage(filePath))
    .map(img => fr.FaceDetector().detectFaces(img, 80))
    .filter(value => value != null)
    .forEach(images => {
      images.forEach(img => {
        fr.saveImage(path.resolve('./uploads', `${name}-${new Date().getMilliseconds()}.jpg`), img)
      })
    });
};*/


module.exports.cropImages = cropImages;
