import dotenv from 'dotenv'

dotenv.config()

export const environment = {
    port: Number(process.env.PORT) || 3000,
    database_url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/example',
    jwt: {
        secret: process.env.JWT_SECRET || 'SECRET'
    }
}