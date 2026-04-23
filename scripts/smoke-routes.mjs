const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const publicRoutes = ["/", "/pricing", "/services", "/catalog", "/tracking", "/blog"];
const protectedRoutes = [
  { path: "/dashboard", redirectTo: "/auth/login" },
  { path: "/supplier", redirectTo: "/auth/private-access" },
  { path: "/fulfillment", redirectTo: "/auth/private-access" },
];

async function checkPublicRoute(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  if (!response.ok) {
    throw new Error(`${path} expected 200, received ${response.status}`);
  }
  console.log(`ok public ${path}`);
}

async function checkProtectedRoute({ path, redirectTo }) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  if (response.status !== 307 && response.status !== 308) {
    throw new Error(`${path} expected redirect, received ${response.status}`);
  }
  if (!location.includes(redirectTo)) {
    throw new Error(`${path} expected redirect to ${redirectTo}, received ${location}`);
  }
  console.log(`ok protected ${path}`);
}

for (const route of publicRoutes) {
  await checkPublicRoute(route);
}

for (const route of protectedRoutes) {
  await checkProtectedRoute(route);
}
