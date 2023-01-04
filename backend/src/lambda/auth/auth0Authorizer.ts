import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJJJ40rF0G5bVpMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1uNGQzbGh2cHVkb2YwNjRmLnVzLmF1dGgwLmNvbTAeFw0yMzAxMDIw
NzUxMjhaFw0zNjA5MTAwNzUxMjhaMCwxKjAoBgNVBAMTIWRldi1uNGQzbGh2cHVk
b2YwNjRmLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBALY7j5OuDyH4VmMFdwHmHNK+SDJxu0wTxhzQwALF8d4SJGein9HzMj9QGGPu
qQHObwBwV7AD5LD7CFWaxMZmqFgdET+X6GePXzCqS4SC3W7HsYoouRB481vAys1v
kZTTgIliULuouiffH2+HpOflPyKPW3YJjFusyNnlieInaOesVLDSJndqtGd3D/oK
otzDoc6A2grLrjIb15f4xGToyh0RlGX2F4+kvdz+DA+NxZejD1RtH/MpeWX64Y9f
rw6FenK+l1/ww1M+a6kNmV3ul140UPMAJBvbe05jsF9I5I7KUWNrAgy7Z0OA2UoH
vTEtkIoo0/Z+0z1ED2eI0yTNnrUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUB63JEcLl2xzcTStVRLIBRd2QWOEwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBLfS7bd0ySebp0c8l8/U50t5uYXBI+QO8BOvc8HtED
li8xt/VryOQA888awy3/eM2FyWB9GbPG5GyBO75XYJmiVEbpYTYcZaGRDzHxaLWE
4CAR8HrCc3xT/SSf2Jur8unnmyXtjwUvK1L6hDUhK8OPU27AfEa27Zbbo6y8o3be
XkTa45VlPsm8E+nvIy/4M51yFXac/m8cNQdnc2wi+K/xAOTTGD/urBO2oClirVfq
PhO/R1Grdrls07udxqr/Sd2ttuJg34VVSkL613/OkyNcaoOsUDMrER8MTOYSM137
JPyQfClNDB6wrepcNw4+NSnWYJiKRIZGCah4zjdMM6+l
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do th*is here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
