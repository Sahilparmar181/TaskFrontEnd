import "./App.css";
import { useEffect, useState } from "react";
import { Field, Form, Formik } from "formik";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

function App() {
  const [editTask, setEditTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [buttonText, setButtonText] = useState("Add Task");

  const last = currentPage * tasksPerPage;
  const first = last - tasksPerPage;
  const currentTasks = tasks.slice(first, last);

  const getAllTasks = () => {
    try {
      fetch("http://localhost:9000/api/tasks")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setTasks(data);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    } catch (err) {
      console.error("Something went wrong", err);
    }
  };
  useEffect(() => {
    getAllTasks();
  }, []);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const initialValuesForFormik = {
    title: editTask ? editTask.title : "",
    description: editTask ? editTask.description : "",
  };

  const handleAddTask = (values, { resetForm }) => {
    const method = editTask ? "PUT" : "POST";
    const url = editTask
      ? `http://localhost:9000/api/tasks/${editTask.id}`
      : "http://localhost:9000/api/tasks";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        getAllTasks();
        setEditTask(null);
        resetForm();
      })
      .catch((error) => {
        console.error("Error adding task:", error);
      });
  };

  const handleEditClick = (task, setFieldValue) => {
    console.log(task, "taskss");
    setButtonText("Edit Task");
    setEditTask(task);
    setFieldValue("title", task.title);
    setFieldValue("description", task.description);
  };

  const handleDeleteClick = (taskId) => {
    fetch(`http://localhost:9000/api/tasks/${taskId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        getAllTasks();
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
      });
  };

  return (
    <div className="App">
      <h1>Task List</h1>
      <Formik onSubmit={handleAddTask} initialValues={initialValuesForFormik}>
        {({ setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor="title">Add Task</label>
              <Field type="text" name="title" />
              <label htmlFor="description">Description</label>
              <Field type="text" name="description" />
              <button type="submit">{buttonText}</button>
            </div>
            <div>
              {currentTasks.length > 0 && (
                <ul>
                  {currentTasks?.map((task) => (
                    <li key={task?.id}>
                      <h2>{task?.title}</h2>
                      <p>{task?.description}</p>
                      <button
                        onClick={() => handleEditClick(task, setFieldValue)}
                        type="button"
                      >
                        <CiEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(task?.id)}
                      >
                        <MdDelete />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <nav>
        <ul
          className="pagination"
          style={{ display: "inline-flex", listStyle: "none", padding: 0 }}
        >
          {Array.from({
            length: Math.ceil(tasks.length / tasksPerPage),
          }).map((_, index) => (
            <li key={index} style={{ margin: "0 5px" }}>
              <button onClick={() => paginate(index + 1)}>{index + 1}</button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default App;
