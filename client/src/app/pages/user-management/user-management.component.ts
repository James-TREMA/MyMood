import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  userForm: FormGroup;
  editForms: Map<number, FormGroup> = new Map();
  selectedUser: any = null;
  isEditingForm = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['student', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  startEdit(user: any) {
    const editForm = this.fb.group({
      name: [user.name, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      role: [user.role, Validators.required]
    });
    this.editForms.set(user.id, editForm);
  }

  cancelEdit(userId: number) {
    this.editForms.delete(userId);
  }

  isEditing(userId: number): boolean {
    return this.editForms.has(userId);
  }

  getEditForm(userId: number): FormGroup {
    return this.editForms.get(userId) || this.fb.group({});
  }

  async updateUser(userId: number) {
    const form = this.editForms.get(userId);
    if (form && form.valid) {
      try {
        await this.userService.updateUser(userId, form.value).toPromise();
        this.notificationService.success('Utilisateur mis à jour avec succès');
        this.loadUsers();
        this.editForms.delete(userId);
      } catch (error) {
        console.error('Error updating user:', error);
        this.notificationService.error('Erreur lors de la mise à jour de l\'utilisateur');
      }
    }
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notificationService.error('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.isEditingForm) {
        this.userService.updateUser(this.selectedUser.id, userData).subscribe({
          next: () => {
            this.notificationService.success('Utilisateur mis à jour avec succès');
            this.loadUsers();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.notificationService.error('Erreur lors de la mise à jour de l\'utilisateur');
          }
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.notificationService.success('Utilisateur créé avec succès');
            this.loadUsers();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.notificationService.error('Erreur lors de la création de l\'utilisateur');
          }
        });
      }
    }
  }

  editUser(user: any) {
    this.selectedUser = user;
    this.isEditingForm = true;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });
    this.userForm.get('password')?.setValidators([]); // Mot de passe optionnel en édition
  }

  async deleteUser(userId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await this.userService.deleteUser(userId).toPromise();
        this.users = this.users.filter(user => user.id !== userId);
        this.notificationService.success('Utilisateur supprimé avec succès');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        this.notificationService.error(error.error?.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
    }
  }

  resetForm() {
    this.userForm.reset({ role: 'student' });
    this.selectedUser = null;
    this.isEditingForm = false;
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
  }
}