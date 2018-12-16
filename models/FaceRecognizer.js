const path = require('path');
const fs = require('fs');
const fr = require('face-recognition');
const cv = require('opencv4nodejs');
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

const User = require('../entities/User');

class TrainRecognizer {

  constructor() {}

  trainFaceByUser(user) {
    const dataPath = path.resolve('./uploads/', user.email);
    const allFiles = fs.readdirSync(dataPath);

    const recognizer = fr.FaceRecognizer();

    let faces = allFiles.map(fp => fr.loadImage(path.resolve(dataPath, fp)));
    recognizer.addFaces(faces, user.email);

    const modelState = recognizer.serialize();
    fs.writeFileSync('./uploads/model.json', JSON.stringify(modelState));


    this.test(user)
  }

  getFaceImage (grayImg) {
    const faceRects = classifier.detectMultiScale(grayImg).objects;
    if (!faceRects.length) {
      return null;
    }
    return grayImg.getRegion(faceRects[0]);
  };

  cropImages (name, tmp) {
    const imgsPath = path.resolve(tmp);
    const imgFiles = fs.readdirSync(imgsPath);

    return imgFiles.map(file => path.resolve(imgsPath, file))
      .map(filePath => cv.imread(filePath))
      .map(img => img.bgrToGray())
      .map(this.getFaceImage)
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

  test(user) {
    const recognizer = fr.FaceRecognizer();
    const modelState = require('../uploads/model.json');

    const dataPath = path.resolve('./uploads/', user.email);
    const allFiles = fs.readdirSync(dataPath);

    recognizer.load(modelState);

    let faces = allFiles.map(fp => fr.loadImage(path.resolve(dataPath, fp)));

    faces.forEach((face,i) => {
      const prediction = recognizer.predictBest(face);

      console.log('%s (%s)', prediction.className, prediction.distance)

    })
  }

}

module.exports = TrainRecognizer;
