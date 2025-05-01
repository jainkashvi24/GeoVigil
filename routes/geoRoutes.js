const express=require("express");
const router=express.Router();
const {GeoFence}=require("../models/User");
const {ensureAuthenticated,ensureAdmin}=require("../middleware/auth");

router.post("/create",ensureAuthenticated,ensureAdmin, async(req,res)=>{
    try{
        const{name,latitude,longitude,radius}=req.body;

        const newGeoFence=new GeoFence({
            name,latitude,longitude,radius,createdBy:req.user._id

        });

        await newGeoFence.save();
        req.flash("success_msg", "GeoFence created successfully!");
        res.redirect("/dashboard");

    }catch(error)
    {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Get All GeoFences
router.get("/fences", async (req, res) => {
    try {
        const geoFences = await GeoFence.find();
        res.json({ geoFences });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");    }
});

// Check if User is Inside a GeoFence
router.post("/check-location", async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const geoFences = await GeoFence.find();

        let inGeoFence = false;
        geoFences.forEach(fence => {
            const distance = getDistance(latitude, longitude, fence.latitude, fence.longitude);
            if (distance <= fence.radius) {
                inGeoFence = true;
            }
        });

        res.json({ inGeoFence });
    } catch (error) {
        console.error("Error checking location:", error);
        res.status(500).send("Server Error");    }
});

// Function to calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const Δφ = (lat2 - lat1) * (Math.PI / 180);
    const Δλ = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}


module.exports=router;
