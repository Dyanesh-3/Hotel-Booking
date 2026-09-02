import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY || import.meta.env.VITE_Currency || "$";
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const { getToken, isSignedIn } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);

    const fetchRooms = async () => {
        try {
            const { data } = await axios.get("/api/room");

            if (data.success) {
                setRooms(data.rooms);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const fetchUser = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const { data } = await axios.get("/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data.success) {
                setIsOwner(data.role === "hotelOwner");
                setSearchedCities(data.recentSearchedCities || []);
            } else {
                setTimeout(() => {
                    fetchUser();
                }, 5000);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUser();
        } else if (isLoaded) {
            // Only clear when Clerk has fully resolved — not during init
            setIsOwner(false);
            setSearchedCities([]);
        }
        fetchRooms();
    }, [user, isLoaded]);

    const value = {
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        setIsOwner,
        axios,
        showHotelReg,
        setShowHotelReg,
        searchedCities,
        setSearchedCities,
        rooms,
        setRooms,
        isSignedIn,
        fetchRooms,
        fetchUser,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);