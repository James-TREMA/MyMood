import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { FormationListComponent } from './pages/formation-list/formation-list.component';
import { FormationDetailComponent } from './pages/formation-detail/formation-detail.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { TempGroupComponent } from './pages/temp-group/temp-group.component';
import { MoodManagementComponent } from './pages/mood-management/mood-management.component';
import { ProfileFeedbackComponent } from './pages/profile-feedback/profile-feedback.component';
import { FormationManagementComponent } from './pages/formation-management/formation-management.component';
import { SupervisorDashboardComponent } from './pages/supervisor/supervisor-dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { MoodHistoryComponent } from './pages/mood-history/mood-history.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'supervisor',
    component: SupervisorDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['supervisor'] }
  },
  { 
    path: 'formations', 
    component: FormationListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'supervisor'] }
  },
  { 
    path: 'formations/:id', 
    component: FormationDetailComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'supervisor'] }
  },
  {
    path: 'mood',
    component: MoodManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] }
  },
  { 
    path: 'profile', 
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'temp-group', 
    component: TempGroupComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile-feedback', 
    component: ProfileFeedbackComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'formation-management', 
    component: FormationManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'mood-history',
    component: MoodHistoryComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }