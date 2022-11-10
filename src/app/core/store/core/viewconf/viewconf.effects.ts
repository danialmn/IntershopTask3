import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction, routerRequestAction } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { EMPTY, defer, fromEvent, iif } from 'rxjs';
import { bufferToggle, concatMap, delay, distinctUntilChanged, filter, first, map } from 'rxjs/operators';

import { BreadcrumbItem } from 'ish-core/models/breadcrumb-item/breadcrumb-item.interface';
import { selectRouteData } from 'ish-core/store/core/router';
import { whenTruthy } from 'ish-core/utils/operators';

import { setBreadcrumbData, setStickyHeader } from './viewconf.actions';

@Injectable()
export class ViewconfEffects {
  constructor(private store: Store, private actions$: Actions) {}

  toggleStickyHeader$ = createEffect(() =>
    iif(
      () => !SSR,
      defer(() =>
        fromEvent(window, 'scroll').pipe(
          map(() => window.scrollY >= 170),
          distinctUntilChanged(),
          map(sticky => setStickyHeader({ sticky }))
        )
      ),
      EMPTY
    )
  );

  retrieveBreadcrumbDataFromRouting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setBreadcrumbData),
      // collect all breadcrumb actions during routing
      bufferToggle(this.actions$.pipe(ofType(routerRequestAction)), () =>
        this.actions$.pipe(ofType(routerNavigatedAction), delay(10))
      ),
      // if no breadcrumb was set with effects
      filter(actions => !actions.length),
      concatMap(() =>
        // set the current one from the routing (if available)
        this.store.pipe(
          select(selectRouteData<BreadcrumbItem[]>('breadcrumbData')),
          first(),
          whenTruthy(),
          map(breadcrumbData => setBreadcrumbData({ breadcrumbData }))
        )
      )
    )
  );
}
