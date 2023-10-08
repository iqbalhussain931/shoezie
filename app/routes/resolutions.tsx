import { Form, Link, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunctionArgs } from '@remix-run/node';
import { getXataClient } from "utils/xata";
import { Resolution } from "~/components/Resolution";
import { NewResolution } from "~/components/NewResolution"
import { authenticator } from "utils/auth.server";

const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    const xata = getXataClient();
    const resolutions = await xata.db.resolutions.filter({ "user.id": user.id }).getMany();
    // console.log(resolutions);
    return { resolutions, user }
}

const action: ActionFunction = async ({ request }) => {

    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    })

    const form = await request.formData();
    const action = form.get("action");
    const xata = getXataClient();
    const id = form.get("id");

    switch (action) {
        case "add": {
            const year = Number(form.get("year"))
            const isCompleted = !!form.get("isCompleted")
            const resolution = String(form.get("resolution"))

            const resolutions = await xata.db.resolutions.create({
                user,
                year,
                isCompleted,
                resolution,
            })
            return resolutions
        }
        case "complete": {
            if (typeof id !== "string") {
                return null;
            }

            const isCompleted = !!form.get("isCompleted");
            const resolution = await xata.db.resolutions.update(id, { isCompleted });
            return resolution;
        }
        case "delete": {
            if (typeof id !== "string") {
                return null;
            }
            const resolution = await xata.db.resolutions.delete(id);
            return resolution;
        }
        case "logout": {
            return authenticator.logout(request, { redirectTo: "/login" });
        }
    }
}

const ResoltuionPage = () => {

    const { resolutions, user } = useLoaderData<typeof loader>();

    return (
        <div className="p-10">
            <div className="grid grid-flow-col justify-between mb-16">
                <Link className="inline-block" to="/resolutions">
                    <h1 className="text-3xs font-bold">New Year's Resolutions for {user.email}</h1>
                </Link>

                <Form method="post">
                    <button
                        type="submit"
                        name="action"
                        value="logout"
                        className="bg-red-500 text-white py-1 px-3 rounded-md font-semibold"
                    >
                        Logout
                    </button>
                </Form>
            </div>
            <div className="grid grid-flow-row gap-y-10">
                <NewResolution />
                <div className="grid grid-cols-[repeat(4,auto)] justify-start items-center gap-x-8 gap-y-4">

                    {resolutions.length === 0 ? (
                        <p className="text-gray-500 italic">{`You made no resolutions!`}</p>
                    ) : (
                        resolutions.map(resolution => {
                            return (
                                <Resolution
                                    key={resolution.id}
                                    resolution={resolution}
                                />
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResoltuionPage;
export { loader, action };