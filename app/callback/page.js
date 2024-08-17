'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase/clientApp";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/clientApp";

// Get access token from Spotify
// https://developer.spotify.com/documentation/web-api/howtos/web-app-profile
export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:3000/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

// Get Spotify user profile
async function fetchSpotifyProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
     method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    (async () => {
      if (code) {
        try {
          // Get spotify access token
          const accessToken = await getAccessToken(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID, code)

          if (!accessToken) {
            throw new Error('Failed to get access token')
          }

          // Get Spotify user profile
          const { id } = await fetchSpotifyProfile(accessToken)

          if (!id) {
            throw new Error('Failed to get Spotify user profile')
          }

          const signUp = httpsCallable(functions, 'signUp')

          // Generate auth token based on Spotify user id
          /**
           * TODO:
           * In cloud function do some verification to check if spotify ID is valid
           */
          const { data: { firebaseAuthToken } } = await signUp({ userId: `spotify:${id}` })
  
          if (!firebaseAuthToken) {
            throw new Error('Failed to sign up')
          }

          // Sign in with custom token
          const user = await signInWithCustomToken(auth, firebaseAuthToken)

          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          router.push('/login');
        }
      }
    })()
  })

  if (!code) {
    router.push('/login');
    return null
  }

  return (
    <div>Signing in...</div>
  )
}