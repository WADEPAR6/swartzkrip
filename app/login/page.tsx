import LoginButton from "@/components/LoginButton";

function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
            <p className="text-gray-500 text-sm mt-2">to continue to your account</p>
          </div>
          
          {/* User Info */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">K</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Kevin Ganán</p>
                <p className="text-xs text-gray-500">kganan0448@uta.edu.ec</p>
              </div>
            </div>
          </div>
          
          {/* Login Button */}
          <div className="mb-6">
            <LoginButton />
          </div>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          {/* Info Text */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Using Microsoft Azure Active Directory for secure authentication.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            © 2025 Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;