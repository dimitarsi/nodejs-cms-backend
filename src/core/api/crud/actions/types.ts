export type Repo = Record<string, Function>

export interface Controller {
  params: Record<string, string | string[] | undefined>
  repo: Record<string, Function>
  getPage(): number
  request: Express.Request
  // response: Express.Response
  id?: string
  body?: any
}
