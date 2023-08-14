const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const {validationResult} = require('express-validator');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).redirect('/login')
  } catch (err) {
    const errors = validationResult(req);
    console.log(errors);
    console.log(errors.array()[0].msg);
    for ( i = 0; i < errors.array().length; i++) {
    req.flash("error", `${errors.array()[0].msg}`);
    }
    res.status(400).redirect('/register');
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcının e-postasına göre veritabanından kullanıcıyı bulma
    const user = await User.findOne({ email });

    if (!user) {
      // Kullanıcı bulunamazsa hata mesajı döndürün
      req.flash("error", "User is not exist!");
      return res.status(400).redirect('/login');
    }

    // Kullanıcının şifresini bcrypt ile karşılaştırma
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Şifre eşleşmezse hata mesajı
      req.flash("error", "Your password is not correct!");
      return res.status(400).redirect('/login');
    }

    // Giriş başarılıysa
    req.session.userID = user._id;
    res.status(200).redirect('/users/dashboard');
  } catch (err) {
    // Hata oluşursa
    res.status(500).json({ status: 'error', message: 'Sunucu hatası.' });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  })
}

exports.getDashboardPage = async (req, res) => {
  const user = await User.findOne({_id:req.session.userID}).populate('courses');
  const categories = await Category.find();
  const courses = await Course.find({user: req.session.userID});
  const users = await User.find();
  res.status(200).render('dashboard', {
      page_name: "dashboard",
      user,
      categories,
      courses,
      users
  });
}

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    await Course.deleteMany({user:req.params.id})
    res.status(200).redirect('/users/dashboard');
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      err,
    });
  }
};
