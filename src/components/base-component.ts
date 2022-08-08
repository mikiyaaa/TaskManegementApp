namespace App {
      /**************************** コンポーネントクラス（抽象クラス） ****************************/
  export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

}