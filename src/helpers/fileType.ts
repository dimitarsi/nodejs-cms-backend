import {exec} from '@dim.iliev/process-utils-exec'
import path from 'path'
export default async function(filePath: string) {
  const absPath = path.resolve(process.cwd(), filePath);


  const result = await exec(`file ${absPath} --mime --brief`)
  return result.split(';')[0]
}