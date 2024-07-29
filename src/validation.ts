import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

const validation =
    (schema: z.ZodObject<any, any>) =>
        (request: Request, response: Response, next: NextFunction) => {
            try {
                schema.parse(request.body);
                next();
            } catch (error: any) {
                if (error instanceof ZodError) {
                    const errorMessages = error.errors.map((issue: any) => ({
                        message: `${issue.path.join('.')} is ${issue.message}`,
                    }));
                    return response.status(406).json({
                        status: 406,
                        message: 'Data yang dikirimkan oleh user tidak valid',
                        errors: errorMessages,
                    })
                } else {
                    return response.status(500).json({
                        status: 500,
                        message: 'Terjadi kesalahan pada server',
                        errors: error.message,
                    })
                }
            }
        };

export default validation;
