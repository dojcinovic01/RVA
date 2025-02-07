import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'users', component: UserListComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: 'login' }
];
