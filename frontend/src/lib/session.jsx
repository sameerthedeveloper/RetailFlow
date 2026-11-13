// Holds the signed-in shopper and seller for the whole app.
// `undefined` means "still checking", `null` means "signed out".
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [users, setUsers] = useState({ customer: undefined, admin: undefined })

  const setUser = useCallback((role, user) => setUsers((prev) => ({ ...prev, [role]: user })), [])

  useEffect(() => {
    for (const role of ['customer', 'admin']) {
      api
        .currentUser(role)
        .then((user) => setUser(role, user))
        .catch(() => setUser(role, null))
    }
  }, [setUser])

  const value = useMemo(
    () => ({
      users,
      setUser,
      signOut: async (role) => {
        await api.logout(role)
        setUser(role, null)
      },
    }),
    [users, setUser],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(role) {
  const { users, setUser, signOut } = useContext(SessionContext)
  return {
    user: users[role],
    loading: users[role] === undefined,
    setUser: (user) => setUser(role, user),
    signOut: () => signOut(role),
  }
}
