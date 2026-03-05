import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/image.png"
import cheating from "../assets/cheating.png"

interface LoginProps {
  onLogin?: () => void; //optional
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const LOGIN_API_URL = `${API_BASE_URL}/login/`;
const THANK_YOU_PAGE_URL = "/thanku";
const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_ATTEMPTS_KEY = "consecutiveLoginFails";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [rollno, setRollno] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate =useNavigate();

  const showError = (message: string) => {
    setError(message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rollno || !password) {
      showError("Please enter both Roll No and Password.");
      return;
    }

    setLoading(true);
    setError("");

    let attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || "0", 10);

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: rollno, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // --- Failure Handling ---
        
        // Backend Lockout (403)
        if (response.status === 403) {
          localStorage.setItem(LOGIN_ATTEMPTS_KEY, MAX_LOGIN_ATTEMPTS.toString());
          showError(data.error || "Maximum login attempts exceeded. Redirecting...");
          setLoading(false); // Stop loading before redirect
          setTimeout(() => (window.location.href = THANK_YOU_PAGE_URL), 2000);
          return;
        }

        // Generic failure
        attempts++;
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, attempts.toString());

        const errorMessage =
          data.detail || data.message || "Login failed. Please check your credentials.";

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          showError(errorMessage + " Maximum attempts reached. Redirecting...");
          setTimeout(() => (window.location.href = THANK_YOU_PAGE_URL), 2000);
        } else {
          showError(`${errorMessage} (Attempt ${attempts}/${MAX_LOGIN_ATTEMPTS})`);
        }

        setLoading(false);
        return;
      }

      // --- Success ---
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, "0");

      if (data.access && data.refresh) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("userName", data.username || rollno); // Use API's username if available, fallback to entered rollno
      } else {
        // Handle case where API is successful but data payload is missing tokens
        throw new Error("Login successful but tokens were not received.");
      }

      onLogin?.()
      navigate('/dashboard',{replace : true}) // 🔥 THIS NAVIGATES AWAY FROM THIS COMPONENT 🔥
      
      // This setLoading(false) is mostly harmless now, as the component is unmounting.
      setLoading(false); 

    } catch (err: any) {
      setLoading(false);
      showError(err.message || "An unexpected network error occurred. Please try again.");
    }
  };

  return (
    <>
      <style>
        {`
          /* Global Styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box; 
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #ffffff;
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
          }

          .app-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
          }

          /* --- Left Panel (60% width, Blue Background) --- */
          .left-panel {
            flex: 0 0 60%; 
            background-color: #061943; 
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-center;
            padding: 50px;
            margin-right: -60px; /* Overlap effect */
            color: white;
            background-size: cover;
          }

          .left-panel-content {
            z-index: 10;
            max-width: 400px;
          }

          .company-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 80px;
            display: flex;
            align-items: center;
          }

          .company-name::before {
            content: "•";
            font-size: 24px;
            line-height: 0;
            margin-right: 10px;
          }

          .left-panel h1 {
            font-size: 48px;
            font-weight: 800;
            margin: 10px 0 0;
            line-height: 1.1;
          }

          .left-panel p {
            margin-top: 20px;
            font-size: 15px;
            line-height: 1.6;
            opacity: 0.8;
          }

          .left-panel .welcome-sub {
             font-size: 18px;
             font-weight: 400;
             margin-bottom: 5px;
          }
          .left-panel-image {
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            width: 40%;
            opacity: 0.8;
            margin-left: -195px;
            margin-bottom: 100px;
            
          }
            .productname{ /* Added dot for class selector */
               font-size: 250px;
               font-weight: 900; 
               font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
               margin-top: -20px;
               margin-bottom: -40px;
            }

          /* --- Right Panel (40% width, Login Form) --- */
          .right-panel {
            flex: 0 0 40%; 
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: white;
          }

          /* Login Container */
          .login-container {
            width: 100%;
            max-width: 400px; 
            padding: 40px 0;
            animation: fadeIn 0.5s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* Header and Form Styles */
          .login-header {
            text-align: center;
            padding: 0;
            margin-bottom: 30px;
          }

          .login-header h2 {
            font-size: 30px;
            font-weight: 700;
            color: #333;
            margin-bottom: 10px;
          }
          
          .login-header p {
             font-size: 14px;
             color: #999;
             line-height: 1.5;
          }

          .login-form {
            padding: 0;
          }

          .form-group {
            margin-bottom: 25px;
            position: relative;
          }

          .form-group label {
            display: block;
            margin-bottom: 15px;
            color: #333;
            font-size: 14px;
            font-weight: 500;
            text-align: left;
          }

          /* Input Field Styling */
          .form-group input {
            width: 100%;
            padding: 18px 20px;
            border: 1px solid #f0f0f0;
            border-radius: 5px;
            background-color: #f7f7f7;
            font-size: 16px;
            transition: all 0.3s ease;
            outline: none;
            color: #333;
          }

          .form-group input:focus {
            border-color: #1a75ff; 
            background-color: white;
            box-shadow: none; 
          }

          /* Remember Me and Forgot Password/Sign Up Link Layout */
          .remember-me {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            font-size: 14px;
          }
          
          .remember-me-checkbox-group {
             display: flex;
             align-items: center;
          }

          .remember-me input[type="checkbox"] {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            cursor: pointer;
            accent-color: #1a75ff; 
          }

          .remember-me label {
            font-size: 14px;
            color: #666;
            cursor: pointer;
            display: inline;
          }

          /* Login Button */
          .login-button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #111153 0%, #111154 100%); 
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 18px;
            font-weight: 600;
            text-transform: uppercase;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
            box-shadow: 0 10px 20px #111154;
          }

          .login-button:hover {
            transform: translateY(-1px);
            background: #111154;
          }

          .login-button:active {
            transform: translateY(0);
          }
          
          .login-button:disabled {
             opacity: 0.7;
             cursor: not-allowed;
          }

          /* Error Message Style */
          #error-message {
            color: #ff3860;
            font-weight: 500;
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            display: block;
          }

          /* --- Loading Overlay and Spinner --- */
          #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            background-color: rgba(255, 255, 255, 0.6);
          }

          .spinner {
            border: 5px solid #E0E0E0; /* Changed to a lighter color for the circle */
            border-top: 5px solid #111154; /* Blue top for spinning effect */
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .left-panel-witnot {
            width: 450px;
            margin-bottom: 300px;
            margin-left: -50px;
          }
         
        `}
      </style>

      <div className="app-wrapper">
        <div className="left-panel">
          <div className="left-panel-collab">
            {/* Note: Ensure the path to your assets is correct */}
            <img src={image} alt="image" className="left-panel-witnot" />
            <div className="left-panel-content"></div>
            <h1>Welcome to</h1><br></br><h1 className="productname">WITNOT</h1>
            <p className="welcome-sub">We're glad to have you here.</p>
          </div>          
          {/* Note: Ensure the path to your assets is correct */}
          <img src={cheating} alt="image" className="left-panel-image" />
        </div>

        <div className="right-panel">
          <div className="login-container">
            <div className="login-header">
              <h2>Login</h2>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="rollno">Enter your Roll No</label>
                <input
                  type="text"
                  id="rollno"
                  value={rollno}
                  onChange={(e) => setRollno(e.target.value)}
                  placeholder="Roll No"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Enter your Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="remember-me">
                <div className="remember-me-checkbox-group">
                    <input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember">Keep me signed in</label>
                </div>
              </div>

              {error && <div id="error-message">{error}</div>}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "PROCESSING..." : "SUBMIT"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {loading && (
        <div id="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
};

export default Login;
