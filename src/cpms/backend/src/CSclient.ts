import { SocketMachine } from "./model/CSConnection";
import * as CS from "./model/CSConnection";
import * as readline from "readline";
import WebSocket = require("ws");

// Local state initialization

const CSID = 1;
const sockets: SocketMachine[] = [
    new SocketMachine(CSID, 1, CS.SocketType.Type1, CS.ChargeSpeedPower.Slow),
    new SocketMachine(CSID, 2, CS.SocketType.Type1, CS.ChargeSpeedPower.Slow),
    new SocketMachine(CSID, 3, CS.SocketType.Type2, CS.ChargeSpeedPower.Slow),
    new SocketMachine(CSID, 4, CS.SocketType.Type2, CS.ChargeSpeedPower.Slow)
];

// WebSocket connection and initialization

const client = new WebSocket("ws://localhost:3000");

client.on("open", async () => {
    // Send the current state on connection to be recognized
    const msg = {
        csId: CSID,
        socketsIds: sockets.map((socket) => socket.socketId)
    };
    await client.send(JSON.stringify(msg));

    setInterval(() => {
        const msg = {
            type: "socketsStatus",
            sockets: sockets
        };
        client.send(JSON.stringify(msg));
    }, 2000);
});

client.on("message", (message: string) => {
    const msg = JSON.parse(message);

    if(msg.status != undefined && msg.status == "error") {
        client.close();
        console.log("Connection refused, goodbye...");
        process.exit(0);
    } else if(msg.request != undefined && msg.request == "startCharge") {
        sockets[msg.socketId].chargeCar();
        console.log("Sockets updated, press ENTER to refresh prompt....");
    } else if(msg.request != undefined && msg.request == "stopCharge") {
        sockets[msg.socketId].stopChargeCar();
        console.log("Sockets updated, press ENTER to refresh prompt....");
    }
});

// CLI

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt(`\n----------------------\nCSID: ${CSID}\nSockets state:\n ${sockets.toString()}\nOperation -> `);
rl.prompt();

rl.on("line", (input) => {
    const inputs: string[] = input.trim().split(" ");
    if(inputs.length == 2 && sockets.map((socket) => socket.socketId).includes(parseInt(inputs[1]))) {
        try {
            switch (inputs[0]) {
            case "connectCar":
                sockets.forEach((socket) => {
                    if (socket.socketId == parseInt(inputs[1]))
                        socket.connectCar();
                });
                break;
            case "disconnectCar":
                sockets.forEach((socket) => {
                    if (socket.socketId == parseInt(inputs[1]))
                        socket.disconnectCar();
                });
                break;
            case "fullyCharge":
                sockets.forEach((socket) => {
                    if (socket.socketId == parseInt(inputs[1]))
                        socket.fullyChargeCar();
                });
                break;
            default:
                console.log("Invalid command...\n");
            }
        } catch (error) {
            console.log("Invalid operation...");
        }
    } else {
        switch(inputs[0]) {
        case "quit":
            client.close();
            process.exit(0);
            break;
        default:
            console.log("Invalid command...\n");
        }
    }
    rl.setPrompt(`\n----------------------\nCSID: ${CSID}\nSockets state:\n ${sockets.toString()}\nOperation -> `);
    rl.prompt();
});