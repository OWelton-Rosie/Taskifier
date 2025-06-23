# Homework planner/tracker 
This is the repo for <a href="https://homework-planner.pages.dev">https://homework-planner.pages.dev/</a>.

## Features
- Ability to create and list an unlimited amount of tasks.
- Ability to search for and filter tasks in various ways (due date, priority level, alphabetical order).
- Import/export functionality via `.json`. 
- Option to download a `.txt` or a `.json` file with all the tasks.

# Development
## Running the project locally
Due to security restrictions, browsers will not load the custom "no tasks left" messages (found in [`messages.json`](https://github.com/OWelton-Rosie/homework-planner/blob/main/src/messages.json)). To get around this, you have two options:

### Option 1: create the server with Python
```
git clone https://github.com/OWelton-Rosie/homework-planner
```
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

### Option 2: using Live Server (VS Code only)

If you're using VSCode, install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, then right-click on `index.html` and select "Open with Live Server".

# Todo
- ~~Add `.json` export functionality~~
- ~~Add import functionality via `.json`~~




