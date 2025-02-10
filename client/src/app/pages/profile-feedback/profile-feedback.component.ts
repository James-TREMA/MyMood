import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-feedback',
  templateUrl: './profile-feedback.component.html',
  styleUrls: ['./profile-feedback.component.css']
})
export class ProfileFeedbackComponent {
  constructor(private router: Router) {}

  onOkClick() {
    this.router.navigate(['/formations']);
  }
}