# Homework planner/tracker 
This is the repo for <a href="https://homework-planner.pages.dev">https://homework-planner.pages.dev/</a>.

## Features
- Ability to create and list an unlimited amount of tasks.
- Ability to search for and filter tasks in various ways (due date, priority level, alphabetical order).
- Option to download a `.txt` file with all the tasks.

# Development
## Running the project locally
```
git clone https://github.com/Owelton-Rosie/homework-planner
```

Due to security restrictions, browsers will not load the custom "no tasks left" messages (found in [`messages.json`](https://github.com/OWelton-Rosie/homework-planner/blob/main/src/messages.json)). To get around this, either:

```
# Navigate to the project directory
cd homework-planner
```

```
# Use python to create the server and run index.html locally
python3 -m http.server
```
Then navigate to: 
```
http://localhost:8000
```

**Or:** 

If you're using VSCode, install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, then right-click on `index.html` and select "Open with Live Server"




