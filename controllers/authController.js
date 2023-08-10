const bcrypt = require('bcrypt');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).redirect('/login')
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      err,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcının e-postasına göre veritabanından kullanıcıyı bulma
    const user = await User.findOne({ email });

    if (!user) {
      // Kullanıcı bulunamazsa hata mesajı döndürün
      return res.status(400).json({ status: 'fail', message: 'Kullanıcı bulunamadı.' });
    }

    // Kullanıcının şifresini bcrypt ile karşılaştırma
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Şifre eşleşmezse hata mesajı
      return res.status(400).json({ status: 'fail', message: 'Hatalı şifre.' });
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
  const courses = await Course.find({user: req.session.userID})
  res.status(200).render('dashboard', {
      page_name: "dashboard",
      user,
      categories,
      courses
  });
}
