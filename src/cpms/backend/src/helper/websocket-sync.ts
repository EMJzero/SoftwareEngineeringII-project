import WebSocket from "ws";
import {sleep} from "./misc";

export default class WSSync {

    private socket: WebSocket;
    private _nextMessageId: string;
    private _keepWaiting: Map<string, boolean>;
    private rcvdMessages: Map<string, any> = new Map();

    constructor(socket: WebSocket) {
        this.socket = socket;
        this._nextMessageId = this.generateUUID();
        this._keepWaiting = new Map();
    }

    private generateUUID(): string {
        let
            d = new Date().getTime(),
            d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16;
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
    };

    public async sendSync(object: any, timeoutMS: number = 5000): Promise<any> {
        const nextMessageId = this.generateUUID();
        object["unique_id"] = nextMessageId;
        this._keepWaiting.set(nextMessageId, true);
        await this.socket.send(JSON.stringify(object));
        const currentDateMS = Date.now();
        while (this._keepWaiting.get(nextMessageId)) {
            await sleep(200);
            if (Date.now() - currentDateMS > timeoutMS) {
                throw "Cannot contact the CS in time. Aborting...";
            }
        }
        this._keepWaiting.delete(nextMessageId);
        const rcvdMsg = this.rcvdMessages.get(nextMessageId);
        this.rcvdMessages.delete(nextMessageId);
        return rcvdMsg;
    }

    public handleMessage(msg: any) {
        if (this._keepWaiting.has(msg.unique_id)) {
            this.rcvdMessages.set(msg.unique_id, msg);
            this._keepWaiting.set(msg.unique_id, false);
        }
    }

    public isWaiting(msgId: string): boolean {
        return this._keepWaiting.get(msgId) ?? false;
    }

}