import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/.env", destination: "/api/internal/security/honeypot" },
      { source: "/.env.local", destination: "/api/internal/security/honeypot" },
      { source: "/.env.production", destination: "/api/internal/security/honeypot" },
      { source: "/.git/config", destination: "/api/internal/security/honeypot" },
      { source: "/.git/HEAD", destination: "/api/internal/security/honeypot" },
      { source: "/backup.zip", destination: "/api/internal/security/honeypot" },
      { source: "/site-backup.zip", destination: "/api/internal/security/honeypot" },
      { source: "/database.sql", destination: "/api/internal/security/honeypot" },
      { source: "/db.sql", destination: "/api/internal/security/honeypot" },
      { source: "/config.php", destination: "/api/internal/security/honeypot" },
      { source: "/config.bak", destination: "/api/internal/security/honeypot" },
      { source: "/settings.old", destination: "/api/internal/security/honeypot" },
      { source: "/admin", destination: "/api/internal/security/honeypot" },
      { source: "/admin/login", destination: "/api/internal/security/honeypot" },
      { source: "/administrator", destination: "/api/internal/security/honeypot" },
      { source: "/wp-admin", destination: "/api/internal/security/honeypot" },
      { source: "/wp-login.php", destination: "/api/internal/security/honeypot" },
      { source: "/phpmyadmin", destination: "/api/internal/security/honeypot" },
      { source: "/server-status", destination: "/api/internal/security/honeypot" },
      { source: "/manager/html", destination: "/api/internal/security/honeypot" },
      { source: "/debug", destination: "/api/internal/security/honeypot" },
      { source: "/console", destination: "/api/internal/security/honeypot" },
      { source: "/graphql", destination: "/api/internal/security/honeypot" },
      { source: "/graphiql", destination: "/api/internal/security/honeypot" },
      { source: "/swagger", destination: "/api/internal/security/honeypot" },
      { source: "/swagger-ui", destination: "/api/internal/security/honeypot" },
      { source: "/api-docs", destination: "/api/internal/security/honeypot" },
      { source: "/openapi.json", destination: "/api/internal/security/honeypot" },
      { source: "/api/debug", destination: "/api/internal/security/honeypot" },
      { source: "/actuator", destination: "/api/internal/security/honeypot" },
      { source: "/actuator/health", destination: "/api/internal/security/honeypot" },
      { source: "/actuator/env", destination: "/api/internal/security/honeypot" }
    ];
  }
};

export default nextConfig;
