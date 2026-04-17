import { Button } from "@headlessui/react";
import { Link } from "@inertiajs/react";
import { useState } from "react";
import "../../../css/easyApply.css";
 
const MenuIcon = () => (
    <svg className="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
 
const CloseIcon = () => (
    <svg className="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
 
 
const EzNav = ({ user }: { user?: any }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
 
    const isVerified =
        !!user && typeof user === "object" && Object.keys(user).length > 0;
 
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };
 
    return (
        <nav className={`ezapply-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
           
            <div className="ezapply-logo">
               <a href="/" className="flex items-center">
    <img src="/ezapply_logo.jpg" alt="EZ Apply PH Logo" className="h-15 w-auto" />
</a>
 
            </div>
 
            <div className="ezapply-navlinks" id="nav-menu">
                <div className="ezapply-navlink">
                    <a href="/" onClick={handleLinkClick}>Home</a>
                </div>
                <div className="ezapply-navlink">
                    <a href="#services" onClick={handleLinkClick}>Services</a>
                </div>
                <div className="ezapply-navlink">
                    <a href="#about" onClick={handleLinkClick}>About</a>
                </div>
                <div className="ezapply-navlink">
                    <a href="#contact" onClick={handleLinkClick}>Contact</a>
                </div>
 
                <div className="ezapply-login-container mobile-only">
                    {!isVerified ? (
                        <div className="flex flex-col gap-2 w-full">
                            <Link href="/login" className="btn-outline w-full text-center" onClick={handleLinkClick}>
                                Login
                            </Link>
                            <Link href="/register" className="btn-outline w-full text-center" onClick={handleLinkClick}>
                                Register
                            </Link>
                        </div>
                    ) : (
                        <Link href="/dashboard" className="btn-outline w-full text-center" onClick={handleLinkClick}>
                            Dashboard
                        </Link>
                    )}
                </div>
            </div>
 
            <div className="ezapply-login-container desktop-only">
                {!isVerified ? (
                    <div className="flex gap-2 items-center">
                        <Link href="/login" className="btn-outline">
                            Login
                        </Link>{" "}
                        <Link href="/register" className="btn-outline">
                            Register
                        </Link>
                    </div>
                ) : (
                    <Link href="/dashboard" className="btn-outline">
                        Dashboard
                    </Link>
                )}
            </div>
 
            <Button
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-controls="nav-menu"
                aria-expanded={isMenuOpen}
            >
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </Button>
 
        </nav>
    )
}
 
export default EzNav;
 