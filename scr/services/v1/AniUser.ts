import { OAuth2Client } from "google-auth-library";
import { AniDatabase } from "./AniDatabase.js";
import { AniMessaging } from "./AniMessaging.js";

const clientId = "351429526556-6nosgfhh41to1a8iir7vmc7126aeb0nb.apps.googleusercontent.com"

export class AniUser {
    // == Helping Functions ==

    static getUserId = async (token: string): Promise<string | null> => {
        const ref = await AniDatabase.database!.ref(`tokens/${token}`).get()
        if (ref.exists()) return ref.val()
        else return null
    }

    static getUsername = async (userId: string): Promise<string | null> => {
        const userRef = AniDatabase.database!.ref(`users/${userId}/profile/username`)
        return (await userRef.get()).val()
    }

    static verifyUserProfile = async (
        userId: string,
        username: string,
        name: string
    ): Promise<any> => {
        const userRef = AniDatabase.database!.ref(`users/${userId}/profile`)
        const data = await userRef.get()

        if (data.exists()) return data.val()
        else {
            const user = {
                username,
                name
            }
            userRef.set(user)
            return user
        }
    }

    static generateToken = async (userId: string): Promise<string | null> => {
        return (await AniDatabase.database!.ref('tokens').push(userId)).key
    }

    static removeToken = async (userId: string) => {
        const ref = AniDatabase.database!.ref()
        const tokenRef = ref.child('tokens')
        const tokenData = await tokenRef.orderByValue().equalTo(userId).get()
        if (tokenData.exists()) {
            const val = Object.keys(tokenData.val())
            if (val.length > 0) {
                await tokenRef.child(val[0]).remove()
            }
        }
    }

    // =======================

    static signIn = async (idToken: string): Promise<any> => {
        try {
            const authClient = new OAuth2Client()
            const ticket = await authClient.verifyIdToken({
                idToken: idToken,
                audience: clientId
            })

            const payload = ticket.getPayload()
            if (payload) {
                const userId = payload['sub']
                const username = payload['email']?.split('@')[0] ?? ""
                const name = payload['name'] ?? ""

                const user = await this.verifyUserProfile(userId, username, name)
                await this.removeToken(userId)

                const token = await this.generateToken(userId)

                return {
                    ...user,
                    token
                }
            }
        }
        catch (error: any) {
            if (error instanceof Error) {
                console.log(error.message)
            }
            else {
                console.log(error)
            }
            return null
        }
    }

    static signOut = async (token: string) => {
        await Promise.all([
            AniDatabase.database!.ref(`tokens/${token}`).remove(),
            this.getUserId(token).then(id => { if (id) AniMessaging.removeToken(id) })
        ])
    }

    // == User Action Syncing ==

    // TODO Implement Syncing System

    // ========================

    // == User History Syncing ==

    static addRecentAnime = async (token: string, animeId: number, ep: number, lang: 'sub' | 'dub'): Promise<any> => {
        const userId = await AniUser.getUserId(token)
        if (userId == null) return

        const ref = AniDatabase.database!.ref(`users/${userId}/history/recents`)
        const data = Object.entries((await ref.get()).val())
        
        data.sort((a: any, b: any) => {
            return parseInt(b[1].split('-')[2]) - parseInt(a[1].split('-')[2])
        }).pop()

        const entries = Object.fromEntries(data)
        entries[animeId] = `${lang}-${ep}-${Date.now()}`

        ref.set(entries)
    }

    static getRecentAnime = async (token: string): Promise<any> => {
        const userId = await AniUser.getUserId(token)
        if (userId == null) return
        const ref = AniDatabase.database!.ref(`users/${userId}/history/recents`)
        return (await ref.get()).val()
    }

    static removeRecentAnime = async (token: string, animeId: number): Promise<any> => {
        const userId = await AniUser.getUserId(token)
        if (userId == null) return

        AniDatabase.database!.ref(`users/${userId}/history/recents/${animeId}`).remove()
    }

    static setLastEpisode = async (token: string, animeId: number, ep: number): Promise<any> => {
        const userId = await AniUser.getUserId(token)
        if (userId == null) return
        AniDatabase.database!.ref(`users/${userId}/history/last/${animeId}`).set(ep)
    }

    static getLastEpisode = async (token: string, animeId: number): Promise<any> => {
        const userId = await AniUser.getUserId(token)
        if (userId == null) return
        return (await AniDatabase.database!.ref(`users/${userId}/history/last/${animeId}`).get()).val()
    }

    // ========================
}