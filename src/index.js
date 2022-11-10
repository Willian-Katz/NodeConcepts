const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    // Vai criar uma área no headers da requisição um username
    const { username } = request.headers

    // Vai procurar se o que foi passado no header existe na lista de users
    const listUsers = users.find((user) => user.username === username)

    // Vai verificar se contém o username
    if(!listUsers) {
      return response.status(400).json({ error: "User not found" })
    }

    request.user = listUsers

    return next();
}

function checkTodo(id, todos) {
  // Vai comparar seo  id que foi passado esta presente na lista
  const validationTodo = todos.find((todo) => todo.id === id)

  if (!validationTodo) {
    return  response.status(404).json({ error: "Todo not found!" })
  }

  return validationTodo
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usersAlreadyExists = users.some((user) => user.username === username);

  if (usersAlreadyExists) {
      return response.status(400).json({ error: "user already exists!" })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const assignment = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    create_at: new Date()
  }

  user.todos.push(assignment)

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body;

  const { todos } = request.user;

  const atuallyTodo = checkTodo(id, todos)

  atuallyTodo.title = title;
  atuallyTodo.deadline = deadline;

  return response.status(200).send()
});

app.patch('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { done } = request.query;

  const { todos } = request.user;

  const atuallyTodo = checkTodo(id, todos)

  atuallyTodo.done = Boolean(done);

  return response.status(200).send()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { todos } = request.user;

  const atuallyTodo = checkTodo(id, todos)

  todos.splice(atuallyTodo, 1);

  return response.status(200).json(todos)
});

module.exports = app;