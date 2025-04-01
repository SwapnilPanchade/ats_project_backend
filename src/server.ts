import http from "http";
import app from "./app";
import { setupWebSocket } from "./utils/websocket";

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
