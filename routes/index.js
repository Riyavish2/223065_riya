const express = require('express');
const nodemailer = require("nodemailer");
const db = require("../config/connection");
const controllers = require("../controllers/authControllers");
const middleware = require('../middleware/isLoggedIn')
const stripe = require("stripe")
const router = express.Router();
router.get("/",controllers.showHome);
router.post("/",controllers.redirectToProfile);
router.get("/home",controllers.showProfile);
router.get("/signup",controllers.showSignup);
router.post("/signup",controllers.signUpVerification);
router.get("/captcha",controllers.showCaptcha);
router.post("/captcha",controllers.captcha);

router.get('/verifyotp',controllers.verifyotp);
router.post('/verifyotp',controllers.verify);
router.get("/exp",controllers.showExperience);
router.get("/stays",controllers.showStays);
router.get("/login",controllers.showLogin);
router.post("/login",controllers.loginVerification);
router.get("/password",controllers.showPasswordForm);
router.post("/password",controllers.changePassword);
router.get("/hotelInfo",controllers.showInfo)
router.post("/hotelInfo",controllers.showPayment);
router.get("/forget",controllers.showForget)
router.post("/forget",controllers.renderotp)
router.get("/forgetotp",controllers.showotp);
router.post("/forgetotp",controllers.checkOtp)
router.get("/success",controllers.showSucess);
router.get("/logout",controllers.logOut);
module.exports = router;