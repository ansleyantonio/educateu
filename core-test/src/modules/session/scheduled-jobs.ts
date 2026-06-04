import prisma from "../../prismaClient";
import { SessionStatus } from "@prisma/client";
import createAuditLog from "../../utils/auditlog";

/*
 * Updates session statuses based on current date compared to session dates
 *
 * Logic:
 * - Sessions that have started but not ended should be marked as ACTIVE
 * - Sessions scheduled to start in the future should be marked as UPCOMING
 * - Sessions that have ended should be marked as CLOSED
 * - TEMPORARILY_ACTIVE sessions are preserved and not automatically changed
 *
 * Business Rule: Only one session can be ACTIVE at a time.
 * If multiple sessions qualify as ACTIVE, the one with the earliest start date is chosen.
 */
export const updateSessionStatuses = async () => {
  try {
    const now = new Date();
    
    // Get all sessions with their date fields
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        year: true,
        intakePeriod: true
      }
    });
    
    // Track how many sessions we update
    let updatedCount = 0;
    
    // Find all sessions that should be active (started but not ended)
    // Exclude TEMPORARILY_ACTIVE sessions from automatic status updates
    const sessionsThatShouldBeActive = sessions.filter(session => 
      now >= session.startDate && 
      now <= session.endDate && 
      session.status !== "TEMPORARILY_ACTIVE"  // Don't change TEMPORARILY_ACTIVE sessions
    );
    
    // Sort by startDate to prioritize the earliest one
    sessionsThatShouldBeActive.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    // Determine which session should actually be active (the first one)
    const sessionThatShouldBeActive = sessionsThatShouldBeActive.length > 0 ? sessionsThatShouldBeActive[0] : null;
    
    // If there's a session that should be active, ensure only one session is active
    if (sessionThatShouldBeActive) {
      // Close any currently ACTIVE sessions that are not the one that should be active
      // Note: We don't touch TEMPORARILY_ACTIVE sessions here
      const activeSessions = sessions.filter(session => session.status === "ACTIVE");
      
      for (const activeSession of activeSessions) {
        if (activeSession.id !== sessionThatShouldBeActive.id) {
          await prisma.session.update({
            where: { id: activeSession.id },
            data: { status: "CLOSED" }
          });
          
          // Create audit log for the status change
          await createAuditLog({
            userId: "system", // System-generated log
            action: `Session "${activeSession.name}" status automatically updated from ACTIVE to CLOSED due to new active session`,
            actionType: "course_management",
          });
          
          updatedCount++;
        }
      }
      
      // Update the session that should be active if it's not already active
      // Don't change TEMPORARILY_ACTIVE sessions to ACTIVE
      if (sessionThatShouldBeActive.status !== "ACTIVE" && sessionThatShouldBeActive.status !== "TEMPORARILY_ACTIVE") {
        await prisma.session.update({
          where: { id: sessionThatShouldBeActive.id },
          data: { status: "ACTIVE" }
        });
        
        // Create audit log for the status change
        await createAuditLog({
          userId: "system", // System-generated log
          action: `Session "${sessionThatShouldBeActive.name}" status automatically updated to ACTIVE`,
          actionType: "course_management",
        });
        
        updatedCount++;
      }
    } else {
      // No session should be active, close all ACTIVE sessions
      // Don't touch TEMPORARILY_ACTIVE sessions
      const activeSessions = sessions.filter(session => session.status === "ACTIVE");
      
      for (const activeSession of activeSessions) {
        await prisma.session.update({
          where: { id: activeSession.id },
          data: { status: "CLOSED" }
        });
        
        // Create audit log for the status change
        await createAuditLog({
          userId: "system", // System-generated log
          action: `Session "${activeSession.name}" status automatically updated from ACTIVE to CLOSED`,
          actionType: "course_management",
        });
        
        updatedCount++;
      }
    }
    
    // Handle other status updates (UPCOMING and CLOSED)
    // Don't change TEMPORARILY_ACTIVE sessions
    for (const session of sessions) {
      // Skip TEMPORARILY_ACTIVE sessions as they should be manually managed
      if (session.status === "TEMPORARILY_ACTIVE") {
        continue;
      }
      
      // Skip the session that should be active as we already handled it
      if (sessionThatShouldBeActive && session.id === sessionThatShouldBeActive.id) {
        continue;
      }
      
      let newStatus: SessionStatus | null = null;
      
      // Determine the correct status based on dates
      if (now < session.startDate) {
        newStatus = "UPCOMING";
      } else if (now > session.endDate) {
        newStatus = "CLOSED";
      }
      
      // Update the session if the status has changed
      if (newStatus && newStatus !== session.status) {
        await prisma.session.update({
          where: { id: session.id },
          data: { status: newStatus }
        });
        
        // Create audit log for the status change
        await createAuditLog({
          userId: "system", // System-generated log
          action: `Session "${session.name}" status automatically updated from ${session.status} to ${newStatus}`,
          actionType: "course_management",
        });
        
        updatedCount++;
      }
    }
    
    console.log(`Session status update job completed. Updated ${updatedCount} sessions.`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error updating session statuses:", error);
    throw error;
  }
};