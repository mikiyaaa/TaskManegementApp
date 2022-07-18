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

  /* フォーム送信時イベント */
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
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