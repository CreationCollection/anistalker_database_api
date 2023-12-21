import { Request, Response } from "express";

import { UserWatchlist } from "../../../services/v1/UserWatchlist.js";
import { safeExecute } from "../../utils.js";
import { AniUser } from "../../../services/v1/AniUser.js";


// /watchlist/:watchId
export async function getWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const sharedId = /^[\d]+$/.test(req.params.watchId) ? parseInt(req.params.watchId) : null
        if (sharedId == null) return res.status(400).send("Invalid watchId")
        const watchlist = await UserWatchlist.getWatchlist(sharedId)
        res.status(200).send(watchlist)
    })
}

// /user/watchlist
export async function getUserWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7) ?? null
        if (token) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlists = await UserWatchlist.getWatchlistByUser(userId)
                return res.status(200).send(watchlists)
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/archived
export async function getArchivedWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token = req.headers['authorization']?.slice(7) ?? null
        if (token) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlists = await UserWatchlist.getArchivedWatchlistByUser(userId)
                return res.status(200).send(watchlists)
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/create
export async function createWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const title: string | null = req.body?.title
        const privacy: 'public' | 'shared' | 'private' | null = req.body?.privacy
        if (token && title && privacy) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.createWatchlist(userId, title, privacy)
                const syncId = AniUser.createSyncReport(token, {
                    action: "create",
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/update
export async function updateWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const watchId: number | null = req.body?.watchId
        const title: string | null = req.body?.title
        const privacy: 'public' | 'shared' | 'private' | null = req.body?.privacy
        if (token && watchId && title && privacy) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.updateWatchlist(userId, watchId, title, privacy)
                const syncId = AniUser.createSyncReport(token, {
                    action: "update",
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/delete
export async function deleteWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const watchId: number | null = req.body?.watchId
        if (token && watchId) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.removeWatchlist(userId, watchId)
                const syncId = AniUser.createSyncReport(token, {
                    action: "delete",
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/add
export async function addWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const watchId: number | null = req.body?.watchId
        if (token && watchId) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.addWatchlist(userId, watchId)
                const syncId = AniUser.createSyncReport(token, {
                    action: "add",
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/remove
export async function removeWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const watchId: number | null = req.body?.watchId
        if (token && watchId) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.removeWatchlist(userId, watchId)
                const syncId = AniUser.createSyncReport(token, {
                    action: "remove",
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/remove
export async function recoverWatchlist (req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const watchId: number | null = req.body?.watchId
        if (token && watchId) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.recoverWatchlist(userId, watchId)
                const syncId = AniUser.createSyncReport(token, {
                    action: "recover",
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/append
export async function addAnimeToWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const watchId: number | null = req.body?.watchId
        const animeId: number | null = req.body?.animeId
        if (token && watchId && animeId) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.addAnimeToWatchlist(userId, watchId, animeId)
                const syncId = AniUser.createSyncReport(token, {
                    action: "append",
                    animeId: animeId,
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}

// /user/watchlist/pop
export async function removeAnimeFromWatchlist(req: Request, res: Response) {
    safeExecute(res, async () => {
        const token: string | null = req.headers['authorization']?.slice(7) ?? null
        const watchId: number | null = req.body?.watchId
        const animeId: number | null = req.body?.animeId
        if (token && watchId && animeId) {
            const userId = await AniUser.getUserId(token)
            if (userId) {
                const watchlist = await UserWatchlist.removeAnimeFromWatchlist(userId, watchId, animeId)
                const syncId = AniUser.createSyncReport(token, {
                    action: "pop",
                    animeId: animeId,
                    data: watchlist
                })
                return res.status(200).send({ status: 0, data: watchlist, syncReportId: syncId })
            }
        }
        else {
            res.status(401).send("Unauthorized")
        }
    })
}