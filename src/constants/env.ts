import "dotenv/config"

export const NODE_ENV  = process.env.NODE_ENV

export const JWT_SECRET  = process.env.JWT_SECRET as string

export const SALT_ROUND =  process.env.SALT_ROUND;

export const MONGODB_URI = process.env.MONGODB_URI as string

export const PORT = process.env.PORT 


export const BASE_URL = `http://localhost:${PORT}`