export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'zeru-dev-secret',
  databaseUrl: process.env.DATABASE_URL,
});
