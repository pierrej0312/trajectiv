import { Component } from '@angular/core';
import { AuthHero } from '@shared-ui';
import { Card } from 'primeng/card';
import { SignUp } from '@features/auth/components/sign-up/sign-up';

@Component({
  selector: 'app-sign-up-page',
  imports: [AuthHero, Card, SignUp],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.css',
})
export class SignUpPage {}
