/// <reference path="./models/drag-drop.ts" />
/// <reference path="./models/task.ts" />
/// <reference path="./state/task-state.ts" />
/// <reference path="./util/validation.ts" />
/// <reference path="./decorators/autobind.ts" />
/// <reference path="./components/project-input.ts" />
/// <reference path="./components/task-board.ts" />


namespace App {

  new ProjectInput();
  new TaskBoard('active');
  new TaskBoard('finished');

}

