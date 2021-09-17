import {Router} from "express"
import fs from "fs"

const router = Router()


router.post("/report" ,(req, res, next) => {
    fs.writeFileSync('data.json', JSON.stringify(req.body))
    return res.send(req.body)
})

export default router