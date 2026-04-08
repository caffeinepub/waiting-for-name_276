import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";

// Lazy-load pages to keep foundation bundle small
const LoginPage = lazy(() => import("./pages/Login"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const ChildDetailPage = lazy(() => import("./pages/ChildDetail"));

function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <Skeleton key={k} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Root route acts as app shell
const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  ),
});

// Auth guard for protected routes
function useAuthGuard() {
  const { identity } = useInternetIdentity();
  try {
    const principal = identity?.getPrincipal().toText();
    return principal && principal !== "2vxsx-fae";
  } catch {
    return false;
  }
}

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    // Will be handled by component-level redirect
  },
  component: function IndexRedirect() {
    const isAuth = useAuthGuard();
    if (isAuth) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/login" });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: function LoginRoute() {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: function DashboardRoute() {
    return (
      <Suspense fallback={<PageLoader />}>
        <DashboardPage />
      </Suspense>
    );
  },
});

const childDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/children/$childId",
  component: function ChildDetailRoute() {
    return (
      <Suspense fallback={<PageLoader />}>
        <ChildDetailPage />
      </Suspense>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  childDetailRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        richColors={false}
        toastOptions={{
          classNames: {
            toast:
              "font-body text-sm shadow-elevated border border-border bg-card text-foreground",
            description: "text-muted-foreground",
          },
        }}
      />
    </ThemeProvider>
  );
}
