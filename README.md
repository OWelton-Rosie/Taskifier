# Taskifier
This is the repo for <a href="https://taskifier.oweltonrosie.com">https://taskifier.oweltonrosie.com</a>.

## Features
- Ability to create and list an unlimited amount of tasks.
- Ability to search for and filter tasks in various ways (due date, priority level, alphabetical order).
- Import/export functionality via `.json`. 
- Option to download a `.txt` or a `.json` file with all the tasks.

# Development
## Running the project locally
Due to security restrictions, browsers will not load the custom "no tasks left" messages (found in [`src/messages.json`](https://github.com/OWelton-Rosie/taskifier/blob/main/src/messages.json)). To get around this, build the server with Python.

Clone the repo:
```
git clone https://github.com/OWelton-Rosie/taskifer
```
Navigate to the project:
```
cd homework-planner
```
If you're using Python 3:
```
python3 -m http.server
```
If you're using another version of Python:
```
python -m http.server
```

Then navigate to: 

http://localhost:8000/src

An example JSON containing some tasks can be found at [`src/dev_tasks.json`](https://github.com/OWelton-Rosie/taskifer/blob/main/src/dev_tasks.json)





