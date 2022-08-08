/// <reference path="base-component.ts" />

namespace App {
      /**************************** Projectのリスト（タスクボード）を表示するクラス ****************************/
  export class TaskBoard extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  
    assignedTasks: Task[]; // プロジェクトの配列を保存するためのプロパティ
  
    constructor(private _type: 'active' | 'finished') {
      super('project-list', 'app', false, `${_type}-projects` );
  
      this.assignedTasks = [];
  
      this.configure();
      this.renderContent(); // sectionブロック内要素（h2・ul）への描画
    }
  
    @Autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
        event.preventDefault();
        const ulEl = this.element.querySelector('ul')!;
        ulEl.classList.add('droppable');
      }
    }
    
    @Autobind
    dropHandler(event: DragEvent): void {
      const taskId = event.dataTransfer!.getData('text/plain');
      projectState.moveTask(taskId, this._type === 'active' ? TaskStatus.Active : TaskStatus.Finished);
  
    }
  
    @Autobind
    dragLeaveHandler(_: DragEvent): void {
      const ulEl = this.element.querySelector('ul')!;
      ulEl.classList.remove('droppable');
    }
  
    configure(): void {
      this.element.addEventListener('dragover', this.dragOverHandler);
      this.element.addEventListener('drop', this.dropHandler);
      this.element.addEventListener('dragleave', this.dragLeaveHandler);
  
  
      // 新規タスク追加時に、呼び出される
      projectState.addListener((tasks: Task[]) => {
        // 新規タスクのみ配列に新たな配列'relevantTasks'に値を格納
        const relevantTasks = tasks.filter((task): boolean => {
          if (this._type === 'active') {  
            return task.status === TaskStatus.Active; 
          }
          return task.status === TaskStatus.Finished;
        });
        this.assignedTasks = relevantTasks;
        this.renderTasks();
      })
    }
    renderContent() {
      // section要素の中のh2要素にテキストを追加
      const h2El = this.element.querySelector('h2')!;
      h2El.textContent = this._type === 'active' ? '実行中プロジェクト' : '完了プロジェクト'; 
  
      // section要素の中のul要素にid属性を追加
      const ulEl = this.element.querySelector('ul')!;
      ulEl.id = `${this._type}-projects-list`;
    }
  
    
    private renderTasks() {
      const ulEl = document.getElementById(`${this._type}-projects-list`)! as HTMLUListElement;
      // リストをクリア
      ulEl.innerHTML = '';
      for (const taskItem of this.assignedTasks) {
          new TaskItem(ulEl.id, taskItem);
      }
    }
    
  
  }

}