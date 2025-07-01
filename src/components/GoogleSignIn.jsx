import { GoogleOAuthProvider, GoogleLogin,useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Snackbar, Alert, CircularProgress, Box } from "@mui/material";

const GoogleSignIn = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    try {
      const backendResponse = await axios.post(`${API_BASE_URL}/auth/google`, {
        token: response.credential,
      });

      const { access_token, email, firstName } = backendResponse.data;
      console.log(backendResponse.data);
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("name", firstName);
      localStorage.setItem("email", email);
      localStorage.setItem("googleAccessToken", response.credential);

      setSnackbar({ open: true, message: "Login successful!", severity: "success" });
      console.log("navigating to /dashboard")
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
      console.log("After navigating to /dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      setSnackbar({ open: true, message: "Google login failed!", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setSnackbar({ open: true, message: "Google sign-in was cancelled or failed.", severity: "error" });
  };

    // ✅ Place hook correctly here
  useGoogleOneTapLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });



  return (
    
      <Box className="flex justify-center items-center flex-col gap-4 mt-6">
        {loading ? (
          <CircularProgress color="inherit" />
        ) : (

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            scope="email profile"
            access_type="offline"
            prompt="consent"
          />
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default GoogleSignIn;

