import { decode } from 'jsonwebtoken'
import { createLogger } from '../utils/logger'

import { JwtPayload } from './JwtPayload'

const logger = createLogger('decode')

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  logger.info( 'parseing', decodedJwt)
  return decodedJwt.sub
}
