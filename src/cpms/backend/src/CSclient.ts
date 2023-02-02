import { SocketMachine } from "./model/CSConnection";
import * as CS from "./model/CSConnection";
import * as readline from "readline";
import WebSocket = require("ws");

/**
 * This class is a mockup of a CS connecting to the CPMS's backend via websockets,
 * it contains the local data expected from a CS and allows a user to change such data
 * in a meaningful way via a basic (really basic indeed) CLI.
 */

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

    setInterval(async () => {
        await sendStatus();
    }, 2000);
});

async function sendStatus() {
    const msg = {
        type: "socketsStatus",
        sockets: sockets
    };
    await client.send(JSON.stringify(msg));
}

client.on("message", async (message: string) => {
    const msg = JSON.parse(message);
    const msgId = msg.unique_id;

    if(msg.status != undefined && msg.status == "error") {
        client.close();
        console.log("Connection refused, goodbye...");
        process.exit(0);
    } else if(msg.request != undefined && msg.request == "startCharge") {
        sockets[msg.socketId - 1].chargeCar(msg.maximumTimeoutDate, async () => await chargeTimeoutCallback(sockets[msg.socketsId - 1]), msg.eMSPId);
        await client.send(JSON.stringify({unique_id: msgId, status: true}));
        console.log("Sockets updated, press ENTER to refresh prompt....");
    } else if(msg.request != undefined && msg.request == "stopCharge") {
        const chargeStartTime = sockets[msg.socketId - 1].chargeStartTime;
        const billablePower = sockets[msg.socketId - 1].currentPower;
        const notifiedEMSPId = sockets[msg.socketId - 1].activeeMSPId;
        sockets[msg.socketId - 1].stopChargeCar();
        await chargeEndedCallback(sockets[msg.socketId - 1], chargeStartTime ? Date.now() - chargeStartTime : 0, billablePower, notifiedEMSPId, msgId);
        console.log("Sockets updated, press ENTER to refresh prompt....");
    } else if (msg.status == "ok") {
        await sendStatus();
    }
});

async function chargeTimeoutCallback(socket: SocketMachine) {
    const chargeStartTime = sockets[socket.socketId - 1].chargeStartTime;
    const billablePower = sockets[socket.socketId - 1].currentPower;
    const notifiedEMSPId = sockets[socket.socketId - 1].activeeMSPId;
    sockets[socket.socketId - 1].stopChargeCar();
    await chargeEndedCallback(sockets[socket.socketId - 1], chargeStartTime ? Date.now() - chargeStartTime : 0, billablePower, notifiedEMSPId);
}

async function chargeEndedCallback(socket: SocketMachine, billableTime: number, billablePower: number, eMSPId: number | undefined, synchronousMessageId?: any) {
    sockets[socket.socketId - 1].disconnectCar();
    //Send a message to the server to delete the booking and make the user pay
    const msg = {
        unique_id: synchronousMessageId,
        type: "chargeEnd",
        affectedSocketId: socket.socketId,
        timeoutDate: (new Date()).valueOf(),
        sockets: sockets,
        notifiedEMSPId: eMSPId,
        billableDurationHours: billableTime / (1000 * 3600),
        billablePower: billablePower
    };
    await client.send(JSON.stringify(msg));
}

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