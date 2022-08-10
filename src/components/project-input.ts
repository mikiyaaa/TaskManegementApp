import Cmp from "./base-component.js";
import * as Validation from "../util/validation.js";
import { Autobind } from "../decorators/autobind.js";
import { projectState } from "../state/task-state.js";

/**************************** Formの表示・入力値の取得を行うクラス ****************************/
export class ProjectInput extends Cmp<HTMLDivElement, HTMLFormElement> {

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

        const validatedTitle: Validation.ValidationObj = {
        value: titleVal,
        required: true,
        }
        const validatedDesc: Validation.ValidationObj = {
        value: descriptionVal,
        maxLen: 50,
        }
        const validateManDay: Validation.ValidationObj = {
        value: +manDayVal,  // 数値型へ変換
        max: 1000,
        min: 1,
        }

        // Form Validation
        if (
            !Validation.validate(validatedTitle) ||
            !Validation.validate(validatedDesc) ||
            !Validation.validate(validateManDay)
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
