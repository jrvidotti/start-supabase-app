import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Login } from "../components/Login";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw new Error("Not authenticated");
    }
    // example of adding extra context
    return {
      teste: "123",
    };
  },
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return <Login />;
    }
    throw error;
  },
  component: () => (
    <>
      <div>Authenticated</div>
      <Outlet />
    </>
  ),
});
