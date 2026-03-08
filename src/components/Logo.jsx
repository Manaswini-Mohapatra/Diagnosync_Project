import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Logo({ size = "default" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    const currentPath = location.pathname;

    if (
      currentPath.includes("/signin") ||
      currentPath.includes("/signup") ||
      currentPath.includes("/password-reset") ||
      currentPath === "/"
    ) {
      navigate("/");
      return;
    }

    if (currentPath.includes("/patient")) {
      navigate("/patient/dashboard");
      return;
    }

    if (currentPath.includes("/doctor")) {
      navigate("/doctor/dashboard");
      return;
    }

    if (currentPath.includes("/admin")) {
      navigate("/admin/dashboard");
      return;
    }

    navigate("/");
  };

  // Size variants
  const sizes = {
    default: {
      img: "h-12",
      text: "text-4xl",
    },
    small: {
      img: "h-8",
      text: "text-2xl",
    },
    tiny: {
      img: "h-6",
      text: "text-xl",
    },
  };

  const selected = sizes[size];

  return (
    <button
      onClick={handleLogoClick}
      className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0"
      aria-label="DiagnoSync Home"
    >
      <img
        src="/diagnosync_icon_transparent.svg"
        alt="DiagnoSync Logo"
        className={`${selected.img} w-auto hover:scale-105 transition-transform`}
      />
      <span
        className={`${selected.text} font-bold leading-[1.3] pb-[2px] bg-gradient-to-r from-primary to-success bg-clip-text text-transparent`}
      >
        DiagnoSync
      </span>
    </button>
  );
}