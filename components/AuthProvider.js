'use client'
import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { app } from "@/lib/firebase/clientApp"
import { AuthContext } from "@/components/context"

export default function AuthProvider ({ children }) {
  const auth = getAuth(app)
  const [user, setUser] = useState(null)
  // const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // let unsubProfile

    const unsubUser = onAuthStateChanged(auth, async (user) => {
      
      // Get user profile
      if (user) {
        // const profile = await getProfile(db, user.uid)

        // Listen for profile changes
        // unsubProfile = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
        //   setProfile(doc.data())
        // })

        setUser(user)
        // setProfile(profile)
      } else {
        setUser(null)
        // setProfile(null)
      }
      
      setLoading(false)
    })
    
    return () => {
      unsubUser()
      // unsubProfile && unsubProfile()
    }
  }, [])

  // if (profile && profile.disabled) {
  //   return <div>Your account has been disabled</div>
  // }

  return (
    <AuthContext.Provider value={{ 
      user: user,
      // profile: profile,
      loading: loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}