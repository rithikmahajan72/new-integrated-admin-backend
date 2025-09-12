import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Mail,
  Phone,
  ArrowLeft,
  AlertCircle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../store/slices/authSlice";

const AuthFlow = () => {
  console.log('AuthFlow component rendering...');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    isLoading: authLoading, 
    isAuthenticated, 
    user, 
    error: authError 
  } = useSelector(state => state.auth);
  
  console.log('AuthFlow state:', { authLoading, isAuthenticated, user, authError });

  const [currentScreen, setCurrentScreen] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    authMethod: "phone",
    email: "",
    phone: "5734567890", // Default admin phone
    password: "",
  });

  const [signupData, setSignupData] = useState({
    authMethod: "email",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [forgotData, setForgotData] = useState({
    authMethod: "email",
    email: "",
    phone: "",
  });

  // Handle authentication state changes
  useEffect(() => {
    console.log('AuthFlow useEffect triggered:', { isAuthenticated, user });
    if (isAuthenticated && user) {
      console.log('User authenticated:', user);
      // Check if user is admin
      if (user.isAdmin) {
        console.log('Admin authenticated, redirecting to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        // Non-admin users are not allowed to access admin panel
        setErrors({ general: 'Access denied. Admin privileges required.' });
        dispatch(clearError());
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setErrors({ general: authError });
    }
  }, [authError]);

  // Validation functions
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);
  const isValidPassword = (password) => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };
  const isValidName = (name) =>
    name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());

  const handleNumberInput = (e, dataType, field) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (dataType === "login") {
      setLoginData((prev) => ({ ...prev, [field]: value }));
    } else if (dataType === "signup") {
      setSignupData((prev) => ({ ...prev, [field]: value }));
    } else if (dataType === "forgot") {
      setForgotData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleChange = (field, value, dataType) => {
    if (dataType === "login") {
      setLoginData((prev) => ({ ...prev, [field]: value }));
    } else if (dataType === "signup") {
      setSignupData((prev) => ({ ...prev, [field]: value }));
    } else if (dataType === "forgot") {
      setForgotData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    const data = loginData;

    if (data.authMethod === "email") {
      if (!data.email) newErrors.email = "Email is required";
      else if (!isValidEmail(data.email))
        newErrors.email = "Please enter a valid email";
    } else {
      if (!data.phone) newErrors.phone = "Phone number is required";
      else if (!isValidPhone(data.phone))
        newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!data.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    const data = signupData;

    if (!data.firstName) newErrors.firstName = "First name is required";
    else if (!isValidName(data.firstName))
      newErrors.firstName = "Please enter a valid first name";

    if (!data.lastName) newErrors.lastName = "Last name is required";
    else if (!isValidName(data.lastName))
      newErrors.lastName = "Please enter a valid last name";

    if (data.authMethod === "email") {
      if (!data.email) newErrors.email = "Email is required";
      else if (!isValidEmail(data.email))
        newErrors.email = "Please enter a valid email";
    } else {
      if (!data.phone) newErrors.phone = "Phone number is required";
      else if (!isValidPhone(data.phone))
        newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = isValidPassword(data.password);
      if (
        !passwordValidation.minLength ||
        !passwordValidation.hasUpper ||
        !passwordValidation.hasLower ||
        !passwordValidation.hasNumber
      ) {
        newErrors.password =
          "Password must be at least 8 characters with uppercase, lowercase, and number";
      }
    }

    if (!data.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!data.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgot = () => {
    const newErrors = {};
    const data = forgotData;

    if (data.authMethod === "email") {
      if (!data.email) newErrors.email = "Email is required";
      else if (!isValidEmail(data.email))
        newErrors.email = "Please enter a valid email";
    } else {
      if (!data.phone) newErrors.phone = "Phone number is required";
      else if (!isValidPhone(data.phone))
        newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async () => {
    console.log('=== ADMIN LOGIN ATTEMPT ===');
    
    // Validate form inputs
    if (!validateLogin()) {
      console.log('Form validation failed');
      return;
    }

    // Clear previous errors
    setErrors({});
    setIsLoading(true);

    // Prepare login credentials
    const credentials = {
      phNo: loginData.phone,
      password: loginData.password
    };

    console.log('Attempting login with credentials:', credentials);

    try {
      // Call backend authentication API
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.success && data.data) {
        const { token, user } = data.data;
        console.log('Login successful. User data:', user);
        
        // Critical: Check if user has admin privileges
        if (user && user.isAdmin === true) {
          console.log('✅ Admin privileges confirmed - isAdmin:', user.isAdmin);
          
          // Store authentication data
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(user));
          
          // Show success popup and navigate to admin dashboard with sidebar
          setSuccessPopup(true);
          setTimeout(() => {
            setSuccessPopup(false);
            setIsLoading(false);
            window.location.href = 'http://localhost:3000/admin-dashboard';
          }, 1500);
          
        } else {
          console.log('❌ Access denied - User is not admin. isAdmin:', user?.isAdmin);
          setIsLoading(false);
          setErrors({ 
            general: 'Access denied. This account does not have admin privileges.' 
          });
        }
      } else {
        console.log('❌ Login failed:', data.message);
        setIsLoading(false);
        setErrors({ 
          general: data.message || 'Invalid credentials. Please check your phone number and password.' 
        });
      }
    } catch (error) {
      console.error('❌ Network/API error:', error);
      setIsLoading(false);
      setErrors({ 
        general: 'Unable to connect to server. Please check your internet connection and try again.' 
      });
    }
  };

  const handleSignupSubmit = async () => {
    if (!validateSignup()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessPopup(true);
    }, 1500);
  };

  const handleForgotSubmit = async () => {
    if (!validateForgot()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessPopup(true);
    }, 1500);
  };

  const handleContinue = () => {
    setSuccessPopup(false);
    setCurrentScreen("login");
    setErrors({});
    navigate("/");
  };

  const getPasswordStrength = (password) => {
    const validation = isValidPassword(password);
    const score = Object.values(validation).filter(Boolean).length;
    if (score < 2) return { strength: "Weak", color: "text-red-500" };
    if (score < 4) return { strength: "Medium", color: "text-yellow-500" };
    return { strength: "Strong", color: "text-green-500" };
  };

  const ErrorMessage = ({ error }) =>
    error ? (
      <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
        <AlertCircle size={14} />
        {error}
      </div>
    ) : null;

  const PasswordRequirements = ({ password }) => {
    if (!password) return null;
    const validation = isValidPassword(password);

    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium text-gray-600">
          Password requirements:
        </p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div
            className={`flex items-center gap-1 ${
              validation.minLength ? "text-green-600" : "text-gray-400"
            }`}
          >
            {validation.minLength ? (
              <Check size={12} />
            ) : (
              <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
            )}
            At least 8 characters
          </div>
          <div
            className={`flex items-center gap-1 ${
              validation.hasUpper ? "text-green-600" : "text-gray-400"
            }`}
          >
            {validation.hasUpper ? (
              <Check size={12} />
            ) : (
              <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
            )}
            One uppercase letter
          </div>
          <div
            className={`flex items-center gap-1 ${
              validation.hasLower ? "text-green-600" : "text-gray-400"
            }`}
          >
            {validation.hasLower ? (
              <Check size={12} />
            ) : (
              <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
            )}
            One lowercase letter
          </div>
          <div
            className={`flex items-center gap-1 ${
              validation.hasNumber ? "text-green-600" : "text-gray-400"
            }`}
          >
            {validation.hasNumber ? (
              <Check size={12} />
            ) : (
              <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
            )}
            One number
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Login Screen */}
          {currentScreen === "login" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Sign in
                </h1>
                <p className="text-gray-600">
                  Welcome back! Please sign in to your account
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => handleChange("authMethod", "email", "login")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      loginData.authMethod === "email"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Mail size={16} />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("authMethod", "phone", "login")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      loginData.authMethod === "phone"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Phone size={16} />
                    Phone
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {loginData.authMethod === "email"
                        ? "Email address"
                        : "Phone number"}
                    </label>
                    {loginData.authMethod === "email" ? (
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) =>
                          handleChange("email", e.target.value, "login")
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    ) : (
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={loginData.phone}
                        onChange={(e) => handleNumberInput(e, "login", "phone")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    )}
                    <ErrorMessage error={errors.email || errors.phone} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value, "login")
                        }
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage error={errors.password} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  disabled={authLoading || isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {authLoading || isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </button>

                <div className="flex justify-between items-center pt-4 text-sm border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("signup")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("forgot")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Signup Screen */}
          {currentScreen === "signup" && (
            <>
              <div className="flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("login")}
                  className="mr-3 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Create account
                  </h1>
                  <p className="text-gray-600">
                    Join us today! Create your account
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleChange("authMethod", "email", "signup")
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      signupData.authMethod === "email"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Mail size={16} />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange("authMethod", "phone", "signup")
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      signupData.authMethod === "phone"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Phone size={16} />
                    Phone
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First name
                    </label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={signupData.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value, "signup")
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage error={errors.firstName} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={signupData.lastName}
                      onChange={(e) =>
                        handleChange("lastName", e.target.value, "signup")
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage error={errors.lastName} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {signupData.authMethod === "email"
                      ? "Email address"
                      : "Phone number"}
                  </label>
                  {signupData.authMethod === "email" ? (
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value, "signup")
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  ) : (
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={(e) => handleNumberInput(e, "signup", "phone")}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  )}
                  <ErrorMessage error={errors.email || errors.phone} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) =>
                        handleChange("password", e.target.value, "signup")
                      }
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage error={errors.password} />
                  <PasswordRequirements password={signupData.password} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        handleChange(
                          "confirmPassword",
                          e.target.value,
                          "signup"
                        )
                      }
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <ErrorMessage error={errors.confirmPassword} />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={signupData.agreeToTerms}
                    onChange={(e) =>
                      handleChange("agreeToTerms", e.target.checked, "signup")
                    }
                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Privacy Policy
                      </a>
                    </label>
                    <ErrorMessage error={errors.agreeToTerms} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignupSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </>
          )}

          {/* Forgot Password Screen */}
          {currentScreen === "forgot" && (
            <>
              <div className="flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("login")}
                  className="mr-3 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Reset password
                  </h1>
                  <p className="text-gray-600">We'll send you a reset link</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleChange("authMethod", "email", "forgot")
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      forgotData.authMethod === "email"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Mail size={16} />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange("authMethod", "phone", "forgot")
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      forgotData.authMethod === "phone"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Phone size={16} />
                    Phone
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {forgotData.authMethod === "email"
                      ? "Email address"
                      : "Phone number"}
                  </label>
                  {forgotData.authMethod === "email" ? (
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotData.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value, "forgot")
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  ) : (
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={forgotData.phone}
                      onChange={(e) => handleNumberInput(e, "forgot", "phone")}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  )}
                  <ErrorMessage error={errors.email || errors.phone} />
                  <p className="text-xs text-gray-500 mt-1">
                    {forgotData.authMethod === "email"
                      ? "We'll send a password reset link to your email"
                      : "We'll send a password reset code to your phone"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleForgotSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    `Send reset ${
                      forgotData.authMethod === "email" ? "link" : "code"
                    }`
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Success Popup */}
        {successPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center space-y-4 w-80 mx-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentScreen === "login" && "Login Successful"}
                  {currentScreen === "signup" && "Account Created"}
                  {currentScreen === "forgot" && "Reset Link Sent"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {currentScreen === "login" &&
                    "You have been logged in successfully."}
                  {currentScreen === "signup" &&
                    "Your account has been created successfully."}
                  {currentScreen === "forgot" &&
                    `Reset ${
                      forgotData.authMethod === "email" ? "link" : "code"
                    } has been sent successfully.`}
                </p>
              </div>
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                {currentScreen === "forgot" ? "Back to Login" : "Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;
