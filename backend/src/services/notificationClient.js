const DEFAULT_TIMEOUT_MS = 3000;

const sendNotificationEvent = async (eventType, payload) => {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
  if (!baseUrl) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    await fetch(`${baseUrl.replace(/\/$/, "")}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NOTIFICATION_SERVICE_API_KEY
          ? { "x-api-key": process.env.NOTIFICATION_SERVICE_API_KEY }
          : {}),
      },
      body: JSON.stringify({
        eventType,
        payload,
        createdAt: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
  } catch (error) {
    console.warn("Notification microservice unreachable:", error.message);
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { sendNotificationEvent };
