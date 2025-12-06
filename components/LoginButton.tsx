"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

function LoginButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn("microsoft-entra-id");
    setIsLoading(false);
  };
  
  return (
    <button
      onClick={() => handleLogin()}
      className="flex items-center justify-center gap-3 w-full bg-blue-800 text-white my-5 p-3 rounded-md hover:opacity-80 disabled:opacity-75 transition-all duration-200"
      disabled={isLoading}
    >
      {isLoading ? (
        "Signing in..."
      ) : (
        <>
          {/* Logo de Microsoft colorido */}
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 23 23" 
            fill="none"
          >
            <path d="M11.5 1H1V11.5H11.5V1Z" fill="#F25022"/>
            <path d="M22 1H11.5V11.5H22V1Z" fill="#7FBA00"/>
            <path d="M11.5 11.5H1V22H11.5V11.5Z" fill="#00A4EF"/>
            <path d="M22 11.5H11.5V22H22V11.5Z" fill="#FFB900"/>
          </svg>
          
          <span>Sign in with Microsoft</span>
        </>
      )}
    </button>
  );
}

export default LoginButton;