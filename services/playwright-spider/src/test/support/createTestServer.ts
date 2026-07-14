import express from "express";
import type { Express } from "express";
import type { AddressInfo } from "node:net";

export interface TestServer {
    baseUrl: string;
    close: () => Promise<void>;
}

export async function startTestServer(configure: (app: Express) => void): Promise<TestServer> {
    const app = express();
    app.use(express.json());
    configure(app);

    const server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;

    return {
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        }),
    };
}
