import { Router } from "express";
import * as userController from './controllers/user.controller.js'
import * as watchController from './controllers/watchlist.controller.js'
import * as mapController from './controllers/map.controller.js'

export const userRouter = Router()
export const mappingRouter = Router()

// == Auth /user/ ==
userRouter.post('/signIn', userController.signIn)
userRouter.post('/signOut', userController.signOut)
userRouter.post('/sync', userController.verifySyncReport)
userRouter.post('/message', userController.setMessagingToken)

userRouter.get('/syncReports', userController.getSyncReports)

// watchlist
userRouter.post('/history/active', userController.setCurrentAnime)
userRouter.post('/watchlist/create', watchController.createWatchlist)
userRouter.post('/watchlist/add', watchController.addWatchlist)
userRouter.post('/watchlist/delete', watchController.deleteWatchlist)
userRouter.post('/watchlist/recover', watchController.recoverWatchlist)
userRouter.post('/watchlist/append', watchController.addAnimeToWatchlist)
userRouter.post('/watchlist/pop', watchController.removeAnimeFromWatchlist)

userRouter.get('/watchlist/:watchId', watchController.getWatchlist)
userRouter.get('/watchlist', watchController.getUserWatchlist)
userRouter.get('/watchlist/archive', watchController.getArchivedWatchlist)

// history
userRouter.post('/history/active', userController.setCurrentAnime)
userRouter.post('/history/recent/add', userController.addRecentAnime)
userRouter.post('/history/recent/remove', userController.removeRecentAnime)
userRouter.post('/history/lastEpisode', userController.setLastEpisode)

userRouter.get('/history/active', userController.getCurrentAnime)
userRouter.get('/history/recent', userController.getRecentAnime)
userRouter.get('/history/lastEpisode', userController.getLastEpisode)

// == Mapping /mapping ==
mappingRouter.post('/entry', mapController.setZoroMapping)
mappingRouter.get('/zoro/:zoroId', mapController.getZoroMapping)
mappingRouter.get('/anilist/:anilistId', mapController.getAnilistMapping)