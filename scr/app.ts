import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { AniDatabase } from './services/v1/AniDatabase.js'

import { mappingRouter, userRouter } from './api/v1/route.js'

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('trust proxy', 1);

app.get('/', (req, res) => {
    res.send('Congratulations! You have reached the home page!')
})

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use('/mapping', mappingRouter)
app.use('/user', userRouter)

app.listen(PORT, async () => {
    AniDatabase.init()
    console.log(`Server is running on port ${PORT}`)
})

app.on('close', () => {
    console.log("Ended!")
    AniDatabase.dispose()
})