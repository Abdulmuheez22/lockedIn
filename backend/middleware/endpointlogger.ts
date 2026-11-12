import type { Request, Response, NextFunction } from "express";


const endpointlogger = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date()
        const timestamp = now.toLocaleTimeString()
        const apiEndpoint = req.url
        const apiEndpointType = req.method
        console.log(`${apiEndpointType} ${timestamp} http://localhost:4444${apiEndpoint}`)
        next()
    } catch (error) {
        console.log('endpointlogger error: ', error)
        next(error)
    }
}


export default endpointlogger