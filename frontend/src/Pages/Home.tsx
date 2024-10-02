import { Plus, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";

interface Todo {
  id: Number;
  title: String;
}
const Home = () => {
  const [newTodo, setNewTodo] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const addTodo = async () => {
    const res = await axios.post(
      "http://localhost:8000/add",
      {
        title: newTodo,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setTodos([...todos, res.data]);
    setNewTodo("");
  };

  const getTodos = async () => {
    const allTodos = await axios.get("http://localhost:8000/todo", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setTodos(allTodos.data);
  };

  const removeTodo = async (index: Number) => {
    try {
      await axios.delete(`http://localhost:8000/delete/${index}`);
      setTodos(todos.filter((todo) => todo.id !== index));
    } catch (error) {
      console.log("Error deleting todo", error);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);
  return (
    <div className="max-w-md mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Add a new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              addTodo();
            }
          }}
          className="flex-grow"
        />
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      <ul className="space-y-2">
        {todos.map((todo, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-2 bg-muted rounded"
          >
            <span>{todo.title}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTodo(todo.id)}
              aria-label={`Remove todo: ${todo}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
