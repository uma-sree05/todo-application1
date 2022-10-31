const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const scenario1 = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const scenario2 = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const scenario3 = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  const { search_q = "", priority, status } = request.query;
  let getQuery = "";
  switch (true) {
    case scenario1(request.query):
      getQuery = `SELECT 
      * 
      FROM 
      todo
      WHERE 
      todo LIKE '%${search_q}%'
      AND status='${status}'
      AND priority='${priority}';`;
      break;
    case scenario2(request.query):
      getQuery = `SELECT 
      * 
      FROM
      todo 
      WHERE 
      priority='${priority}';`;
      break;
    case scenario3(request.query):
      getQuery = `SELECT * FROM
      todo 
      WHERE
      status='${status}';`;
      break;
    default:
      getQuery = `SELECT 
      * FROM
      todo 
      WHERE
      todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getQuery);
  response.send(data);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * 
    FROM 
    todo
    WHERE 
    id='${todoId}';`;
  const arrayId = await db.get(getQuery);
  response.send(arrayId);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
     INSERT INTO todo(id,todo,priority,status) VALUES
     ('${id}','${todo}','${priority}','${status}');`;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//API 4
const updateStatus = (requestBody) => {
  return;
  requestBody.status !== undefined;
};
const priorityQuery = (requestBody) => {
  return;
  requestBody.priority !== undefined;
};
const todoQuery = (requestBody) => {
  return;
  requestBody.todo !== undefined;
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }

  const previousTodoQuery = `
SELECT *
 FROM todo
WHERE id=${todoId};`;

  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
UPDATE 
todo 
SET 
todo='${todoId}',
priority='${priority}',
status='${status}';
WHERE id=${todoId}`;
  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const id = ({ todoId } = request.params);
  const deleteQuery = `DELETE FROM todo
    WHERE id=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
