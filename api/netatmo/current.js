export async function GET() {
  return Response.json({
    connected: false,
    message: 'Netatmo endpoint běží',
    debug: {
      hasClientId: Boolean(process.env.NETATMO_CLIENT_ID),
      hasClientSecret: Boolean(process.env.NETATMO_CLIENT_SECRET),
      hasRefreshToken: Boolean(process.env.NETATMO_REFRESH_TOKEN),
    },
  });
}
