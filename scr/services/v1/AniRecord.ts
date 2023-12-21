import { AniDatabase } from "./AniDatabase.js";

export class AniRecord {
    // #region Mapping

    static mappingEntry = async (id: number, mapping: any) => {
        const ref = AniDatabase.database!.ref('record/mapping/' + id)
        await ref.push(mapping)
    }

    static getZoroMapping = async (id: number): Promise<any> => {
        const ref = AniDatabase.database!.ref('record/mapping/' + id)
        const data = await ref.get()
        if (data.exists()) return data.val()
        else throw Error('Mapping not found')
    }

    static getAnilistMapping = async (id: number): Promise<any> => {
        const ref = AniDatabase.database!.ref('record/mapping')
        const data = await ref.orderByChild('anilist').equalTo(id).get()
        if (data.exists()) return data.val()
        else throw Error('Mapping not found')
    }

    // #endregion
}