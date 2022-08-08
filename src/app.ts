/**************************** Drag & Drop ****************************/
// ドラッグ可能なコンポーネントに実装するためのインターフェース
interface Draggble {

  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}
// ドロップされる場所のインターフェース
interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

/**************************** Taskのタイプを定義するクラス ****************************/
enum TaskStatus {
  Active, Finished
}

class Task {
  constructor(public id: string, public title: string, public description: string, public manDay: number, public status: TaskStatus) {
  }
}

/**************************** 状態管理用のクラス ****************************/
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected _listeners: Listener<T>[] = []; // サブクラスからアクセス可能
  
  addListener(listenerFunc: Listener<T>) {
    this._listeners.push(listenerFunc);
  }
  
}

class TaskState extends State<Task> {
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

    for (const lisFnc of this._listeners) {
      lisFnc(this._projects.slice()); // slice()メソッドで配列のコピーを渡す
    }
  }
}
// ProjectStateはシングルトンのクラス
const projectState = TaskState.getInstance();  // staticメソッドを呼び出す

/** バリデーションされるオブジェクトの型 */
interface ValidationObj {
  value: string | number;
  required?: boolean;
  maxLen?: number;
  minLen?: number;
  max?: number;
  min?: number;
}

function validate(target: ValidationObj): boolean {
  let isValid = true;

  if (target.required) {
    isValid = isValid && target.value.toString().trim().length !== 0;
  }
  if (target.maxLen != null && typeof target.value === 'string') {
    isValid = isValid && target.value.length <= target.maxLen;
  }
  if (target.minLen != null && typeof target.value === 'string') {
    isValid = isValid && target.value.length >= target.minLen;
  }
  if (target.max != null && typeof target.value === 'number') {
    isValid = isValid && target.value <= target.max;
  }
  if (target.min != null && typeof target.value === 'number') {
    isValid = isValid && target.value >= target.min;
  }
  return isValid;
}

// Autobind decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

/**************************** コンポーネントクラス（抽象クラス） ****************************/
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;
  
  constructor(templateId: string, hostElId: string, insertAtStart: boolean,  newElId?: string) {
    this.templateEl = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElId)! as T;

    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElId) {
      this.element.id = newElId;
    }
    this.attach(insertAtStart);
  }
  
  abstract configure(): void;
  abstract renderContent(): void;

  /* 要素を追加 */
  private attach(insertAtBeginning: boolean) {
    this.hostEl.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
  }
}

/**************************** タスクリストを作成・表示するクラス ****************************/
class TaskItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggble {
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
    console.log(event);
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

/**************************** Projectのリスト（タスクボード）を表示するクラス ****************************/
class TaskBoard extends Component<HTMLDivElement, HTMLElement> implements DragTarget{

  assignedTasks: Task[]; // プロジェクトの配列を保存するためのプロパティ

  constructor(private _type: 'active' | 'finished') {
    super('project-list', 'app', false, `${_type}-projects` );

    this.assignedTasks = [];

    this.configure();
    this.renderContent(); // sectionブロック内要素（h2・ul）への描画
  }

  @Autobind
  dragOverHandler(_: DragEvent): void {
    const ulEl = this.element.querySelector('ul')!;
    ulEl.classList.add('droppable');
  }
  
  dropHandler(_: DragEvent): void {
    
  }

  dragLeaveHandler(_: DragEvent): void {
    
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
/**************************** Formの表示・入力値の取得を行うクラス ****************************/
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {

  // 入力フォームへの参照
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  manDayInputElement: HTMLInputElement;
  
  constructor() {
    super('project-input', 'app', true, 'user-input');
    
    
    /* 入力フォームへの参照 */
    this.titleInputElement =  this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement =  this.element.querySelector('#description') as HTMLInputElement;
    this.manDayInputElement =  this.element.querySelector('#manday') as HTMLInputElement;
    
    this.configure();
  }

  /* イベントリスナーを設定 */
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent(): void {
    // ProjectInputクラスでは使わないメソッドのため、定義のみ
  }
  
  private gatherUserInput(): [string, string, number] | void {
    const titleVal = this.titleInputElement.value;
    const descriptionVal = this.descriptionInputElement.value;
    const manDayVal = this.manDayInputElement.value;

    const validatedTitle: ValidationObj = {
      value: titleVal,
      required: true,
    }
    const validatedDesc: ValidationObj = {
      value: descriptionVal,
      maxLen: 50,
    }
    const validateManDay: ValidationObj = {
      value: +manDayVal,  // 数値型へ変換
      max: 1000,
      min: 1,
    }

    // Form Validation
    if (
      !validate(validatedTitle) ||
      !validate(validatedDesc) ||
      !validate(validateManDay)
    ) {
      alert('不正な値です。登録できません。');
      return;
    } else {
      return [titleVal, descriptionVal, +manDayVal]
    }
  }

  private clearInput() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.manDayInputElement.value = '';
  }

  /* フォーム送信時イベント */
  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    
    const inputValues = this.gatherUserInput();
    if (Array.isArray(inputValues)) {
      const [title, description, manDay] = inputValues;

      projectState.addTask(title, description, manDay);
      this.clearInput();
    }
  } 

}

const prjInput = new ProjectInput();
const activePrjList = new TaskBoard('active');
const finishedPrjList = new TaskBoard('finished');
