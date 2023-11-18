import { type Request } from "express"
export const createContext = <C>(req: Request) => ({} as C)

export default createContext
