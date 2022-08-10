/**************************** Drag & Drop ****************************/
// ドラッグ可能なコンポーネントに実装するためのインターフェース
export interface Draggble {

  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

// ドロップされる場所のインターフェース
export interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

