const nodemailer = require("nodemailer");
const Course = require('../models/Course');
const User = require('../models/User')

exports.getIndexPage = async (req, res) => {
  const courses = await Course.find().sort('-createdAt').limit(2);
  const totalCourse = await Course.find().countDocuments();
  const totalStudents = await User.countDocuments({role: 'student'});
  const totalTeachers = await User.countDocuments({role: 'teacher'})
    res.status(200).render('index', {
        page_name: "index",
        courses,
        totalCourse,
        totalStudents,
        totalTeachers
    });
  }

exports.getAboutPage = (req, res) => {
    res.status(200).render('about', {
        page_name: "about"
    });
  }

exports.getRegisterPage = (req, res) => {
    res.status(200).render('register', {
        page_name: "register"
    });
  }

exports.getLoginPage = (req, res) => {
    res.status(200).render('login', {
        page_name: "login"
    });
  }

exports.getContactPage = (req, res) => {
    res.status(200).render('contact', {
        page_name: "contact"
    });
  }

exports.sendEmail = async (req, res) => {
  try {
    const outputMessage = `
    <h1>Mail Details</h1>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h1>Message</h1>
    <p>${req.body.message}</p>
    `

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: "sahinmeryem620@gmail.com",
        pass: "esjtxcdcfvvokefm",
      }
    });
    
    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
      // send mail with defined transport object
      const info = await transporter.sendMail({
        from: '"Smart EDU Contact From" <sahinmeryem620@gmail.com>', // sender address
        to: "meerymsahin@gmail.com", // list of receivers
        subject: "Smart EDU Contact From", // Subject line
        html: outputMessage, // html body
      });
    
      console.log("Message sent: %s", info.messageId);

      req.flash("success", "We recieved your messages successfully.")

      res.status(200).redirect('contact');

      
  }
main ();
} catch(err) {
    req.flash("error", "Something Happened!")
  }
}

