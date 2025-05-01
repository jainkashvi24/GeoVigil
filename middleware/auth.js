
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log("User Authenticated:", req.user); // Debugging
        return next();
    }
    req.flash("error_msg", "Please log in to access this page");
    res.redirect("/login");
};

const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin" || req.user.role === "superadmin") {
        console.log(" Admin Access Granted:", req.user); // Debugging
        return next();
    }
    req.flash("error_msg", "You do not have permission to view this page");
    res.redirect("/dashboard");
};


const ensureSuperAdmin = (req, res, next) => {
if (req.isAuthenticated() && req.user.role === "superadmin") {
    console.log("Super Admin Access Granted:", req.user); // Debugging
    return next();
}
req.flash("error_msg", "You must be a Super Admin to perform this action");
res.redirect("/dashboard");
};

module.exports={ensureAuthenticated,ensureAdmin,ensureSuperAdmin};