import { Component, Inject } from '@angular/core';

import { ControlUnit, Peripheral } from '../../carrera';

import { ArrayObservable, BehaviorSubject, Observable } from '../../rxjs';

import { Backend } from '../../backends';

import { CONTROL_UNIT_SUBJECT } from '../../providers';

@Component({
  templateUrl: 'build/pages/connection/connection.html'
})
export class ConnectionPage {

  items: Observable<Peripheral[]>;

  version: Observable<string>;

  constructor(@Inject(CONTROL_UNIT_SUBJECT) private cu: BehaviorSubject<ControlUnit>,
              @Inject(Backend) backends: Backend[])
  {
    this.items = ArrayObservable.create(backends).mergeAll().scan(
      (result, value) => result.concat(value), []
    );
    this.version = cu.switchMap(cu => {
      return cu ? cu.getVersion() : Observable.of(null);
    });
  }

  onClick(peripheral: Peripheral) {
    if (this.cu.value) {
      this.cu.value.disconnect();
      if (peripheral.equals(this.cu.value.peripheral)) {
        this.cu.next(null);
      } else {
        const cu = new ControlUnit(peripheral);
        cu.connect();
        this.cu.next(cu);
      }
    } else {
      const cu = new ControlUnit(peripheral);
      cu.connect();
      this.cu.next(cu);
    }
  }
}
