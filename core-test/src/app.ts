/*
 * Main Express application configuration for EducateU Core Backend
 *
 * This file sets up the Express application with all necessary middleware, routes,
 * and configurations. It serves as the central entry point for the application's
 * HTTP request handling.
 *
 * Author: EducateU Development Team
 * Version: 1.0.0
 */

import { initializeApp } from "./config/app.config";

// Export the configured Express application
// This allows the app to be imported and used in server.ts
//
export default initializeApp();
