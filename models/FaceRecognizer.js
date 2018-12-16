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
    if (fs.existsSync('./uploads/model.json')) {
      fs.readFile('./uploads/model.json', function (err, data) {
        if (err) throw new Error('Unable to open model.json');

        var json = JSON.parse(data);

        modelState.forEach(value => {
          json.push(value);
        });

        console.log(json.length);
        fs.writeFileSync('./uploads/model.json', JSON.stringify(json));
      })
    } else {
      fs.writeFileSync('./uploads/model.json', JSON.stringify(modelState));
    }
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

      console.log('%s (%s)', prediction.className, prediction.distance);

    })
  }

  predict(imgPath) {
    console.log(imgPath);
    let image = this.getFaceImage(cv.imread(imgPath).bgrToGray())

    if (image) {
      cv.imwrite(imgPath, image.resize(150,150));

      let croppedImage = fr.loadImage(imgPath);

      const recognizer = fr.FaceRecognizer();
      const modelState = require('../uploads/model.json');

      recognizer.load(modelState);

      let prediction = recognizer.predictBest(croppedImage);
      console.log('%s (%s)', prediction.className, prediction.distance);

      if (prediction.distance < 0.6) {
        console.log('updated model for ', prediction.className);
        recognizer.addFaces([croppedImage], prediction.className);

        fs.writeFileSync('./uploads/model.json', JSON.stringify(recognizer.serialize()));
      }

      return prediction;
    }
  }

}

module.exports = TrainRecognizer;
