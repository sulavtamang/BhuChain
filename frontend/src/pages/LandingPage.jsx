import { useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import GetStarted from "../components/GetStarted";
import Footer from "../components/Footer";

export default function LandingPage() {
    useEffect(() => {
        // Handle cross-page scrolling to hash sections
        const hash = window.location.hash;
        if (hash) {
            const id = hash.replace("#", "");
            const element = document.getElementById(id);
            if (element) {
                // Small timeout to allow content to render before scrolling
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [window.location.hash]); // Detect changes to the hash

    return (
        <div className="flex min-h-screen flex-col font-sans">
            <main className="flex-1">
                <HeroSection />
                <Features />
                <HowItWorks />
                <GetStarted />
            </main>
            <Footer />
        </div>
    )
};