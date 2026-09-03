import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { Link,  useLocation } from 'react-router-dom';
import { useClerk, UserButton } from '@clerk/clerk-react';
import { useAppContext } from "../context/AppContext";
const BookIcon = () => (
    <svg
        className="w-4 h-4 text-gray-700"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
        />
    </svg>
);

const Navbar = () => {

    const { openSignIn } = useClerk();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Hotels', path: '/rooms' },
        { name: 'Experience', path: '/experience' },
        { name: 'About', path: '/about' },
    ];

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const location = useLocation();
    const { user, navigate, isOwner, setShowHotelReg } = useAppContext();

    useEffect(() => {
        if (location.pathname !== "/") {
            setIsScrolled(true);
            return;
        } else {
            setIsScrolled(false);
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);



    return (
        <nav
            className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
                isScrolled
                    ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
                    : "py-4 md:py-6"
            }`}
        >

            {/* Logo */}

            <Link to="/" className="flex items-center gap-2">

                <svg
                    width="185"
                    height="40"
                    viewBox="0 0 185 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-9 ${isScrolled && "invert opacity-80"}`}
                >
                    {/* Icon: faceted gem / cube mark */}
                    <g transform="translate(0,1) scale(0.947)">
                        <path d="M16 2L29.5 10V28L16 36L2.5 28V10L16 2Z" stroke="#F5F5F5" strokeWidth="2.5" strokeLinejoin="round"/>
                        <path d="M16 2V19L29.5 28M16 19L2.5 28" stroke="#F5F5F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>

                    {/* Wordmark */}
                    <text x="40" y="29" fontFamily="Outfit, sans-serif" fontSize="25" letterSpacing="0.2">
                        <tspan fontWeight="500" fill="#F5F5F5">velore</tspan><tspan fontWeight="700" fill="#F5F5F5">Stay</tspan>
                    </text>
                </svg>

            </Link>

            {/* Desktop Nav */}

            <div className="hidden md:flex items-center gap-4 lg:gap-8">

                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        className={`group flex flex-col gap-0.5 ${
                            isScrolled ? "text-gray-700" : "text-white"
                        }`}
                    >
                        {link.name}

                        <div
                            className={`${
                                isScrolled
                                    ? "bg-gray-700"
                                    : "bg-white"
                            } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
                        />

                    </Link>
                ))}
                <button
                    className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
                        isScrolled ? 'text-black border-gray-400' : 'text-white border-white/70'
                    } hover:opacity-90 transition-all`}
                    onClick={() => {
                        if (!user) {
                            openSignIn({});
                        } else if (isOwner) {
                            navigate('/owner');
                        } else {
                            setShowHotelReg(true);
                        }
                    }}
                >
                    {isOwner ? 'Dashboard' : 'List Your Hotel'}
                </button>
            </div>


            {/* Desktop Right */}

            <div className="cl-rootBox cl-userButton-root hidden md:flex items-center gap-4">

                <img
                    src={assets.searchIcon}
                    alt="Search"
                    className={`${
                        isScrolled && "invert"
                    } h-7 transition-all duration-500 cursor-pointer`}
                />


                {user ? (

                    <UserButton>

                        <UserButton.MenuItems>

                            <UserButton.Action
                                label="My Bookings"
                                labelIcon={<BookIcon />}
                                onClick={() => navigate('/my-bookings')}
                            />

                        </UserButton.MenuItems>

                    </UserButton>

                ) : (

                    <button
                        onClick={() => openSignIn({})}
                        className="bg-black text-white px-8 py-2.5 rounded-full ml-4 transition-all duration-500 cursor-pointer hover:bg-gray-800"
                    >
                        Login
                    </button>

                )}

            </div>


            {/* Mobile Menu Button */}

            <div className="flex items-center gap-3 md:hidden">

                {user && (

                    <UserButton>

                        <UserButton.MenuItems>

                            <UserButton.Action
                                label="My Bookings"
                                labelIcon={<BookIcon />}
                                onClick={() => navigate('/my-bookings')}
                            />

                        </UserButton.MenuItems>

                    </UserButton>

                )}

                <img
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    src={assets.menuIcon}
                    alt=""
                    className={`${
                        isScrolled && "invert"
                    } h-4 cursor-pointer`}
                />

            </div>


            {/* Mobile Menu */}

            <div
                className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
                    isMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >

                <button
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <img
                        src={assets.closeIcon}
                        alt="close-menu"
                        className="h-6.5"
                    />
                </button>


                {navLinks.map((link, i) => (

                    <Link
                        key={i}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {link.name}
                    </Link>

                ))}

                <button
                    className="border border-gray-300 px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
                    onClick={() => {
                        setIsMenuOpen(false);
                        if (!user) {
                            openSignIn({});
                        } else if (isOwner) {
                            navigate('/owner');
                        } else {
                            setShowHotelReg(true);
                        }
                    }}
                >
                    {isOwner ? 'Dashboard' : 'List Your Hotel'}
                </button>


                {!user && (

                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            openSignIn({});
                        }}
                        className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500 cursor-pointer"
                    >
                        Login
                    </button>

                )}

            </div>

        </nav>
    );
};

export default Navbar;