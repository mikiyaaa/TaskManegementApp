import { ProjectInput } from './components/project-input';
import { TaskBoard } from './components/task-board';

new ProjectInput();
new TaskBoard('active');
new TaskBoard('finished');

console.log('webpack-dev-server');