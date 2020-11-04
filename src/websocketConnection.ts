import { WEBSOCKET_ENDPOINT } from "./constants";

const WebSocket = require("ws");
const ws = new WebSocket(WEBSOCKET_ENDPOINT);

export default ws;
