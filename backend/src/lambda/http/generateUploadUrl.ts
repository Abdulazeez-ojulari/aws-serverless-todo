import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

// import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { getTodo, updateTodoAttachment } from '../../businessLogic/todos'
import { AttachmentUtils } from '../../helpers/attachmentUtils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('attachment')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    let userId = getUserId(event)

    let todo = await getTodo(userId, todoId)

    if(!todo){
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    if(userId !== todo.userId){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'unauthorized'
        })
      }
    }

    logger.info('get url')

    let url = AttachmentUtils(todoId)

    logger.info('att url', url)

    await updateTodoAttachment(userId, todoId)

    logger.info('att url', url)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
