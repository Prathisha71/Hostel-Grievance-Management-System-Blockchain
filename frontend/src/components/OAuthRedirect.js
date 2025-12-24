import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const OAuthRedirect = () => {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading || redirecting) return;

    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    const userParam = urlParams.get("user");

    if (tokenParam && userParam) {
      try {
        const userObj = JSON.parse(decodeURIComponent(userParam));
        login(userObj, tokenParam);

        setRedirecting(true); // prevent multiple redirects

        // 🔹 Redirect based on role
        if (userObj.role === "student") {
          navigate("/wifi-login"); // students now go to Wi-Fi login page
        } else if (userObj.role === "lowerAdmin") {
          navigate("/lower-admin");
        } else if (userObj.role === "higherAdmin") {
          navigate("/higher-admin");
        } else {
          navigate("/"); // fallback
        }

        // Clean up URL
        window.history.replaceState({}, "", "/");
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [login, navigate, loading, redirecting]);

  return <p>Loading...</p>;
};

export default OAuthRedirect;
