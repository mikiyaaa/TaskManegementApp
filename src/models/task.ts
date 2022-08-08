namespace App {
/**************************** Taskのタイプを定義するクラス ****************************/
  export enum TaskStatus {
    Active, Finished
  }
  
  export class Task {
    constructor(public id: string, public title: string, public description: string, public manDay: number, public status: TaskStatus) {
    }
  }
}