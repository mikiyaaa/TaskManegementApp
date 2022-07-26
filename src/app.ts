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

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  // 入力フォームへの参照
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  manDayInputElement: HTMLInputElement;


  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // templateタグ（子孫要素も含む）をインポート・複製
    const importedNode = document.importNode(this.templateElement.content, true);
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
      console.log(title, description, manDay);
      this.clearInput();
    }
  } 

  /* イベントリスナーを設定 */
  private configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this));
  }

  /* 要素を追加 */
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();