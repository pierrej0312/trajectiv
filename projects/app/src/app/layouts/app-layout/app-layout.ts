import { Component, inject, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { AppContextStore, ShellStore } from '@core';

import { Navbar } from '../components/navbar/navbar';
import { Sidebar } from '../components/sidebar/sidebar';
import { BottomBar } from '../components/bottom-bar/bottom-bar';

@Component({
  selector: 'app-app-layout',

  imports: [RouterOutlet, Navbar, Sidebar, BottomBar],

  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout implements OnInit {
  readonly appContext = inject(AppContextStore);
  readonly shell = inject(ShellStore);

  ngOnInit(): void {
    this.appContext.loadMe();
  }
}
