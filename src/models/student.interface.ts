// Student data model interface
export interface Student {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  class: string;
  division: string;
  dateOfBirth: string;
  email: string;
}

// Modal operation modes
export type ModalMode = 'add' | 'edit' | 'delete';

// Modal data interface
export interface ModalData {
  mode: ModalMode;
  student?: Student;
}