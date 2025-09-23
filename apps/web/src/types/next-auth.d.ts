// Types pour NextAuth.js

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName: string
      lastName: string
      role: string
      tenantId: string
      avatar?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
    avatar?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
  }
}
