export default function handler(_request, response) {
  response.status(200).json({
    service: "hobee-backend",
    status: "ready",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
