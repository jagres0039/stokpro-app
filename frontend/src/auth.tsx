import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import { clearToken, getToken, login as apiLogin } from "./api/client"

type AuthValue = {
  token: string | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken())

  const value = useMemo<AuthValue>(
    () => ({
      token,
      signIn: async (username: string, password: string) => {
        const next = await apiLogin(username, password)
        setTokenState(next)
      },
      signOut: () => {
        clearToken()
        setTokenState(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
