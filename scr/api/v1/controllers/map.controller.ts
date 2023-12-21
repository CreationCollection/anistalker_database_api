import { Response, Request } from "express";
import { AniRecord } from "../../../services/v1/AniRecord.js";
import { safeExecute } from "../../utils.js";
import { AniDatabase } from "../../../services/v1/AniDatabase.js";


// /mapping/zoro/zoroId
export async function getZoroMapping(req: Request, res: Response) {
    safeExecute(res, async () => {
        const id = /^[0-9]+$/.test(req.params.zoroId) ? parseInt(req.params.zoroId) : null
        if (id == null) res.sendStatus(400)
        else {
            const mapping = await AniRecord.getZoroMapping(id)
            res.status(200).send(mapping)
        }
    })
}

// /mapping/anilist/:anilistId
export async function getAnilistMapping(req: Request, res: Response) {
    safeExecute(res, async () => {
        const id = /^[0-9]+$/.test(req.params.anilistId) ? parseInt(req.params.anilistId) : null
        if (id == null) res.sendStatus(400)
        else {
            const mapping = await AniRecord.getAnilistMapping(id)
            res.status(200).send(mapping)
        }
    })
}

// /mapping/entry
export async function setZoroMapping(req: Request, res: Response) {
    safeExecute(res, async () => {
        const apiKey = req.headers['authorization']?.slice(7) ?? null
        const passKey = await AniDatabase.passKey()
        if (apiKey == null || passKey != apiKey) return res.sendStatus(401)
        
        const id = /[0-9]+$/.test(req.body.zoroId) ? parseInt(req.body.zoroId) : null
        const map = req.body?.map
        if (id == null || map == null) res.sendStatus(400)
        else {
            const mapping = await AniRecord.mappingEntry(id, map)
            res.status(200).send(mapping)
        }
    })
}