// import User from "../models/User.js";
// import { verifyToken } from "@clerk/express";

// GET /api/user
// Returns the logged-in user's data from MongoDB using their Clerk ID
export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({success: true, role, recentSearchedCities, user: req.user})
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//Store User Recent Searched Cities
export const storeRecentSearchedCities = async (req, res)=>{
    try {
        const {recentSearchCity} = req.body;
        const user = req.user;

        if(!user.recentSearchedCities){
            user.recentSearchedCities = [];
        }

        if(user.recentSearchedCities.length < 3){
            user.recentSearchedCities.push(recentSearchCity)
        }else{
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchCity)
        }
        await user.save();
        res.json({success: true, message: "City added"})

    } catch(error){
        res.json({success: false, message: error.message})
    }
};
