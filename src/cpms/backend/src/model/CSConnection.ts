import * as WebSocket from "ws";
import {Emsp} from "./Emsp";
import {postReqHttp, postReqHttpAuth} from "../helper/misc";
import logger from "../helper/logger";
import {CS} from "./CS";

/**
 * Static class storing the connections to CSs via websockets,
 * it exposes basic methods to manage such connections.
 *
 * The connections are automatically added from the {@link BackendApp} class upon connection.
 *
 * @class
 */
export class CSDB {

    static readonly shared = new CSDB();
    private connections: CSConnection[] = [];

    public registerCS(connection: CSConnection) {
        this.connections.push(connection);
    }

    public unregisterCS(connection: CSConnection) {
        this.connections.splice(this.connections.indexOf(connection), 1);
    }

    public getConnectionToCSWithID(csID: number): CSConnection | undefined {
        return this.connections.find((conn) => conn.id == csID);
    }
}

/**
 * Class that wraps a websocket connection to a CS, offering the main methods to retrieve data from the
 * CS and to send commands to it in order to alter its state.
 *
 * @class
 */
export default class CSConnection {

    private readonly _id: number;
    private readonly _websocket: WebSocket;
    private _sockets: SocketMachine[];

    constructor(id: number, websocket: WebSocket) {
        this._id = id;
        this._sockets = [];
        this._websocket = websocket;
    }

    public startCharge(socketId: number, maximumTimeoutDate: number, eMSPId: number): boolean {
        console.log(this._sockets)
        const socket = (this.sockets()).find((sc) => sc.socketId == socketId);
        console.log(socket);
        if (socket) {
            if (socket.state == 1) {
                const request = {
                    request: "startCharge",
                    socketId: socketId,
                    maximumTimeoutDate: maximumTimeoutDate,
                    eMSPId: eMSPId
                };
                this._websocket.send(JSON.stringify(request));
                return true;
            }
        }
        return false;
    }

    public stopCharge(socketId: number): boolean {
        const socket = (this.sockets()).find((sc) => sc.socketId == socketId);
        if (socket) {
            if (socket.state == 2) {
                const request = {
                    request: "stopCharge",
                    socketId: socketId
                };
                this._websocket.send(JSON.stringify(request));
                return true;
            }
        }
        return false;
    }

    public getTimeRemaining(socketID: number): number | undefined {
        return (this.sockets()).find((sc) => sc.socketId == socketID)?.getEstimatedTimeRemaining();
    }

    get id(): number {
        return this._id;
    }

    public getSocket(socketId: number): SocketMachine | undefined {
        return (this.sockets()).find(sc => sc.socketId == socketId);
    }

    public sockets(): SocketMachine[] {
        return this._sockets;
    }

    public static async webSocketListener(message: string, connection: CSConnection) {
        const msg = JSON.parse(message);

        if(msg.type != undefined && msg.type == "socketsStatus") {
            msg.sockets.forEach((socket: any) => Object.setPrototypeOf(socket, SocketMachine.prototype));
            connection._sockets = msg.sockets;
        } else if (msg.type != undefined && msg.type == "chargeEnd") {
            msg.sockets.forEach((socket: any) => Object.setPrototypeOf(socket, SocketMachine.prototype));
            connection._sockets = msg.sockets;
            //Contact the eMSP that made the request
            const emsp = await Emsp.findById(msg.notifiedEMSPId);
            const cs = await CS.getCSDetails(connection._id);
            if (emsp) {
                const axiosResponse = await postReqHttpAuth(emsp.notificationEndpoint, emsp.APIKey, {
                    issuerCPMSName: "CPMS1",
                    affectedCSId: connection._id,
                    affectedSocketId: msg.affectedSocketId,
                    totalBillableAmount: Math.ceil(msg.billableDurationHours * cs.userPrice * msg.billablePower * 100) / 100
                })
                if (!axiosResponse) {
                    logger.error("An error occurred while contacting the EMSP. Retrying in 5s...")
                    const timeout = setInterval(() => {
                        this.retryEMSPPost(emsp, timeout);
                    }, 5000);
                }
            }
        }
    }

    private static async retryEMSPPost(emsp: Emsp, timer: NodeJS.Timer) {
        const axiosResponse = await postReqHttpAuth(emsp.notificationEndpoint, emsp.APIKey, {
            issuerCPMSName: "CPMS1"
        })
        if (axiosResponse) {
            clearInterval(timer);
            //TODO: Bill the eMSP????
        } else {
            logger.error("An error occurred while contacting the EMSP. Retrying in 5s...")
        }
    }
}

/**
 * Types of sockets available through the system
 */
export enum SocketType {
    Type1 = 50,
    Type2 = 30,
    Type3 = 60
}

/**
 * Sockets charging speeds available through the system
 */
export enum ChargeSpeedPower {
    Slow = 10,
    Fast = 40,
    UltraFast = 60
}

/**
 * Class used to represent the state of a CS's socket, it exposes getters for the entirety of a socket's data
 * and method to allow its state to be changed.
 *
 * When a connection with a CS is active, the CS periodically pushes an array of this class to the backend to keep it up
 * to date regarding its status.
 *
 * @class
 */
export class SocketMachine {

    private csId: number;
    private _socketId: number;
    private _state = 0; //STATES: 0 = Idle, 1 = Connected (not charging), 2 = Charging
    private _currentPower = 0;
    private readonly _maxPower: number;
    private _connectedCar?: CarData;

    private _chargeTimeoutIntervalID?: NodeJS.Timer;
    private _activeeMSPId?: number;
    private _chargeStartTime?: number;

    constructor(csId: number, socketId: number, socketType: SocketType, speed: ChargeSpeedPower, activeMSPId?: number, chargeStartTime?: number) {
        this.csId = csId;
        this._socketId = socketId;
        this._maxPower = Math.min(speed, socketType);
        this._activeeMSPId = activeMSPId;
        this._chargeStartTime = chargeStartTime;
    }

    public toJSON(): unknown {
        const tmp = new SocketMachine(this.csId, this._socketId, this._maxPower, this._maxPower, this._activeeMSPId, this._chargeStartTime);
        tmp._state = this._state;
        tmp._connectedCar = this._connectedCar;
        tmp._currentPower = this._currentPower;
        return tmp;
    }

    public connectCar() {
        if (this._state == 0) {
            this._state = 1;
            this._connectedCar = this.getCarData();
        } else {
            throw "Cannot connect a new car: a car is already connected!";
        }
    }

    public disconnectCar() {
        if (this._state == 1) {
            this._state = 0;
            this._currentPower = 0;
            this._connectedCar = undefined;
        } else {
            throw "Cannot disconnect a car";
        }
    }

    public chargeCar(maximumTimeoutDate: number, timeoutCallback: () => void, callereMSPId: number) {
        if (this._state == 1) {
            this._state = 2;
            if (!this._connectedCar) {
                throw "Cannot start a charge without getting car data first!";
            }
            this._currentPower = Math.min(this._maxPower, this._connectedCar.maxAcceptedPowerKW);
            //Compute the time remaining for the full change, and get the min time between the timeout and the full charge
            const timeToFullChargeSeconds = ((this._connectedCar.batteryCapacityKWh - this._connectedCar.remainingCapacityKWh) / this._currentPower) * 3600;
            const timeoutMS = Math.min(timeToFullChargeSeconds * 1000, maximumTimeoutDate - (new Date()).valueOf());
            this._activeeMSPId = callereMSPId;
            this._chargeStartTime = (new Date()).valueOf();
            this._chargeTimeoutIntervalID = setTimeout(() => {
                clearTimeout(this._chargeTimeoutIntervalID);
                timeoutCallback();
            }, timeoutMS);
        } else {
            throw "Cannot start charging a car";
        }
    }

    public stopChargeCar() {
        if (this._state == 2) {
            this._state = 1;
            this._currentPower = 0;
            this._activeeMSPId = undefined;
            this._chargeStartTime = undefined;
            clearTimeout(this._chargeTimeoutIntervalID);
        } else {
            throw "Cannot end a charge which never started!";
        }
    }

    public getEstimatedTimeRemaining(): number {
        if (this._state == 2 && this._connectedCar) {
            return (this._connectedCar.batteryCapacityKWh - this._connectedCar.remainingCapacityKWh) / this._currentPower;
        } else {
            throw "Cannot estimate time when no charge is ongoing!";
        }
    }

    public fullyChargeCar() {
        this.connectedCar.fullyCharge();
    }

    private getCarData(): CarData {
        const carDB = [new CarData("Tesla", 100, 30, 300),
            new CarData("Volkswagen", 80, 60, 150),
            new CarData("Toyota", 120, 90, 90),
            new CarData("Honda", 60, 55, 90),
            new CarData("Lexus", 300, 90, 400)];
        return carDB[Math.round(Math.random() * 4)];
    }

    get socketId(): number {
        return this._socketId;
    }

    get state(): number {
        return this._state;
    }

    get currentPower(): number {
        return this._currentPower;
    }

    get maxPower(): number {
        return this._maxPower;
    }

    get connectedCar(): CarData {
        return <CarData>this._connectedCar;
    }

    get activeeMSPId(): number | undefined {
        return this._activeeMSPId;
    }

    get chargeStartTime(): number | undefined {
        return this._chargeStartTime;
    }

    public toString(): string {
        return "" +
            "\nid: " + this._socketId +
            "\nstate: " + this.state +
            "\ncurPower: " + this.currentPower +
            "\nmaxPower: " + this.maxPower +
            "\ncar: " + (this._connectedCar == undefined ? "none" : this._connectedCar.manufacturer);
    }
}

/**
 * Mockup of the date a vehicle connected to a CS's socket would expose.
 *
 * @class
 */
export class CarData {
    private readonly _manufacturer: string;
    private readonly _batteryCapacityKWh: number;
    private _remainingCapacityKWh: number;
    private readonly _maxAcceptedPowerKW: number;

    constructor(manufacturer: string, batteryCapacityKWh: number, remainingCapacityKWh: number, maxAcceptedPowerKW: number) {
        this._manufacturer = manufacturer;
        this._batteryCapacityKWh = batteryCapacityKWh;
        this._remainingCapacityKWh = remainingCapacityKWh;
        this._maxAcceptedPowerKW = maxAcceptedPowerKW;
    }

    public fullyCharge() {
        this._remainingCapacityKWh = this._batteryCapacityKWh;
    }

    get manufacturer(): string {
        return this._manufacturer;
    }

    get batteryCapacityKWh(): number {
        return this._batteryCapacityKWh;
    }

    get remainingCapacityKWh(): number {
        return this._remainingCapacityKWh;
    }

    get maxAcceptedPowerKW(): number {
        return this._maxAcceptedPowerKW;
    }
}

