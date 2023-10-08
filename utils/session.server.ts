import { createCookieSessionStorage } from "@remix-run/node";

if (!process.env.SESSION_SECRET) {
    throw new Error("Session Secret environment variable is required.");
}
const sessionStroage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        sameSite: 'lax',
        path: '/',
        httpOnly: true,
        secrets: [process.env.SESSION_SECRET],
        secure: process.env.NODE_ENV === 'production',
    }
})

export { sessionStroage };