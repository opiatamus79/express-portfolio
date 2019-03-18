var nodemailer = require("nodemailer");
const xoauth2 = require('xoauth2');
var smtpTransport = require('nodemailer-smtp-transport');



var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'tobborders@gmail.com', //use take out buddy email
    pass: 'Takeoutbuddy9566' //use take out buddy password
  }
}));



//function that sounds out an email when an order is received (called via webhook set in wordpress/woocommerce)
function send_email(data, test_maillist, vendors, callback){
    //Perform check on the order and determine the vendor(s) that need to receive an email.(may need to be in seperate function)
    //console.log('Here is the order that needs to be emailed:', data);


    for(var m = 0; m < test_maillist.length; m++) {//hardcoded 2 need to replace this with the amount of vendors. 
      mailOptions = {
        from: "tobborders@gmail.com",
        to: test_maillist[m].vendors_email,
        subject: "Test using nodemailer",
        generateTextFromHTML: true,
        html: "<p>" + test_maillist[m].vendors_name + " received an order with sku " + test_maillist[m].sku + " price " + test_maillist[m].price + " on sale " + test_maillist[m].on_sale + "</p>"
      };

      

    transporter.sendMail(mailOptions, function(error, response) {
      if (error) {
        console.log(error);
        //callback(error,null);
      } else {
        //console.log(response);
      }
    }, callback());
    }
    //callback(null, response);
    transporter.close();
}





module.exports = {
  sendEmail : send_email
};

