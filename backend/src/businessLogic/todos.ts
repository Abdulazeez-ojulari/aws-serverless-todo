import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// import { parseUserId } from '../auth/utils';
import { TodoUpdate } from '../models/TodoUpdate';
const bucketName = process.env.ATTACHMENT_S3_BUCKET
// TODO: Implement businessLogic

const logger = createLogger('Todos')

const todoItemAccess = new TodosAccess()

export async function getAllTodoItems(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    return todoItemAccess.getAllTodos(userId)
}
  
export async function createTodoItem(
createTodoRequest: CreateTodoRequest,
userId: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    console.log(createTodoRequest)
    logger.info('Getting all todos', createTodoRequest)
    return await todoItemAccess.createTodo({
      todoId: todoId,
      userId: userId,
      name: createTodoRequest.name,
      createdAt: new Date().toString(),
      dueDate: createTodoRequest.dueDate,
      done: false,
    })
}

export async function updateTodoItem(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
    ): Promise<TodoUpdate> {
    
    return await todoItemAccess.updateTodo(userId, todoId, {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    })
}

export async function updateTodoAttachment(
    userId: string,
    todoId: string
    ): Promise<string> {
    
    return await todoItemAccess.updateAttachment(userId, todoId, `https://${bucketName}.s3.amazonaws.com/${todoId}`)
}

export async function getTodo(
    userId: string,
    todoId: string
    ): Promise<TodoItem> {
    
    return await todoItemAccess.getTodo(userId, todoId)
}

export async function deleteTodo(
    userId: string,
    todoId: string,
    ): Promise<TodoItem> {
    
    return await todoItemAccess.deleteTodo(userId, todoId)
}
