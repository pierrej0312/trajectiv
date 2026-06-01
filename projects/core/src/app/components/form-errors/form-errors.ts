import { Component, input } from '@angular/core';
import { FieldState } from '@angular/forms/signals';
import { Message } from 'primeng/message';

@Component({
  selector: 'form-errors',
  imports: [Message],
  templateUrl: './form-errors.html',
  styleUrl: './form-errors.css',
})
export class FormErrors {
  field = input.required<FieldState<unknown, string>>();
}
