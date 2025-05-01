
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    type: { type: String, required: true }, // School, College, etc.
    role: { type: String, enum: ["admin", "user","superadmin"], default: "user" }, // 👈 Add this line

    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Student Schema
const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentContact: { type: String, required: true, trim: true },
    // parentEmail:{ type:String, required:true, unique:true,lowercase: true, trim: true},
    deviceId: { type: String, required: true, unique: true, trim: true }, // Unique Device ID
    schoolName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, // Admin approval status
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the Admin managing the student
    createdAt: { type: Date, default: Date.now }
    
});


const GeoFenceSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the GeoFence (e.g., 'College Campus')
    coordinates: [{                          // Array of coordinates for the polygon
      lat: { type: Number, required: true }, // Latitude
      lng: { type: Number, required: true }  // Longitude
    }],
    radius: { type: Number, default: 0 },    // Radius (if applicable, you can use this or coordinates)
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  Reference to the user who created the GeoFence
    createdAt: { type: Date, default: Date.now } // Timestamp when the GeoFence is created
  });


const User = mongoose.model("User", UserSchema);
const Student = mongoose.model("Student", StudentSchema);
const GeoFence= mongoose.model("GeoFence",GeoFenceSchema);


module.exports={User,Student,GeoFence};

