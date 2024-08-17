'use client'
import { useContext, useEffect } from "react";
import { useState } from "react";
import { AuthContext } from "@/components/context";
import Loader from "@/components/Loader";

export default function ClientAuthGuard({ children }) {
  const auth = useContext(AuthContext)
  const [showChildren, setShowChildren] = useState(false)

  useEffect(() => {
    (async () => {
      if (!auth.loading && auth.user) {
        setShowChildren(true)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth])

  if (!showChildren) {
    return <Loader className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
  }

  return children
}