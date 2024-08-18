'use client'

import Logo from "@/components/Logo";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";

const permissions = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-private",
  "playlist-modify-public",
  "ugc-image-upload",
  "user-top-read",
]

// Redirect to Spotify auth flow
export async function redirectToAuthFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", `${process.env.NEXT_PUBLIC_DOMAIN}/callback`);
  params.append("scope", permissions.join(" "));
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

export default function LoginPage() {
  async function handleLogin() {
    await redirectToAuthFlow(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID)
  }

  return (
    <div>
      <main className="flex flex-col min-h-[calc(100svh-60px)]">
        <Section className="flex-1" classNameInner="space-y-8">
          <div className="space-y-4 m-auto">
            <Logo className="w-32 h-32 mx-auto" />
            <h1 className="text-2xl font-medium text-center">SurroundSound</h1>
            <p className="text-base text-center">Playlist generator based on your surroundings, mood, and favourite artists.</p>
          </div>
        </Section>
        <Section classNameInner="space-y-8">
          <div className="pb-4 w-full">
            <Button onClick={handleLogin} className="bg-[#1ED760] text-black text-md w-full rounded-full">Login with Spotify</Button>
          </div>
        </Section>
      </main>
    </div>
  )
}