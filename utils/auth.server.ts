import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStroage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import { getXataClient, UsersRecord } from "./xata";
import bcrypt from "bcryptjs";

const authenticator = new Authenticator<UsersRecord>(sessionStroage);

const formStrategy = new FormStrategy(async ({ form }) => {
    const xata = getXataClient();
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const user = await xata.db.users.filter({ email }).getFirst();

    if (!user) {
        throw new AuthorizationError("Invalid email address");
    }

    const passwordMatch = await bcrypt.compare(password, user.password as string);

    if (!passwordMatch) {
        throw new AuthorizationError("Invalid password");
    }

    return user;
});

authenticator.use(formStrategy, "form");

export { authenticator };