const db = require('../config/connection');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Captcha = require('node-captcha-generator');
const sql = require("mysql2");
const stripe = require("stripe")('sk_test_51Pw5rYJyJc1QS3vEc2G24JSUt1MSfHnm7HyXdCKV6DCcQIGHGQzw0uePsZDPaHcmazcKKEs17OdceDjXTBVUQkee00mv1VtR0R');

class Auth 
{
    static async showHome(req,res)
    {
        
        res.render('main');
}
static async redirectToProfile(req,res)
    {
        
        res.redirect('/home');
}
    static async showProfile(req, res) {
        try {
            // const  isLoggedIn = req.isAuthenticated()
            // Using promise-based query with await
            
            const [result] = await db.query('SELECT * FROM hotel_info');
            console.log(result);
            // Render the profile page with the query result
            res.render('profile', { Message: null, product: result,userName: req.session.email});
        } catch (err) {
            // Handle any errors that occur during the query
            console.error(err);
            res.status(500).send("An error occurred while retrieving the profile.");
        }
    }
       
    static async showLogin (req, res)
    {
        res.render('login', { message: req.flash('info') });
    }
    // static async loginVerification(req, res) {
    //     const data = req.body;
    //     console.log(data);
    //     const rows = await db.query("Select email from project1 where password=?", [req.session.email,data.password]);
    //     console.log(rows);
    //     console.log(rows.email);
    //     if (rows.email) {
    //         res.redirect("/home");
    //     } else {
    //         // res.status(500).send("An error occurred during login.");
    //     req.flash('info','invalid credentials')
    //     res.redirect("/login")
    //     }
    // }
    // static async loginVerification(req, res) {
    //     const data = req.body;
    //     console.log(data);
    //     // Use both email and password in the query to fetch the correct row
    //     const rows = await db.query("SELECT email FROM project1 WHERE email=? AND password=?", [data.email, data.password]);
    //     console.log(rows);
        
    
    //     // // Check if rows array is not empty
        
    //     //     // Access the email of the first row
    //     //     const email = rows[0][0].email;
    //     //     // console.log(email);
                    
    //     //     // Proceed with your login logic
    //     //     if (email) {
    //     //         req.session.email = email; // Store the email in session
    //     //         req.session.user=({email:rows[0][0].email});

    //     //         res.redirect("/home");
    //     // console.log(rows[0][0].email);
    //     //     } else {
    //     //         req.flash('info', 'Invalid credentials');
    //     //         res.redirect("/login");
    //     //     }
    //    if(rows)
    //    {
    //     if(rows[0][0].email!=NULL)
    //     {
    //         req.session.email = email; // Store the email in session
    //             req.session.user=({email:rows[0][0].email});
    //             res.redirect("/home");
    //     }
    //     else
    //     {
    //         req.flash('info', 'Invalid credentials');
    //             res.redirect("/login");
    //     }
    //    }
    //    else
    //    {
    //     req.flash('info', 'user doesnot exist');
    //             res.redirect("/login");
    //    }
    // }
    static async loginVerification(req, res) {
        const data = req.body;
        console.log(data);
        
        try {
            // Execute the query to select the user ID
            const [rows] = await db.query("SELECT Id FROM project1 WHERE email = ? ", [data.email]);
            console.log(rows);
    
            // Check if any rows are returned
            if (rows.length > 0) {
                // Set session variables
                req.session.email = data.email; 
                req.session.user = { email: data.email };
                
                // Redirect to the home page
                return res.redirect("/home");
            } else {
                // Invalid credentials, flash message and redirect to login
                req.flash('info', 'Invalid credentials');
                return res.redirect("/login");
            }
        } catch (err) {
            console.error(err);
            // Handle the error (optional)
            req.flash('error', 'Something went wrong');
            return res.redirect("/login");
        }
    }
    
    
    
    static async showSignup(req, res)
    {
        res.render('signup', { message:req.flash('info') });
    }
    static async signUpVerification(req, res) {
        try {
            const body = req.body;
            console.log(body.password);
            const user=await db.query('select * from project1 where email= ?',[body.email])
            if(user[0][0])
    {
        req.flash('info','User already exists Try Again or login')
        res.redirect('/signup');
        console.log("signup verification");
    }
    else
            // Hash the password
            {
                const hashPassword = await bcrypt.hash(body.password, 10);
    
            // const insertQuery = 'INSERT INTO project1 (email, password, STATUS) VALUES (?, ?, ?)';
    
            // console.log("Before DB query");
    
            // Execute the query using promise-based method
            // await db.query(insertQuery, [body.email,body.password, 'Inactive']);
            // console.log(user);
            req.session.user=({})
            // Set the session email and redirect to captcha
            req.session.email = body.email;
            req.session.password=hashPassword;
            res.redirect("/captcha");
            }
        } catch (err) {
            // Handle any errors that occur
            console.error(err);
            res.status(500).send("An error occurred during signs3-up.");
        }
    }
    
    
           static async verifyotp(req, res)
    {
        console.log("in verifyotp");
        const otp= await Auth.generateAndSendOTP(req.session.email);
        req.session.otp=otp;
        res.render('otp', { message: null });
    }
    static async generateAndSendOTP(email)
     {
        const otp = await Auth.generateOTP();
        
           Auth.sendOTPEmail(email, otp);
        return otp;
    }
    static async sendOTPEmail(email, otp) 
    {
        console.log("in sendOTPEmail");
         const transporter = await nodemailer.createTransport({
            service: 'Gmail',
            auth:
            {
                user: 'riyavishwkarma84@gmail.com',
                pass: 'rmrk iznq msrw msgw' 
            }
        });
        const mailOptions = 
        {
            from: 'riyavishwkarma84.com',
            to: email,
            subject: 'Your OTP',
            text: `Your OTP code is ${otp}.`
        };

       await transporter.sendMail(mailOptions, (error, info)=> {
            if (error)
           {
                console.log('Error in sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        // const updateQuery = 'UPDATE project1 SET otp = ? WHERE email = ?';
        // db.query(updateQuery, [otp, email]);
    }
    static async generateOTP() {
        console.log("generateOTP");
        const otp=  Math.floor(1000 + Math.random() * 9000).toString();
        return otp;
    }

static async verify(req, res) 
{
    const { otp } = req.body;

    // // Fetch the record based on email and OTP
    // const [result] = await db.query(
    //     'SELECT * FROM project1 WHERE email = ? AND otp = ?', 
    //     [req.session.email, otp]
    // );

    // if (result && result.length > 0) {
    //     console.log("In verify function");

    //     // Update the OTP and status
    //     const updateResult = await db.query(
    //         'UPDATE project1 SET otp = ?, STATUS = ? WHERE email = ?',
    //         [null, 'Valid', req.session.email]
    //     );

    //     if (updateResult) {
    //         console.log("In verify DB function");

    //         // Redirect to login
    //         return res.redirect('/login');
    //     } else {
    //         console.error("Failed to update the OTP and status.");
    //     req.flash('info','OTP Does not match')
    //         return res.render('otp', { message: req.flash('info') });
    //     }
    // } else {
    //     // OTP didn't match
    //     console.log("Invalid OTP");
    //     return res.render('otp', { message: 'Invalid OTP' });
    // }
    if(otp==req.session.otp)
    {
        const hashPassword = await bcrypt.hash(req.session.password, 10);
        await db.query('INSERT INTO project1 (email, password, otp) VALUES (?, ?, ?)',[req.session.email,hashPassword,req.session.otp]);
        res.redirect("/home")
    }
    else
    {
        req.flash('info','OTP Does not match')
                return res.render('otp', { message: req.flash('info') });
    }
}


static async verifyotpss(req,res)
{
    res.render('otps', { Message: null });
}
static async showCaptcha(req, res) {
    try {
        let c = new Captcha({
            length: 5,
            size: {
                width: 400,
                height: 200
            }
        });

        const base64 = await new Promise((resolve, reject) => {
            c.toBase64((err, Base64) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(Base64);
                }
            });
        });

        // Render the captcha.ejs template with the necessary variables
        res.render('captcha.ejs', {
            src: base64,          // Pass the base64 image source
            value: c.value,       // Pass the CAPTCHA value
            message: req.flash('try'), // Pass the flash message (if any)
            type: req.flash('type')    // Pass the flash type (if any)
        });
    } catch (error) {
        // Handle any errors that might occur
        console.error('Error generating CAPTCHA:', error);
        res.status(500).send('Internal Server Error');
    }
}

    
//  static async showCaptcha(req,res)
//  {
//         let c = new Captcha(
//             {
//                 length:5,
//                 size:
//                 {
//                     width:400,
//                     height:200
//                 }
//             }
//         )

//  await c.toBase64(async(err,base64)=>{
//             if(err)
//                 throw err;
//             else{
//                 return res.render('captcha.ejs',
//                     {src:base64,
//                     value:c.value,
//                     message:req.flash('try'),
//                     type:req.flash('type')});
//             }
//         })
        
//     }
    static async captcha(req,res)
    {
        const body=req.body;
        if(body.captcha==body.value)
        {   
            // .flash('type',`${body.type}`);
            return res.redirect('/verifyotp');
        }
        else{
            req.flash('try','try again!');
            return res.redirect('/captcha');
        }
    }
static async showInfo(req,res)
{
    
    try {
        const id = req.query.id;
        req.session.hotel_id = id;
        const data = await db.query('SELECT hotel_info.id, hotel_info.hotel_name, hotel_info.price, hotel_data.hotel_id, hotel_data.info, hotel_data.about,hotel_data.image1,hotel_data.image2,hotel_data.image3,hotel_data.image4,hotel_data.image5 ' +
  'FROM hotel_info ' +
  'INNER JOIN hotel_data ON hotel_info.id = hotel_data.hotel_id ' +
  'WHERE hotel_info.id = ?', 
  [id]);
        res.render('hotel_info', { product :  data});
    } catch (err) {
        // Handle any errors that occur during the query
        console.error(err);
        res.status(500).send("An error occurred while retrieving the profile.");
    }
}
// static async showForget(req,res)
// {
//     res.render('forget')
// }
// // Ensure you have the correct path to your DB connection

static async forgetVerification(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirm_password;

    try {
        

        if (password !== confirmPassword) {
            return res.redirect('/forget?error=passwords_do_not_match');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the password in the database
        const query = 'UPDATE project1 SET password = ? WHERE email = ?';
        await db.query(query, [hashedPassword, email]);

        // Redirect to home
        res.redirect('/login');
    } catch (error) {
        console.error('Error during password update:', error);
        res.redirect('/forget?error=update_failed');
    }
}
static async showExperience(req,res)
{
    res.render('exp');
}
static async showStays(req,res)
{
    res.render('stays');
}
static async showForget(req,res)
{
    res.render('forget')
}
static async renderotp(req,res)
{
    const email = req.body.email;
    const otp= await Auth.generateAndSendOTP(email);
    await db.query('UPDATE project1 SET otp = ? WHERE email = ?',[otp,email]);
    req.session.email = email;
    req.session.otp=otp;
res.redirect('/forgetotp');
}
static async showotp(req,res)
{ 
    
    res.render('forget_otp',{message:req.flash.info});
}
static async checkOtp(req,res)
{
    const otp=req.body.otp;
    const row = await db.query('Select otp from project1 where email = ?',[otp,req.session.email]);
    if(req.session.otp==otp)
    {
        res.redirect('/password');
    }
    else
    {
        req.flash('info','Invalid otp')
        res.redirect('/forgetotp');
    }
}
static async showPasswordForm(req,res)
{
    res.render("PasswordForm",{ message:req.flash('info') });
}
static async changePassword(req,res)
{

     const data=req.body;
     console.log(data);
     console.log("Password1:", data.password1);
    console.log("Password2:", data.password2);

    // Trim the passwords to remove any accidental whitespace
    const password1 = data.password1;
    const password2 = data.passsword2;
    console.log(req.session.email);
    console.log(password1);
    console.log(password2);
    const hashPassword = await bcrypt.hash(password1, 10);

     if(password1==password2)
     {
        await db.query("update project1 set password=? where email=?",[hashPassword,req.session.email]);
        res.redirect("/login",);

     }
     else
     {
        req.flash('info','password doesot match')
        res.redirect("/Password")
     }
}
static async logOut(req,res)
{
    delete req.session.user;
    console.log(req.session.user);
    // delete req.session.user.password;
    console.log("logOut");
    res.redirect("/home");
}
// static async showPayment(req,res)
// {
//     const session = await stripe.checkout.session.create(
//         {
//             list_itemes:[
//                 {
//                     price_data:
//                     {
//                         currency:'usd',
//                         product_data:
//                         {
//                             name:''
//                         },
//                         unit_amount:50
//                     },
//                     quantity:1,
//                 }
//             ],
//             mode:'payment',
//             success:'http//localhost:3000/success',
//             cancel:'http//localhost:3000/hotelInfo'
//         }
//     )
// }
static async showPayment(req, res) {
    if(!req.session.user)
    {
        res.redirect("/login");
    }
    else
    {
        try {
            const hotelId = req.body.id;  // or req.body.hotelId
            console.log(hotelId);
            const result = await db.query("SELECT hotel_name, price FROM hotel_info WHERE id = ?", [hotelId]);

            if (result[0].length === 0) {
                res.status(404).send('Hotel not found');
                return;
            }
            const hotel = result[0][0];
            const lineItems = [{
                        price_data:{
                            currency:'usd',
                            product_data:{
                                name:hotel.hotel_name
                            
                            },
                            unit_amount: hotel.hotel_price
                        },
                        quantity:1
                      }]
            const session = await stripe.checkout.sessions.create({  // Changed 'session' to 'sessions'
                
                line_items:lineItems,
                mode: 'payment',
                success_url: 'http://localhost:3000/success',  // Corrected 'success' to 'success_url'
                cancel_url: 'http://localhost:3000/hotelInfo'  // Corrected 'cancel' to 'cancel_url'
            });
    
            // Redirect the user to the Stripe checkout page
            res.redirect(session.url);
        } catch (error) {
            console.error('Error creating Stripe session:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
}
static async showSucess(req,res)
{
    console.log(req.query.session_id);
    res.render("Success.ejs");
}
static async showPayment(req, res) {
    const id = req.body.id;
    console.log(id);
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        try {
            // const hotelId = req.body.id;  // Assuming hotelId is being sent in the request body
            // console.log(hotelId);

            const result = await db.query("SELECT hotel_name, price FROM hotel_info WHERE id = ?", [req.session.hotel_id]);

            // if (result[0].length === 0) {
            //     res.status(404).send('Hotel not found');
            //     return;
            // }

            // const hotel = result[0][0];
            console.log(req.body);
            const no=req.body.guest;    
            console.log(no);
            console.log(result[0][0]);
            const lineItems = [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: result[0][0].hotel_name,
                    },
                    unit_amount: result[0][0].price*100  // Ensure price is converted to cents
                },
                quantity: no
            }];

            const session = await stripe.checkout.sessions.create({
                line_items: lineItems,
                mode: 'payment',
                // shipping_address_collection:
                // {
                //     allowed_countries:['IN']
                // },
                success_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/hotelInfo'
            });

            // Redirect the user to the Stripe checkout page
            res.redirect(session.url);
        } catch (error) {
            console.error('Error creating Stripe session:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

// static async payment(req,res){
//     const sql= await pool.getConnection();
//     const result=await sql.query(
//         select products.product_id as id,product_name,( select SUM(price*Quantity) from (products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as Tamount, ( select SUM(Quantity) from cart inner join users on users.UserID=cart.UserID where users.UserID=${req.session.user.id})as items,StreetAddress,City,State,Country,product_name,price,(price*Quantity) as sub,size,Quantity from ((products inner join cart on products.product_id=cart.ProductId)inner join users on users.UserID=cart.UserID)inner join useraddress on users.UserID=useraddress.UserID where users.UserID=${req.session.user.id}
//       );
//       const lineItems = result[0].map(item => ({
//         price_data:{
//             currency:'usd',
//             product_data:{
//                 name:item.product_name
            
//             },
//             unit_amount: item.price*100
//         },
//         quantity:item.Quantity
//       }));
//     const session=await stripe.checkout.sessions.create({
//         line_items:lineItems,
//         mode:'payment',
//         success_url:"http://localhost:8080/OrderConfirmation",
//         cancel_url:"http://localhost:8080/cart"
//     })
//     return res.redirect(session.url);
// }
}
module.exports = Auth;