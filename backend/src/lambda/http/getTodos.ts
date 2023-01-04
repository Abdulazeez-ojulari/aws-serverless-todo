import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { getAllTodoItems } from '../../helpers/todos'
import { createLogger } from '../../utils/logger';

const logger = createLogger('get todos')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info('Getting all todos', event)
    let userId = getUserId(event)
    console.log(userId)
    const todos = await getAllTodoItems(userId)
    logger.info('todos', todos)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
