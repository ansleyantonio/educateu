import cron from "node-cron";
import { updateSessionStatuses } from "./scheduled-jobs";

/*
 * Scheduler for session-related jobs
 *
 * This file sets up scheduled tasks for automatic session management.
 * Currently, it runs the session status update job daily at midnight.
 */

// Schedule the session status update job to run daily at midnight (00:00)
// Cron format: second minute hour dayOfMonth month dayOfWeek
// 0 0 0 * * * means: at 0 seconds, 0 minutes, 0 hours (midnight), any day, any month, any day of week
export const startSessionScheduler = () => {
  console.log("Starting session scheduler...");
  
  // Run session status update daily at midnight
  cron.schedule("0 0 0 * * *", async () => {
    console.log("Running daily session status update job...");
    try {
      await updateSessionStatuses();
    } catch (error) {
      console.error("Error in session status update job:", error);
    }
  });
  
  console.log("Session scheduler started. Session status update job scheduled for daily execution at midnight.");
};