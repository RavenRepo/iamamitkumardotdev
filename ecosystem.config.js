// PM2 Ecosystem Config — mypersonalportfolio
// https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [
    {
      name: "iamamitkumar",
      script: "server.js",
      cwd: "/var/www/devamitkumar",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      out_file: "/var/www/devamitkumar/logs/iamamitkumar-out.log",
      error_file: "/var/www/devamitkumar/logs/iamamitkumar-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
