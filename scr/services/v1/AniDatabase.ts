import { initializeApp, cert, deleteApp, App, ServiceAccount } from "firebase-admin/app";
import { Database, getDatabase } from "firebase-admin/database";

import * as serviceAccount from '../../serviceAccountKey.json';

export class AniDatabase {
    private static app: App | null = null
    static database: Database | null = null

    static init = () => {
        this.app = initializeApp({
            credential: cert(serviceAccount as ServiceAccount),
            databaseURL: "https://redline-anistalker-default-rtdb.asia-southeast1.firebasedatabase.app/"
        })
        this.database = getDatabase(this.app)
    }

    static dispose = () => {
        if (this.app) {
            deleteApp(this.app)
        }
    }

    static baseTimestamp = async (): Promise<number> => {
        return (await this.database!.ref('baseTimestamp').get()).val()
    }

    static passKey = async ():Promise<string> => {
        return (await this.database!.ref('passKey').get()).val()
    }
}