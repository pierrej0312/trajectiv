import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@app/src/app/layouts/components/navbar/navbar';
import { Sidebar } from '@app/src/app/layouts/components/sidebar/sidebar';
import { BottomBar } from '@app/src/app/layouts/components/bottom-bar/bottom-bar';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Navbar, Sidebar, BottomBar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
