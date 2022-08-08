namespace App {
/**************************** 状態管理用のクラス ****************************/
  type Listener<T> = (items: T[]) => void;
  
  class State<T> {
    protected _listeners: Listener<T>[] = []; // サブクラスからアクセス可能
    
    addListener(listenerFunc: Listener<T>) {
      this._listeners.push(listenerFunc);
    }
  }
  
  export class TaskState extends State<Task> {
    private _projects: Task[];
    private static _instance: TaskState;
    
    // privateコンストラクタ => シングルトンなクラス
    private constructor() {
      super();
      this._projects = [];
    }
  
    static getInstance() {
      if (this._instance) {
        return this._instance;
      }
      this._instance = new TaskState();
      return this._instance;
    }
  
  
    addTask(title: string, description: string, manDay: number) {
      const newTask = new Task(
        Math.random().toString(),
        title,
        description,
        manDay,
        TaskStatus.Active  // 新規追加はActive
      );
      this._projects.push(newTask);
      this.updateListeners();
    }
  
    moveTask(taskId: string, newStatus: TaskStatus) {
      const task = this._projects.find(task => task.id === taskId);
      if (task && task.status !== newStatus) {
        task.status = newStatus;
        this.updateListeners();
      }
  
    }
  
    private updateListeners() {
      for (const lisFnc of this._listeners) {
        lisFnc(this._projects.slice()); // slice()メソッドで配列のコピーを渡す
      }
    }
  
  }
  // ProjectStateはシングルトンのクラス
  export const projectState = TaskState.getInstance();  // staticメソッドを呼び出す

}