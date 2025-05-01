const express=require("express");
const engine=require("ejs-mate");

const mongoose=require("mongoose");
const session=require("express-session");

const bodyParser=require("body-parser");
const flash=require("connect-flash");

const passport =require("./config/auth");
const path=require("path");

const authRoutes = require("./routes/authRoutes");
const adminRoutes=require("./routes/adminRoutes");
const geoRoutes=require("./routes/geoRoutes");

const cors=require('cors');

const {User,Student,GeoFence} = require("./models/User"); // Import your Student model

const app=express();
app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

//middleware
app.use(express.static(path.join(__dirname,'public')));

//url encoded data
app.use(express.urlencoded({extended:true}));

//engine provide
app.engine('ejs',engine);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));


//connect mongoose
mongoose.connect("mongodb://127.0.0.1:27017/geovigil",{
  //  useNewUrlParser: true,
  //  useUnifiedTopology:true
}).then(()=>console.log("MongoDb Connected!!!!"))
.catch(err=>console.log(err));

// session setup

app.use(session({
    secret:"secretKey",
    resave: false,
    saveUninitialized:false,
}));

//passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});


app.use('/',authRoutes);
app.use('/admin', adminRoutes);
app.use('/geo', geoRoutes);

//server
const port=3000;

app.listen(port,'0.0.0.0',()=>{
    console.log(`Server running on port${port}`);
    
});

//Kashvi
// app.get('/login', (req, res) => {
//     res.render('login');
//   });  

  app.get('/studentForm', (req, res) => {
    res.render('studentForm',{message:null});
  });

  

// router.post("/login", (req, res, next) => {
//     passport.authenticate("local", {
//         successRedirect: "/dashboard", // Redirect to dashboard on success
//         failureRedirect: "/login",
//         failureFlash: true
//     })(req, res, next);
// });

app.post('/api/save-geofence', (req, res) => {
  const { fenceCoordinates } = req.body;
  console.log("Received GeoFence:", fenceCoordinates);

  // TODO: Save to your database here
  // Example with MongoDB: db.collection('geofences').insertOne({ coordinates: fenceCoordinates });

  res.json({ success: true, message: "GeoFence saved" });
});


app.post('/api/save-geofence', async (req, res) => {
  const { fenceCoordinates } = req.body;

  try {
    const savedFence = await GeoFence.create({ coordinates: fenceCoordinates });
    res.json({ success: true, data: savedFence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving GeoFence" });
  }
});




// Route to save GeoFence coordinates
app.post('/api/save-geofence', (req, res) => {
  const { fenceCoordinates } = req.body; // Get the coordinates from the request

  // Create a new GeoFence document
  const newGeoFence = new GeoFence({
    coordinates: fenceCoordinates
  });

  // Save the GeoFence to MongoDB
  newGeoFence.save()
    .then(() => res.json({ success: true }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Error saving GeoFence' });
    });
});