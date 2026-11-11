import type { Request, Response } from "express";

export const signUp = async (req: Request, res: Response) => {
    try{
        const request = req.body
        console.log(request)
    }
    catch(error){
        console.log('this error is from the signup catch: ', error)
        return res.status(500).json({message: 'Error Creating Account'})
    }
}