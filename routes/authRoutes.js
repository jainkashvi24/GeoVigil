
const express=require("express");
const router=express.Router();
const bcrypt= require("bcrypt");
const passport = require("passport");
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");
const { User, Student,GeoFence } = require("../models/User");



router.get('/', (req, res) => res.render('home',{ message: null }));


// Show Login Page
router.get("/login", (req, res) => {
    res.render("login", { error_msg: req.flash("error") });
});

// Handle Login
router.post("/institution-login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard", // Redirect to dashboard on success
        failureRedirect: "/institution-login",
        failureFlash: true
    })(req, res, next);
});

// Route for institution login
router.get('/institution-login', (req, res) => {
  res.render('institution-login');  // Ensure you have this EJS file created
});


router.get('/institution-geofence', (req, res) => {
    res.render('institution-geofence'); // or whatever your EJS file name is
  });

  // Manage Pending Students Route (Ensure Admin Middleware is Applied)
router.get('/pending-students', ensureAdmin, async (req, res) => {
    try {
        // Fetch all pending students (you can adjust the query based on how you mark students as pending)
        const students = await Student.find({ status: 'pending' });  // Adjust the query to fetch pending students

        // Pass the 'pendingStudents' data and 'currentUser' (logged-in user) to the EJS template
        res.render('pending-students', { 
            students: students, 
            currentUser: req.user // Assuming 'req.user' contains the logged-in user's data
        });
    } catch (error) {
        console.error("Error fetching pending students:", error);
        res.status(500).send("Server error");
    }
});

router.get('/institution-monitor', (req, res) => {
    const query=req.query.name || '';
     // For now, pass null/empty values
     const student = null; 
     const history = [];
 
    res.render('institution-monitor', {query, student, history}); // or send some JSON/data
});

  
// Show Dashboard (Only Logged-in Users)
router.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user });
});


// Logout Route
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success_msg", "You are logged out");
        res.redirect("/login");
    });
});


router.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});

router.post("/register",async(req,res)=>{
    try{
        const{name, email,phone,address, type, role,password, confirmPassword}=req.body;

        if(password!==confirmPassword)
        {
            return res.status(400).send("Passwords do not match");
        }

        const existingUser=await User.findOne({email});
        if(existingUser)
        {
            return res.status(400).send("Email is already in use");
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=new User({
            name,
            email,
            phone,
            address,
            type,
            role,
            password:hashedPassword,
        });

        await newUser.save();

        res.redirect("/login");

    }
    catch(error)
    {
        console.error(error);
        res.status(500).send("Server error");
    }
});


// Show the form page
router.get("/student-form", (req, res) => {
    res.render("studentForm", { message: req.query.message || null });
});

// Handle form submission
router.post("/register-student", async (req, res) => {

    try {
        console.log("Received Data:", req.body);
        const { name, email, phone, parentName, parentContact, deviceId, schoolName } = req.body;

        const newStudent = new Student({
            name,
            email,
            phone,
            parentName,
            parentContact,
            deviceId,
            schoolName
        });

        await newStudent.save();
        res.redirect("/student-form?message=✅ Student registered successfully! Waiting for Admin Approval.");
         // Print full error details

    }
    catch (error) {
        console.error("Error:", error);
        // Agar koi error aaye, to home page pe redirect with error message
        res.redirect("/student-form?message=❌ Registration failed. Please try again.");
        
    }
});

router.post('/save-geofence', async (req, res) => {
    try {
        let { name, fenceCoordinates } = req.body;

        // Parse fenceCoordinates if it's a string
        if (typeof fenceCoordinates === 'string') {
            try {
                fenceCoordinates = JSON.parse(fenceCoordinates);
            } catch (err) {
                return res.status(400).json({ message: 'Invalid coordinates format' });
            }
        }
        console.log(req.body);
        // Get data from the request
  
      // Create a new GeoFence document
      const newGeoFence = new GeoFence({
        name, 
        coordinates: fenceCoordinates, // Store the array of coordinates
    
      });
  

      // Save the GeoFence data to MongoDB
      await newGeoFence.save();
  
      // Respond with success message
      res.status(200).json({ message: 'GeoFence saved successfully!', geoFence: newGeoFence });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error saving GeoFence' });
    }
  });
  
  // Endpoint to fetch the existing GeoFence
  router.get('/api/get-geofence', async (req, res) => {
    try {
      // Fetch the most recent GeoFence
      const geoFence = await GeoFence.findOne().sort({ createdAt: -1 }); // Sorting by createdAt to get the latest GeoFence
      res.status(200).json(geoFence || { coordinates: [] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching GeoFence' });
    }
  });

module.exports = router;
