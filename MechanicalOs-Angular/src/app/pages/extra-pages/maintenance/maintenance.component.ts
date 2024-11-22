import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MaintenanceQuestion } from './maintenance.model';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit, AfterViewInit {

  maintenanceQueries: MaintenanceQuestion[] = [];

  constructor () {
  }

  ngOnInit(): void {
    this.maintenanceQueries = [
      {
        icon: 'dripicons-jewel',
        title: 'Why is the Site Down?',
        desc: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.',
      },
      {
        icon: 'dripicons-clock',
        title: 'What is the Downtime?',
        desc: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical but the majority.',
      },
      {
        icon: 'dripicons-question',
        title: 'Do you need Support?',
        desc: "If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embar... no-reply@domain.com",
      },
    ];
  }

  ngAfterViewInit(): void {
    document.body.classList.remove('authentication-bg-pattern');
  }

}
