import express from 'express'
import AuthSvc from './auth/service.js'
import {validateRegistration,validateLogin} from "./middlewares/auth.middleware.js"

const router=express.Router()

router.post('/register',validateRegistration,AuthSvc.register)
router.post('/login',validateLogin,AuthSvc.login)


export default router