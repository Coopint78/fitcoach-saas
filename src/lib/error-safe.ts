export function getSafeErrorMessage(error: unknown): string {
  // Never expose internal error details to client
  // Return generic message instead
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Recognize specific errors and return safe messages
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return "This record already exists";
    }
    if (msg.includes("foreign key") || msg.includes("constraint")) {
      return "Invalid reference";
    }
    if (msg.includes("not found")) {
      return "Record not found";
    }
    if (msg.includes("unauthorized") || msg.includes("permission denied")) {
      return "Access denied";
    }
  }

  // Default to generic message - never expose raw error details
  return "An error occurred";
}
