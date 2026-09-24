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
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [userDataFetched, setUserDataFetched] = useState(false);

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
            if (!token) {
                setUserDataFetched(true);
                return;
            }

            const { data } = await axios.get("/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data.success) {
                setIsOwner(data.user?.role === "hotelOwner");
                setIsAdmin(data.user?.role === "admin");
                setIsSuspended(data.user?.status === "suspended");
                setSearchedCities(data.recentSearchedCities || []);
                setUserDataFetched(true);
            } else {
                setTimeout(() => {
                    fetchUser();
                }, 5000);
            }
        } catch (error) {
            console.error(error.message);
            setUserDataFetched(true);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUser();
        } else if (isLoaded) {
            // Only clear when Clerk has fully resolved — not during init
            setIsOwner(false);
            setIsAdmin(false);
            setIsSuspended(false);
            setSearchedCities([]);
            setUserDataFetched(true);
        }
        fetchRooms();
    }, [user, isLoaded]);

    const value = {
        currency,
        navigate,
        user,
        isLoaded,
        getToken,
        isOwner,
        setIsOwner,
        isAdmin,
        setIsAdmin,
        isSuspended,
        setIsSuspended,
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
        userDataFetched,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);