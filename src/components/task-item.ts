import { Draggble } from '../models/drag-drop';
import Component from './base-component';
import { Task } from '../models/task';
import { Autobind } from '../decorators/autobind';

/**************************** タスクリストを作成・表示するクラス ****************************/
export class TaskItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggble {
    private _task: Task;

    get manday() {
    if (this._task.manDay < 20) {
    return this._task.manDay.toString() + "人日";
    } else {
    return (this._task.manDay / 20).toString() + '人月';
    }
    }

    constructor(hostId: string, task: Task) {
        super("single-project", hostId, false, task.id);
        this._task = task;

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this._task.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent): void {
        console.log('dragEnd');
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this._task.title;
        this.element.querySelector('h3')!.textContent = this.manday;
        this.element.querySelector('p')!.textContent = this._task.description;
    }
}
