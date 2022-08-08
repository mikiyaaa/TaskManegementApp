namespace App {
/** バリデーションされるオブジェクトの型 */
  export interface ValidationObj {
    value: string | number;
    required?: boolean;
    maxLen?: number;
    minLen?: number;
    max?: number;
    min?: number;
  }
  
  export function validate(target: ValidationObj): boolean {
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
}