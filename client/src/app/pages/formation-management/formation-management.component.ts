import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormationService, Formation } from '../../core/services/formation.service';
import { NotificationService } from '../../core/services/notification.service';
import { StudentService, Student } from '../../core/services/student.service';

@Component({
  selector: 'app-formation-management',
  templateUrl: './formation-management.component.html',
  styleUrls: ['./formation-management.component.css']
})
export class FormationManagementComponent implements OnInit {
  formations: Formation[] = [];
  showNewFormationDialog = false;
  newFormationName: string = '';
  selectedFormations: number[] = [];
  students: Student[] = [];
  selectedStudents: number[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private formationService: FormationService,
    private studentService: StudentService,
    private notificationService: NotificationService
  ) {}

  newStudent = {
    name: '',
    email: '',
    password: 'Test12345', // Mot de passe par défaut
    role: 'student',
    formation: null as number | null
  };

  ngOnInit() {
    this.loadFormations();
    this.loadStudents();
  }

  loadFormations() {
    this.formationService.getFormations().subscribe({
      next: (formations) => {
        this.formations = formations.map(formation => ({
          ...formation,
          assignments: formation.assignments || []
        }));
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.notificationService.error('Erreur lors du chargement des formations');
      }
    });
  }

  createFormation() {
    this.showNewFormationDialog = true;
  }

  confirmCreateFormation() {
    if (!this.newFormationName.trim()) {
      this.notificationService.error('Le nom de la formation est requis');
      this.showNewFormationDialog = false;
      return;
    }

    this.formationService.createFormation(this.newFormationName).subscribe({
      next: (formation) => {
        this.loadFormations(); // Recharger toutes les formations
        this.newFormationName = '';
        this.showNewFormationDialog = false;
        this.notificationService.success('Formation créée avec succès');
      },
      error: (error) => {
        console.error('Error creating formation:', error);
        this.notificationService.error(error.error?.message || 'Erreur lors de la création de la formation');
        this.showNewFormationDialog = false;
      }
    });
  }
  
  cancelCreateFormation() {
    this.showNewFormationDialog = false;
    this.newFormationName = '';
  }

  deleteFormation(id: number) {
    this.formationService.deleteFormation(id).subscribe({
      next: () => {
        this.formations = this.formations.filter(f => f.id !== id);
        this.notificationService.success('Formation supprimée avec succès');
      },
      error: (error) => {
        console.error('Error deleting formation:', error);
        this.notificationService.error('Erreur lors de la suppression de la formation');
      }
    });
  }

  loadStudents() {
    this.studentService.getStudents().subscribe({
      next: (students) => {
        this.students = students.filter(s => s.role === 'student');
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.notificationService.error('Erreur lors du chargement des stagiaires');
      }
    });
  }

  addStudent() {
    if (!this.validateStudent(this.newStudent)) {
      this.notificationService.error('Veuillez remplir tous les champs');
      return;
    }

    this.studentService.createStudent(this.newStudent).subscribe({
      next: (student) => {
        if (this.newStudent.formation) {
          this.formationService.assignStudent(this.newStudent.formation, student.id).subscribe({
            next: () => {
              this.loadStudents();
              this.resetNewStudent();
              this.notificationService.success('Stagiaire ajouté avec succès');
            },
            error: (error) => {
              console.error('Error assigning student:', error);
              this.notificationService.error('Erreur lors de l\'assignation à la formation');
            }
          });
        } else {
          this.loadStudents();
          this.resetNewStudent();
          this.notificationService.success('Stagiaire ajouté avec succès');
        }
      },
      error: (error) => {
        console.error('Error creating student:', error);
        this.notificationService.error('Erreur lors de la création du stagiaire');
      }
    });
  }

  getFormationName(student: Student): string {
    if (student.cohortAssignments && 
        student.cohortAssignments.length > 0 && 
        student.cohortAssignments[0].cohort) {
      return student.cohortAssignments[0].cohort.name;
    }
    return 'Non assigné';
  }

  assignStudentToFormation(studentId: number, event: any) {
    const formationId = parseInt(event.target.value);
    if (!isNaN(formationId)) {
      // Si formationId est 0 ou vide, on retire l'étudiant de sa formation actuelle
      const student = this.students.find(s => s.id === studentId);
      const currentFormationId = student?.cohortAssignments?.[0]?.cohort_id;
      
      if (currentFormationId) {
        this.formationService.removeStudent(currentFormationId, studentId).subscribe({
          next: () => {
            if (formationId) {
              this.assignToNewFormation(formationId, studentId);
            } else {
              this.loadStudents();
              this.notificationService.success('Stagiaire retiré de la formation');
            }
          },
          error: (error) => {
            console.error('Error removing student:', error);
            this.notificationService.error('Erreur lors du retrait du stagiaire');
          }
        });
      } else if (formationId) {
        this.assignToNewFormation(formationId, studentId);
      }
    }
  }

  private assignToNewFormation(formationId: number, studentId: number) {
    this.formationService.assignStudent(formationId, studentId).subscribe({
      next: () => {
        this.loadStudents();
        this.notificationService.success('Stagiaire assigné avec succès');
      },
      error: (error) => {
        console.error('Error assigning student:', error);
        this.notificationService.error('Erreur lors de l\'assignation du stagiaire');
      }
    });
  }

  isStudentInFormation(student: Student, formationId: number): boolean {
    return student.cohortAssignments?.some(
      assignment => assignment.cohort.id === formationId
    ) || false;
  }

  private validateStudent(student: any): boolean {
    return Boolean(student.name) && 
           Boolean(student.email);
  }

  private resetNewStudent() {
    this.newStudent = {
      name: '',
      email: '',
      password: 'Test12345',
      role: 'student',
      formation: null
    };
  }

  toggleStudentSelection(studentId: number) {
    const index = this.selectedStudents.indexOf(studentId);
    if (index === -1) {
      this.selectedStudents.push(studentId);
    } else {
      this.selectedStudents.splice(index, 1);
    }
  }

  deleteSelectedStudents() {
    if (!this.selectedStudents.length) {
      this.notificationService.error('Veuillez sélectionner des stagiaires à supprimer');
      return;
    }

    const deletePromises = this.selectedStudents.map(id => 
      this.studentService.deleteStudent(id).toPromise()
    );

    Promise.all(deletePromises)
      .then(() => {
        this.loadStudents();
        this.selectedStudents = [];
        this.notificationService.success('Stagiaires supprimés avec succès');
      })
      .catch(error => {
        console.error('Error deleting students:', error);
        this.notificationService.error('Erreur lors de la suppression des stagiaires');
      });
  }
  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }

  onFormationsClick(): void {
    this.router.navigate(['/formations']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}