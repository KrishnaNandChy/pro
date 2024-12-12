import React, { useState, useEffect } from "react";
import Head from "next/head";
import Cookies from "js-cookie";
import "../styles/globals.css";

import { Auth } from "../Components/index";

export default function App({ Component, pageProps }) {
  const [auth, setAuth] = useState(null); // Initializing to null for better loading state
  const [loading, setLoading] = useState(true); // Loading state to ensure the cookie check happens first

  useEffect(() => {
    const storedCookieValue = Cookies.get("token");
    if (storedCookieValue) {
      setAuth(false); // User is authenticated
    } else {
      setAuth(true); // User is not authenticated
    }
    setLoading(false); // After checking cookie, stop loading
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can show a loader if needed while checking the auth state
  }

  return (
    <>
      <Head>
        <title>AI Image Generator</title>
        <meta
          name="description"
          content="AI Image Art Generator powered by @theblockchaincoders"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/assets/ailogo.png" />
      </Head>
      {auth && <Auth />} {/* Render Auth if user is not authenticated */}
      <Component {...pageProps} />
    </>
  );
}
