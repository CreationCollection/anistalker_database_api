import { initializeApp, cert, deleteApp, App, ServiceAccount } from "firebase-admin/app";
import { Database, getDatabase } from "firebase-admin/database";

export class AniDatabase {
    private static app: App | null = null
    static database: Database | null = null
    private static apiKey: string | null = null

    static init = () => {
        const sak = process.env.FIREBASE_SAK
        const databaseUrl = process.env.DATABASE_URL
        if (!sak) throw new Error('No Service Account Key found as FIREBASE_SAK environment variable')
        if (!databaseUrl) throw new Error('No Database url found as DATABASE_URL environment variable')
        this.app = initializeApp({
            credential: cert(sak),
            databaseURL: databaseUrl
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
        if (this.apiKey == null) {
            this.apiKey = (await this.database!.ref('passKey').get()).val()
        }
        return this.apiKey!
    }
}