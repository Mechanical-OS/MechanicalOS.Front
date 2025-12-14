import { Component } from '@angular/core';
import { BreadcrumbItem } from '../shared/page-title/page-title.model';
import { PageTitleModule } from "../shared/page-title/page-title.module";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PageTitleModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  pageTitle: BreadcrumbItem[] = [];

  constructor () { }

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Apps", path: "/" },
      { label: "Ferramentas", path: "/", active: true },
    ];
  }
}
