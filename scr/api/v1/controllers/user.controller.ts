import { Response, Request } from "express";

import { AniUser } from "../../../services/v1/AniUser.js";
import { AniMessaging } from "../../../services/v1/AniMessaging.js";
import { safeExecute } from "../../utils.js";


export async function signIn (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        if (token) {
            const user = await AniUser.signIn(token)
            if (user) {
                res.json({ status: 200, data: user })
                return
            }
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function signOut (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        if (token) {
            const user = await AniUser.signOut(token)
            res.json({ status: 200, data: user })
            return
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function setMessagingToken (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        const messagingToken = req.body?.messagingToken
        if (token && messagingToken) {
            const user = await AniUser.getUserId(token)
            if (!user) return

            AniMessaging.setToken(user, messagingToken)
            res.json({ status: 200, data: true })
            return
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function verifySyncReport (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        const id = req.body?.syncId
        if (token && id) {
            const user = await AniUser.verifySyncReport(token, id)
            if (user) {
                res.json({ status: 200, data: user })
                return
            }
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function getSyncReports (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        if (token) {
            const user = await AniUser.getSyncReports(token)
            if (user) {
                res.json({ status: 200, data: user })
                return
            }
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function setCurrentAnime (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        const animeId = req.body?.animeId
        if (token && animeId) {
            await AniUser.setCurrentAnime(token, animeId)
            res.sendStatus(200)
            return
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function getCurrentAnime (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        if (token) {
            const user = await AniUser.getCurrentAnime(token)
            if (user) {
                res.json({ status: 200, data: user })
                return
            }
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function addRecentAnime (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        const animeId = req.body?.animeId
        const ep = req.body?.ep
        const lang = req.body?.lang
        if (token && animeId && ep && lang) {
            await AniUser.addRecentAnime(token, animeId, ep, lang)
            res.sendStatus(200)
            return
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function getRecentAnime (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        if (token) {
            const user = await AniUser.getRecentAnime(token)
            if (user) {
                res.json({ status: 200, data: user })
                return
            }
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function removeRecentAnime (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        const animeId = req.body?.animeId
        if (token && animeId) {
            await AniUser.removeRecentAnime(token, animeId)
            res.sendStatus(200)
            return
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function setLastEpisode (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        const animeId = req.body?.animeId
        const ep = req.body?.ep
        if (token && animeId && ep) {
            await AniUser.setLastEpisode(token, animeId, ep)
            res.sendStatus(200)
            return
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}

export async function getLastEpisode (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7)
        const animeId = req.body?.animeId
        if (token && animeId) {
            const user = await AniUser.getLastEpisode(token, animeId)
            if (user) {
                res.json({ status: 200, data: user })
                return
            }
        }
        res.json({ status: 400, error: ["Invalid token"] })
    })
}