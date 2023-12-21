import { messaging } from "firebase-admin";

import { AniDatabase } from "./AniDatabase.js";
import { AniUser } from "./AniUser.js";

export class AniMessaging {
    static removeToken = async (userId: string) => {
        await AniDatabase.database!.ref(`users/${userId}/mToken`).remove()
    }

    static setToken = async (userId: string, token: string) => {
        await AniDatabase.database!.ref(`users/${userId}/mToken`).set(token)
    }

    static getToken = async (userId: string): Promise<string | null> => {
        const ref = await AniDatabase.database!.ref(`users/${userId}/mToken`).get()
        if (ref.exists()) return ref.val()
        else return null
    }


    // #region Watchlist Updates
    static watchlist_animeAdded = async (
        watchId: number, 
        animeId: number, 
        userId: string, 
        followers: string[]
    ) => {

    }

    static watchlist_animeRemoved = async (
        watchId: number,
        animeId: number,
        followers: string[],
    ) => {

    }

    static watchlist_removed = async (
        watchId: any,
        followers: string[],
    ) => {

    }

    static watchlist_recovered = async(
        watchId: any,
        followers: string[]
    ) => {

    }

    // unused
    static watchlist_updated = async(
        watchId: any,
    ) => {

    }

    // #endregion

    
} 