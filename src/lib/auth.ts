import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(db),

  session: {
    strategy: "database",
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
});



// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { db } from "@/lib/db";

// const googleClientId = process.env.GOOGLE_CLIENT_ID;
// const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
// const providers = googleClientId && googleClientSecret
//   ? [
//       Google({
//         clientId: googleClientId,
//         clientSecret: googleClientSecret,
//       }),
//     ]
//   : [];

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: PrismaAdapter(db),
//   providers,
//   session: {
//     strategy: "database",
//   },
//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },
//   callbacks: {
//     async session({ session, user }) {
//       if (session.user) {
//         session.user.id = user.id;
//       }
//       return session;
//     },
//   },
//   trustHost: true,
// });
