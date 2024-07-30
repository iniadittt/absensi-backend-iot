import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { environment } from "./environment";

function authentication(request: any, response: Response, next: NextFunction) {
    const headers: string = request.headers.authorization || '';
    const [header, token] = headers.split(' ');
    if (header !== 'Bearer')
        return response.status(401).json({
            status: 401,
            message: "Unauthorized"
        })
    if (!token)
        return response.status(401).json({
            status: 401,
            message: "Unauthorized"
        })
    jwt.verify(token, environment.jwt.secret, (error, decoded) => {
        if (error) return response.status(401).json({
            status: 401,
            message: "Unauthorized"
        })
        request.user = decoded
        return next()
    })
}

export default authentication