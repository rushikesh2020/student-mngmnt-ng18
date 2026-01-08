import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Student } from '../../models/student.interface';

@Component({
  selector: 'app-student-form',
  standalone: true,
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule
  ],
})
export class StudentFormComponent implements OnChanges {
  @Input() student: Student | null = null;
  @Input() isVisible: boolean = false;

  @Output() formSubmit = new EventEmitter<Student>();
  @Output() formCancel = new EventEmitter<void>();

  studentForm: FormGroup;
  classOptions = ['8th', '9th', '10th', '11th', '12th'];
  divisionOptions = ['A', 'B', 'C', 'D'];

  constructor(private fb: FormBuilder) {
    this.studentForm = this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student']) {
      this.populateForm();
    }

    if (changes['isVisible'] && !this.isVisible) {
      this.resetForm();
    }
  }

  get isEditMode(): boolean {
    return this.student !== null;
  }

  get formTitle(): string {
    return this.isEditMode ? 'Edit Student' : 'Add New Student';
  }

  get formIcon(): string {
    return this.isEditMode ? 'edit' : 'person_add';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Student' : 'Add Student';
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(11)]],
      class: ['', [Validators.required]],
      division: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private populateForm(): void {
    if (this.student) {
      this.studentForm.patchValue({
        firstName: this.student.firstName,
        middleName: this.student.middleName,
        lastName: this.student.lastName,
        age: this.student.age,
        class: this.student.class,
        division: this.student.division,
        dateOfBirth: new Date(this.student.dateOfBirth),
        email: this.student.email
      });
    }
  }

  private resetForm(): void {
    this.studentForm.reset();
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      return;
    }

    const formValue = this.studentForm.value;
    const studentData: Student = {
      id: this.student?.id ?? Date.now(),
      firstName: formValue.firstName.trim(),
      middleName: formValue.middleName.trim(),
      lastName: formValue.lastName.trim(),
      age: Number(formValue.age),
      class: formValue.class,
      division: formValue.division,
      dateOfBirth: this.formatDate(formValue.dateOfBirth),
      email: formValue.email.trim()
    };

    this.formSubmit.emit(studentData);
    this.resetForm();
  }

  onCancel(): void {
    this.formCancel.emit();
    this.resetForm();
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.studentForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }
}
