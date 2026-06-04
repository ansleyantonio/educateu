// Entry point for starting the Express server
import app from "./app";

// Get port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Handle unhandled promise rejections (e.g., fire-and-forget axios calls)
process.on("unhandledRejection", (reason: any) => {
  console.error("[Unhandled Rejection]", reason?.message || reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("[Uncaught Exception]", error.message);
  console.error(error.stack);
});

// Start the server and listen on specified port
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
