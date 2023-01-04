import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { deleteTodo, getTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
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

    await deleteTodo(userId,todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
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
