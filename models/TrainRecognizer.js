const path = require('path');
const fs = require('fs');
const fr = require('face-recognition');
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
