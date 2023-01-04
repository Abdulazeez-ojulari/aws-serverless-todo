import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    // You can provide additional information with every log statement
    // This information can then be used to search for log statements in a log storage system
    logger.info('Getting all todos')

    const result = await this.docClient.query({
        TableName : this.todosTable,
        IndexName : this.todoCreatedAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()
    logger.info('todos', result)
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo')
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(userId: string, todoId: string, todo: TodoUpdate): Promise<TodoUpdate> {
    logger.info('Updating todo')
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      },
      UpdateExpression: "set #todo_name = :t_name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ":t_name": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done,
      },
      ExpressionAttributeNames: { "#todo_name": "name" },
      ReturnValues: "UPDATED_NEW",
    }).promise()

    return todo
  }

  async updateAttachment(userId: string, todoId: string, url: string): Promise<string> {
    logger.info('Updating todo')
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": url,
      },
      ReturnValues: "UPDATED_NEW",
    }).promise()

    return url
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    logger.info('Get todo')
    let todo = await this.docClient.get({
        TableName : this.todosTable,
        Key: {
            'userId': userId,
            'todoId': todoId
        }
    }).promise()

    return todo.Item as TodoItem
  }

  async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    logger.info('Deleting todo')
    let todo = await this.docClient.delete({
        TableName : this.todosTable,
        Key: {
            'userId': userId,
            'todoId': todoId
        }
    }).promise()

    logger.info('Deleted todo', todo)

    return todo.Attributes as TodoItem
  }
}

// function createDynamoDBClient() {
//   if (process.env.IS_OFFLINE) {
//     console.log('Creating a local DynamoDB instance')
//     return new XAWS.DynamoDB.DocumentClient({
//       region: 'localhost',
//       endpoint: 'http://localhost:8000'
//     })
//   }

//   return new XAWS.DynamoDB.DocumentClient()
// }
