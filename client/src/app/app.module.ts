import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { FormationService } from './core/services/formation.service';
import { StudentService } from './core/services/student.service';
import { MoodService } from './core/services/mood.service';
import { AlertService } from './core/services/alert.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { FormationListComponent } from './pages/formation-list/formation-list.component';
import { FormationDetailComponent } from './pages/formation-detail/formation-detail.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { TempGroupComponent } from './pages/temp-group/temp-group.component';
import { ProfileFeedbackComponent } from './pages/profile-feedback/profile-feedback.component';
import { FormationManagementComponent } from './pages/formation-management/formation-management.component';
import { MoodManagementComponent } from './pages/mood-management/mood-management.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { MoodHistoryComponent } from './pages/mood-history/mood-history.component';
import { SupervisorDashboardComponent } from './pages/supervisor/supervisor-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    FormationListComponent,
    FormationDetailComponent,
    UserProfileComponent,
    TempGroupComponent,
    ProfileFeedbackComponent,
    FormationManagementComponent,
    MoodManagementComponent,
    HeaderComponent,
    SupervisorDashboardComponent,
    UserManagementComponent,
    MoodHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    FormationService,
    StudentService,
    MoodService,
    AlertService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }