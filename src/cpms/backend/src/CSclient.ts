import { SocketMachine } from "./model/CSConnection";
import * as CSModel from "./model/CS";
import * as CS from "./model/CSConnection";
import * as readline from "readline";
import WebSocket = require("ws");
import * as fs from "fs";
import { sleep } from "./helper/misc";

/**
 * This class is a mockup of a CS connecting to the CPMS's backend via websockets,
 * it contains the local data expected from a CS and allows a user to change such data
 * in a meaningful way via a basic (really basic indeed) CLI.
 */

// Local state initialization

const args = process.argv.splice(2);
let CSID = 1;
if (args[1] === "--cs") {
    CSID = parseInt(args[2]);
    if (CSID) {
        if (CSID < 0 || isNaN(CSID)) {
            CSID = 1;
        }
    } else {
        CSID = 1;
    }
}
const csdump = args[0];
const socketDB = JSON.parse(fs.readFileSync(csdump, "utf8")) as CSModel.CS[];

const csData = socketDB.find((cs) => cs.id == CSID);
const socketsData = csData?.sockets;
let sockets: SocketMachine[] = [
    new SocketMachine(CSID, 1, CS.SocketType.Type1, CS.ChargeSpeedPower.Slow),
    new SocketMachine(CSID, 2, CS.SocketType.Type1, CS.ChargeSpeedPower.Slow),
    new SocketMachine(CSID, 3, CS.SocketType.Type2, CS.ChargeSpeedPower.Slow),
    new SocketMachine(CSID, 4, CS.SocketType.Type2, CS.ChargeSpeedPower.Slow)
];

if (socketsData) {
    sockets = socketsData.map((socketData) => {
        return new SocketMachine(CSID, socketData.id, socketData.type.maxPower, socketData.type.maxPower);
    });
}

// WebSocket connection and initialization
let client: WebSocket;// = new WebSocket("ws://localhost:3000");
connect();
let didOpen = false;

function connect() {
    client = new WebSocket("ws://localhost:3000");

    client.on("open", async () => {
        didOpen = true;
        // Send the current state on connection to be recognized
        const msg = {
            csId: CSID,
            socketsIds: sockets.map((socket) => socket.socketId)
        };
        try {
            await client.send(JSON.stringify(msg));
        } catch {
            while (client.readyState == 0) {
                sleep(500);
            }
            await client.send(JSON.stringify(msg));
        }

        setInterval(async () => {
            await sendStatus();
        }, 2000);

        rl.emit("line", "");
    });

    async function sendStatus() {
        try {
            const msg = {
                type: "socketsStatus",
                sockets: sockets
            };
            await client.send(JSON.stringify(msg));
        } catch {
            console.log("Cannot send data to the CPMS. Skipping packet...");
        }
    }

    client.on("message", async (message: string) => {
        const msg = JSON.parse(message);
        const msgId = msg.unique_id;
        const socketIndex = sockets.findIndex((socket) => socket.socketId == msg.socketId);

        if(msg.status != undefined && msg.status == "error") {
            client.close();
            console.log("Connection refused, goodbye...");
            process.exit(0);
        } else if(msg.request != undefined && msg.request == "startCharge") {
            sockets[socketIndex].chargeCar(msg.maximumTimeoutDate, async () => await chargeTimeoutCallback(sockets[socketIndex]), msg.eMSPId);
            await client.send(JSON.stringify({ unique_id: msgId, status: true, sockets: sockets }));
            console.log("Sockets updated, press ENTER to refresh prompt....");
        } else if(msg.request != undefined && msg.request == "stopCharge") {
            const chargeStartTime = sockets[socketIndex].chargeStartTime;
            const billablePower = sockets[socketIndex].currentPower;
            const notifiedEMSPId = sockets[socketIndex].activeeMSPId;
            sockets[socketIndex].stopChargeCar();
            await chargeEndedCallback(sockets[socketIndex], chargeStartTime ? Date.now() - chargeStartTime : 0, billablePower, notifiedEMSPId, msgId);
            console.log("Sockets updated, press ENTER to refresh prompt....");
        } else if (msg.status == "ok") {
            await sendStatus();
        }
    });

    let didTryReconnect = false;
    client.on("close", () => {
        //On connection close the CS should try to reconnect to the cpms
        console.log("The CPMS did not respond. Trying to reconnect in 2 seconds...");
        reconnect(2000);
    });

    client.on("error", () => {});

    function reconnect(timeout: number) {
        if (!didTryReconnect) {
            didTryReconnect = true;
            setTimeout(() => {
                connect();
            }, timeout);
        }
    }
}

async function chargeTimeoutCallback(socket: SocketMachine) {
    const socketIndex = sockets.findIndex((socketA) => socketA.socketId == socket.socketId);

    const chargeStartTime = sockets[socketIndex].chargeStartTime;
    const billablePower = sockets[socketIndex].currentPower;
    const notifiedEMSPId = sockets[socketIndex].activeeMSPId;
    sockets[socketIndex].stopChargeCar();
    await chargeEndedCallback(sockets[socketIndex], chargeStartTime ? Date.now() - chargeStartTime : 0, billablePower, notifiedEMSPId);
}

async function chargeEndedCallback(socket: SocketMachine, billableTime: number, billablePower: number, eMSPId: number | undefined, synchronousMessageId?: any) {
    const socketIndex = sockets.findIndex((socketA) => socketA.socketId == socket.socketId);
    sockets[socketIndex].disconnectCar();
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
            /*case "fullyCharge":
                sockets.forEach((socket) => {
                    if (socket.socketId == parseInt(inputs[1]))
                        socket.fullyChargeCar();
                });
                break;*/
            default:
                console.log("Invalid command...\n");
            }
        } catch (error) {
            console.log("Invalid operation...");
        }
    } else {
        switch(inputs[0]) {
        case "help":
            console.log("Available commands:" +
                "- connectCar [socketId] : simulates a car connecting to the given socket\n" +
                "- disconnectCar [socketId] : simulates a car disconnecting from the given socket\n" +
                "- fullyCharge [socketId] : simulates a car charging completely over the given socket\n" +
                "- quit : closes the program");
            break;
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