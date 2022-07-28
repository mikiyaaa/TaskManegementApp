/**************************** Taskのタイプを定義するクラス ****************************/
enum TaskStatus {
  Active, Finished
}

class Task {
  constructor(public id: string, public title: string, public description: string, public manDay: number, public status: TaskStatus) {
  }
}

/**************************** 状態管理用のクラス ****************************/
type Listener = (items: Task[]) => void;

class TaskState {
  private _projects: Task[];
  private _listeners: Listener[];
  private static _instance: TaskState;
  
  // privateコンストラクタ => シングルトンなクラス
  private constructor() {
    this._projects = [];
    this._listeners = [];
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new TaskState();
    return this._instance;
  }

  addListener(listenerFunc: Listener) {
    this._listeners.push(listenerFunc);
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

/**************************** リストの中のProjectを表示するクラス ***************************FF*/


/**************************** Projectのリスト（タスクボード）を表示するクラス ****************************/
class TaskBoard {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  sectionEl: HTMLElement;
  assignedTasks: Task[]; // プロジェクトの配列を保存するためのプロパティ

  constructor(private _type: 'active' | 'finished') {
    this.templateEl = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostEl = document.getElementById('app')! as HTMLDivElement;
    this.assignedTasks = [];

    const importedNode = document.importNode(this.templateEl.content, true);
    this.sectionEl = importedNode.firstElementChild as HTMLElement;
    this.sectionEl.id = `${this._type}-projects`;

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

    this.attach();  // sectionブロックを描画
    this.renderContent(); // sectionブロック内要素（h2・ul）への描画
  }

  private renderTasks() {
    const ulEl = document.getElementById(`${this._type}-projects-list`)! as HTMLUListElement;
    // リストをクリア
    ulEl.innerHTML = '';
    for (const prjItem of this.assignedTasks) {
      const liEl = document.createElement('li');
      liEl.textContent = prjItem.title;
      ulEl.appendChild(liEl);
    }
  }

  private renderContent() {
    // section要素の中のh2要素にテキストを追加
    const h2El = this.sectionEl.querySelector('h2')!;
    h2El.textContent = this._type === 'active' ? '実行中プロジェクト' : '完了プロジェクト'; 

    // section要素の中のul要素にid属性を追加
    const ulEl = this.sectionEl.querySelector('ul')!;
    ulEl.id = `${this._type}-projects-list`;
  }

  private attach() {
    this.hostEl.insertAdjacentElement('beforeend', this.sectionEl); // 終了タグの前
  }

}
/**************************** Formの表示・入力値の取得を行うクラス ****************************/
class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  // 入力フォームへの参照
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  manDayInputElement: HTMLInputElement;


  constructor() {
    this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostEl = document.getElementById('app')! as HTMLDivElement;

    // templateタグ（子孫要素も含む）をインポート・複製
    const importedNode = document.importNode(this.templateEl.content, true);
    // 最初の子要素をHTMLFormElement型で代入
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    /* 入力フォームへの参照 */
    this.titleInputElement =  this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement =  this.element.querySelector('#description') as HTMLInputElement;
    this.manDayInputElement =  this.element.querySelector('#manday') as HTMLInputElement;

    this.configure();
    this.attach();
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
  private submitHandler(event: Event) {
    event.preventDefault();
    
    const inputValues = this.gatherUserInput();
    if (Array.isArray(inputValues)) {
      const [title, description, manDay] = inputValues;

      projectState.addTask(title, description, manDay);
      this.clearInput();
    }
  } 

  /* イベントリスナーを設定 */
  private configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this));
  }

  /* 要素を追加 */
  private attach() {
    this.hostEl.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
const activePrjList = new TaskBoard('active');
const finishedPrjList = new TaskBoard('finished');
