import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FullCalendarModule,
  FullCalendarComponent,
} from "@fullcalendar/angular";
import {
  CalendarOptions,
  DateInput,
  EventClickArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  DateClickArg,
  Draggable,
} from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { BreadcrumbItem } from "src/app/shared/page-title/page-title.model";
import { CalendarEventComponent } from "./event/event.component";
import { CALENDAREVENTS, EXTERNALEVENTS } from "./shared/data";
import { ExternalEvent } from "./shared/event.model";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
})
export class CalendarComponent implements OnInit {
  pageTitle: BreadcrumbItem[] = [];
  calendarOptions: CalendarOptions = {};
  calendarEventsData: EventInput[] = [];
  selectedDay: any = {};
  isEditable: boolean = false;
  event: EventInput = {};
  externalEvents: ExternalEvent[] = [];
  //reference to full calender element
  @ViewChild("calendar")
  calendarComponent!: FullCalendarComponent;

  @ViewChild("eventModal", { static: true })
  eventModal!: CalendarEventComponent;

  constructor() {}

  ngOnInit(): void {
    this.pageTitle = [
      { label: "Apps", path: "/" },
      { label: "Calendar", path: "/", active: true },
    ];
    this._fetchData();
    this.initCalendar();
    this.calendarPlugins;
  }

  ngAfterViewInit(): void {
    new Draggable(document.getElementById("external-events")!, {
      itemSelector: ".external-event",
    });
  }

  calendarPlugins = [
    dayGridPlugin,
    interactionPlugin,
    bootstrapPlugin,
    timeGridPlugin,
    listPlugin,
  ];
  /**
   * initialize calendar config
   */
  initCalendar(): void {
    // full calendar config
    this.calendarOptions = {
      plugins: [
        dayGridPlugin,
        listPlugin,
        interactionPlugin,
        timeGridPlugin,
        bootstrapPlugin,
      ],
      themeSystem: "bootstrap",
      bootstrapFontAwesome: false,
      buttonText: {
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day",
        list: "List",
        prev: "Prev",
        next: "Next",
      },
      initialView: "dayGridMonth",
      handleWindowResize: true,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
      },
      events: [...this.calendarEventsData],
      editable: true,
      droppable: true, // this allows things to be dropped onto the calendar
      selectable: true,
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      drop: this.onDrop.bind(this),
      eventDrop: this.onEventDrop.bind(this),
    };
  }

  /**
   * fetches events
   */
  _fetchData(): void {
    this.calendarEventsData = CALENDAREVENTS;
    this.externalEvents = EXTERNALEVENTS;
  }

  /**
   * Opens event modal
   * @param title title of modal
   * @param data data to be used in modal
   */
  openEventModal(title: string = "", data: any = {}): void {
    this.eventModal.openModal(title, data);
  }

  /**
   * Creates new event for today
   */
  createNewEvent(): void {
    this.event = {
      id: String(this.calendarEventsData.length + 1),
      title: "",
      classNames: "",
      category: "bg-danger",
      start: new Date(),
    };
    this.isEditable = false;
    this.openEventModal("Add New Event", this.event);
  }

  /**
   * adds external events by Drag n Drop
   * @param event dropped event
   */
  onDrop(event: any): void {
    const draggedEl = event.draggedEl;
    const newEvent = {
      id: String(this.calendarEventsData.length + 1),
      title: draggedEl.innerText,
      start: event.date,
      classNames: "bg-" + draggedEl.getAttribute("data-type"),
    };
    // save new event
    this.calendarEventsData.push(newEvent);
    this.calendarOptions.events = [...this.calendarEventsData];
  }

  /**
   * on event drop between calendar
   */
  onEventDrop(arg: EventDropArg): void {
    let modifiedEvents = [...this.calendarEventsData];
    const idx = modifiedEvents.findIndex((e: any) => e["id"] === arg.event.id);
    modifiedEvents[idx]["title"] = arg.event.title;
    modifiedEvents[idx]["className"] = arg.event.classNames;
    modifiedEvents[idx]["start"] = arg.event.start as DateInput;
    modifiedEvents[idx]["end"] = arg.event.end as DateInput;
    this.calendarEventsData = modifiedEvents;
    this.isEditable = false;
  }

  /**
   * Handling date click on calendar
   * @param arg DateClickArg
   */
  handleDateClick(arg: DateClickArg): void {
    this.selectedDay = arg;
    this.event = {
      id: String(this.calendarEventsData.length + 1),
      title: "",
      classNames: "",
      category: "bg-danger",
      start: this.selectedDay.date,
    };
    this.isEditable = false;
    this.openEventModal("Add New Event", this.event);
  }

  /**
   * Handling click on event on calendar
   * @param arg EventClickArg
   */
  handleEventClick(arg: EventClickArg): void {
    const event = arg.event;
    this.event = {
      id: String(event.id),
      title: event.title,
      classNames: event.classNames,
      category: event.classNames[0],
    };
    this.isEditable = true;
    this.openEventModal("Edit Event", this.event);
  }

  /**
   * Handle the event save
   * @param newEvent new event
   */
  handleEventSave(newEvent: EventInput): void {
    if (this.isEditable) {
      let modifiedEvents = [...this.calendarEventsData];
      const eventIndex = modifiedEvents.findIndex(
        (event) => event.id === newEvent.id
      );
      this.calendarEventsData[eventIndex].title = newEvent.title;
      this.calendarEventsData[eventIndex].classNames = newEvent.category;
      this.calendarEventsData = modifiedEvents;
      this.isEditable = false;
    } else {
      let nEvent = {
        id: newEvent.id,
        title: newEvent.title,
        start: newEvent.start,
        classNames: newEvent.category,
      };
      this.calendarEventsData.push(nEvent);
    }
    this.calendarOptions.events = [...this.calendarEventsData];
  }

  /**
   * Deletes calendar event
   * @param deleteEvent event to be deleted
   */
  handleEventDelete(deleteEvent: EventInput): void {
    let modifiedEvents = [...this.calendarEventsData];
    const eventIndex = modifiedEvents.findIndex(
      (event) => event.id === deleteEvent.id
    );
    modifiedEvents.splice(eventIndex, 1);
    this.calendarEventsData = modifiedEvents;
    this.calendarOptions.events = [...this.calendarEventsData];
  }
}
