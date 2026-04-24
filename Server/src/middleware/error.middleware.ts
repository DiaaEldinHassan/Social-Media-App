import type { Request, Response, NextFunction } from "express";
import {IError} from "../common"

export const globalErrorHandler=(err:IError,req:Request,res:Response,next:NextFunction):void=>{
    const statusCode= err.statusCode||500;

    res.status(statusCode).json({
        success:false,
        stack:process.env.NODE_ENV==="development"?err.stack:undefined,
        message:err.message,
        code:err.statusCode
    })
}