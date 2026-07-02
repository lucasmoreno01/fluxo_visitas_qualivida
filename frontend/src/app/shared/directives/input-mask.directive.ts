import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  countDigitsBeforeIndex,
  formatWithMask,
  indexAfterDigits,
} from './input-masks';

@Directive({
  selector: 'input[appInputMask]',
  standalone: true,
})
export class InputMaskDirective {
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  @Input({ alias: 'appInputMask', required: true }) mask = '';

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const digitsBeforeCursor = countDigitsBeforeIndex(input.value, input.selectionStart ?? 0);
    const maskedValue = formatWithMask(input.value, this.mask);

    input.value = maskedValue;
    this.ngControl?.control?.setValue(maskedValue, { emitEvent: false });

    const nextCursor = indexAfterDigits(maskedValue, this.mask, digitsBeforeCursor);
    input.setSelectionRange(nextCursor, nextCursor);
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.elementRef.nativeElement;
    const maskedValue = formatWithMask(input.value, this.mask);

    if (input.value === maskedValue) {
      return;
    }

    input.value = maskedValue;
    this.ngControl?.control?.setValue(maskedValue, { emitEvent: false });
  }
}
