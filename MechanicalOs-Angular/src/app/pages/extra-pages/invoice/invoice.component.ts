import { Component, OnInit } from '@angular/core';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';
import { Invoice } from './invoice.model';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  pageTitle: BreadcrumbItem[] = [];
  invoiceData!: Invoice;

  constructor () { }

  ngOnInit(): void {
    this.pageTitle = [{ label: 'Extra Pages', path: '/' }, { label: 'Invoice', path: '/', active: true }];
    this._fetchData();
  }

  /**
   * fetches invoice data
   */
  _fetchData(): void {

    this.invoiceData = {
      customer: ' Stanley Jones',
      notes: 'All accounts are to be paid within 7 days from receipt of invoice. To be paid by cheque or credit card or direct payment online. If account is not paid within 7 days the credits details supplied as confirmation of work undertaken will be charged the agreed quoted fee noted above',
      invoice_date: 'Jan 17, 2016',
      invoice_id: '000028',
      invoice_status: 'Unpaid',
      address: {
        owner: 'Stanely Jones',
        line_1: '795 Folsom Ave, Suite 600',
        city: 'San Francisco',
        state: 'CA',
        zip: 94107,
        phone: '(123) 456-7890',
      },
      billing_address: {
        owner: 'Stanely Jones',
        line_1: '795 Folsom Ave, Suite 600',
        city: 'San Francisco',
        state: 'CA',
        zip: 94107,
        phone: '(123) 456-7890',
      },
      items: [
        {
          id: 1,
          name: 'Web Design',
          description: '2 Pages static website - my website',
          hours: 22,
          hour_rate: 30,
          total: 660.00,
        },
        {
          id: 2,
          name: 'Software Development',
          description: 'Invoice editor software - AB\'c Software',
          hours: 112.5,
          hour_rate: 35,
          total: 3937.00,
        }
      ],
      sub_total: 4120.00,
      discount: 459.75,
      total: 4137.75,
    }
  }

}
