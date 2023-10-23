export type Repo = Record<string, Function>

export interface Controller<T> {
  params: Record<string, string | string[] | undefined>
  repo: T
  getPage(): number
  request: Express.Request
  id?: string
  body?: any
}
