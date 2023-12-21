import { Response } from "express";

export async function safeExecute(res: Response, exec: () => Promise<any>) {
    try {
        await exec()
    }
    catch (err: any) {
        if (err instanceof Error) {
            res.status(200).json({
                status: 1,
                data: {},
                error: err.message
            });
            console.log(err.message)
        } else {
            res.status(501).json({
                status: 501,
                data: {},
                error: ["Internal Server Error", err],
            });
            console.log(err)
        }
    }
}