import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Server-side check would require reading cookies here; we defer to a
    // client-side redirect via useUser in the child. For simplicity, we
    // let the child handle unauthenticated state.
    return {};
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}
