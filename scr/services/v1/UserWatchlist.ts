import { AniDatabase } from "./AniDatabase.js";
import { AniMessaging } from "./AniMessaging.js";
import { AniUser } from "./AniUser.js";

import axios, { AxiosError } from "axios";

export class UserWatchlist {
    static createWatchlist = async (
        token: string,
        title: string,
        privacy: "public" | 'shared' | 'private'
    ): Promise<any> => {
        const userId = await AniUser.getUserId(token)
        if (userId) {
            const user = await AniUser.getUsername(userId)
            const watchId = Date.now() - await AniDatabase.baseTimestamp()

            const watchlistRef = AniDatabase.database!.ref(`watchlist_collection/${watchId}`)
            const userWatchlistRef = AniDatabase.database!.ref(`users/${userId}/watchlist/active`)

            const watchlist = {
                id: watchId,
                title,
                privacy,
                owner: user,
                series: [],
                followers: [],
            }

            userWatchlistRef.child(watchId.toString()).set(true)
            watchlistRef.set(watchlist)

            return watchlist
        }
        else {
            this.handleError(userId, null, null)
        }
        return null
    }

    static addWatchlist = async (token: string, watchId: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const result = await Promise.all([
            AniUser.getUserId(token),
            this.getWatchlist(watchId)
        ])
        userId = result[0]
        watchlist = result[1]

        if (userId && watchlist) {
            const userRef = AniDatabase.database!.ref(`users/${userId}/watchlist/active`)
            await Promise.all([
                userRef.child(watchId.toString()).set(true),
                AniDatabase.database!.ref(`watchlist_collection/${watchId}/followers/${userId}`).set(true)
            ])

            return watchlist
        }
        else {
            this.handleError(userId, null, watchlist)
        }
        return null
    }

    static removeWatchlist = async (token: string, watchId: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const userVerify = AniUser.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)

        const result = await Promise.all([userVerify, watchlistVerify])
        userId = result[0]
        watchlist = result[1]

        if (userId && watchlist && !watchlist.archive) {
            const userRef = AniDatabase.database!.ref(`users/${userId}/watchlist`)
            const data = await userRef.child(`active/${watchId}`).get()
            if (data.exists()) {
                const user = await AniUser.getUsername(userId)

                if (watchlist.owner == user) {
                    await Promise.all([
                        data.ref.remove(),
                        userRef.child(`archive/${watchId}`).set(true),
                        AniDatabase.database!.ref(`watchlist_collection/${watchId}/archive`).set(true),
                        AniMessaging.watchlist_removed(watchId, watchlist.followers),
                    ])
                }
                else {
                    await Promise.all([
                        data.ref.remove(),

                    ])
                }
                return true
            }
        }
        else {
            this.handleError(userId, null, watchlist)
        }
        return false
    }

    static recoverWatchlist = async (token: string, watchId: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const userVerify = AniUser.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)

        const result = await Promise.all([userVerify, watchlistVerify])
        userId = result[0]
        watchlist = result[1]

        if (userId && watchlist && watchlist.archive) {
            const user = await AniUser.getUsername(userId)
            if (watchlist.owner != user) return null

            const userRef = AniDatabase.database!.ref(`users/${userId}/watchlist`)
            const data = await userRef.child(`archive/${watchId}`).get()
            
            if (data.exists()) {
                await Promise.all([
                    data.ref.remove(),
                    userRef.child(`active/${watchId}`).set(true),
                    AniDatabase.database!.ref(`watchlist_collection/${watchId}/archive`).set(false),
                    AniMessaging.watchlist_recovered(watchId, watchlist.followers),
                ])
                return watchlist
            }
        }
        else {
            if (!watchlist.archive) throw new Error("Watchlist is not archived!")
            this.handleError(userId, null, watchlist)
        }
        return null
    }

    static addAnimeToWatchlist = async (token: string, watchId: number, anime: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any | null = null
        let validAnime: boolean = false

        const userIdVerify = AniUser.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)
        const animeVerify = this.verifyAnimeId(anime)

        const result = await Promise.all([userIdVerify, watchlistVerify, animeVerify])
        userId = result[0]
        watchlist = result[1]
        validAnime = result[2]

        if (validAnime && watchlist && userId && !watchlist.archive) {
            const watchlistRef = AniDatabase.database!.ref(`watchlist_collection/${watchId}/series/${anime}`)
            const username = await AniUser.getUsername(userId)
            if (watchlist.owner == username || watchlist.privacy == 'public') {
                let data = await watchlistRef.get()
                if (!data.exists()) {
                    await Promise.all([
                        watchlistRef.set(username),
                        AniMessaging.watchlist_animeAdded(watchId, anime, userId, watchlist.followers),
                    ])
                    return true
                }
                else throw new Error('Anime Already Exists!')
            }
            else {
                throw new Error('Either you are not the owner or watclist is not public')
            }
        }
        else {
            this.handleError(userId, validAnime, watchlist)
        }
        return false
    }

    static removeAnimeFromWatchlist = async (token: string, watchId: number, anime: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any | null = null
        let validAnime: boolean = false

        const userIdVerify = AniUser.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)
        const animeVerify = this.verifyAnimeId(anime)

        const result = await Promise.all([userIdVerify, watchlistVerify, animeVerify])
        userId = result[0]
        watchlist = result[1]
        validAnime = result[2]

        if (validAnime && watchlist && userId && !watchlist.archive) {
            const watchlistRef = AniDatabase.database!.ref(`watchlist_collection/${watchId}/series/${anime}`)
            const data = await watchlistRef.get()

            if (data.exists()) {
                const username = await AniUser.getUsername(userId)
                if (
                    watchlist.owner == username ||
                    (watchlist.privacy == 'public' && data.val() == username)
                ) {
                    await Promise.all([
                        watchlistRef.remove(),
                        AniMessaging.watchlist_animeRemoved(watchId, anime, watchlist.followers),
                    ])
                    return true
                }
            }
        }
        else {
            this.handleError(userId, validAnime, watchlist)
        }
        return false
    }

    static updateWatchlist = async (
        token: string,
        watchId: number,
        title: string,
        privacy: 'public' | 'shared' | 'private'
    ): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const userVerify = AniUser.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)

        const result = await Promise.all([userVerify, watchlistVerify])
        userId = result[0]
        watchlist = result[1]

        if (userId && watchlist && !watchlist.archive) {
            const watchlistRef = AniDatabase.database!.ref(`watchlist_collection/${watchId}`)
            await watchlistRef.update({
                title,
                privacy
            })

            return (await watchlistRef.get()).val()
        }
        else {
            this.handleError(userId, null, watchlist)
        }
        return null
    }

    static getWatchlist = async (watchId: number): Promise<any> => {
        const ref = AniDatabase.database!.ref(`watchlist_collection/${watchId}`)
        const value = await ref.get()
        return value.val()
    }

    static getWatchlistBySharedId = async (sharedId: string): Promise<any> => {
        const data = atob(sharedId)
        const watchId = /^[0-9]+$/.test(data) ? parseInt(data) : null
        if (watchId == null) return null 
        return this.getWatchlist(watchId)
    }


    private static verifyAnimeId = async (animeId: number): Promise<boolean> => {
        try {
            const res = await axios.get(`https://stalk-anime.up.railway.app/anime/${animeId}`)
            if (res.status / 100 == 2) return true
            else return false
        }
        catch (err: any) {
            if (err instanceof AxiosError) {
                if (err.response?.status || 100 / 100 != 2) return false
                else throw new Error(err.response?.data)
            }
            else {
                throw new Error(err)
            }
        }
    }

    private static handleError(userId: string | null, validAnime: boolean | null, watchlist: any | null) {
        if (!userId) {
            throw new Error('Invalid Token')
        }
        else if (validAnime != null && !validAnime) {
            throw new Error('Invalid AnimeId')
        }
        else if (!watchlist) {
            throw new Error('Invalid WatchId')
        }
        else if (watchlist.archive) {
            throw new Error('Watchlist is archive cannot be editeable!')
        }
    }
}