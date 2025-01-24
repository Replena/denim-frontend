app.use(
  cors({
    origin: [
      "https://denim-frontend-33lo11gc9-replenas-projects.vercel.app",
      "https://denim-frontend.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
