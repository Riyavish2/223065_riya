const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.session.isLoggedIn = true;
        next();
    }
    else
    {
        req.session.isLoggedIn = false;
        next();
    }
     // Continue to the requested route if not logged in
};

module.exports = isLoggedIn;