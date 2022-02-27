var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL,
    pass: process.env.PSWD
  }
});


function sendMail(otp,id){
    var mailOptions = {
      from: process.env.MAIL,
      to: id,
      subject: 'Verification Mail',
      html:`
      <h2>Your One Time Password for verification of your account is</h2>
      <h1><strong>${otp}</strong></h1>
      `
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      }
    });
}


module.exports  = sendMail