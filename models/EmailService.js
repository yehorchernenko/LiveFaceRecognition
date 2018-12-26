const nodemailer = require('nodemailer');
const generator = require('generate-password');


class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'smart.office.tracker@gmail.com',
        pass: 'qz8ctx2d'
      }
    });
  }

  sendPassword(email, password) {

    const mailOptions = {
      from: 'smart.office.tracker@gmail.com',
      to: `${email}`,
      subject: 'Smart office tracker password',
      text: `Hello! This your password to access profile\n<span style="font-style: italic;">${password}</span>`
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Email sending failure ${error}`);

      } else {
        console.log(`Email successfully sent to ${email}`);
      }
    });
  }
}

module.exports = EmailService;
//qz8ctx2d
