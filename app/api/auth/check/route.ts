export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id");
  const tenantId = req.headers.get("x-tenant-id");
  const role = req.headers.get("x-user-role");

  if (!userId) {
    return new Response(JSON.stringify({ loggedIn: false, user: null }), {
      status: 401,
    });
  }

  return new Response(
    JSON.stringify({
      loggedIn: true,
      user: { id: userId, tenantId, role },
    }),
    { status: 200 }
  );
}
