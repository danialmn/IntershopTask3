import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { pick } from 'lodash-es';
import { Observable } from 'rxjs';

import { QuoteContextFacade } from '../../facades/quote-context.facade';
import { QuoteRequest } from '../../models/quoting/quoting.model';

/**
 * The Quote Edit Component displays and updates quote or quote request data.
 * It provides modify and delete functionality for quote request items.
 */
@Component({
  selector: 'ish-quote-edit',
  templateUrl: './quote-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteEditComponent implements OnInit {
  quote$: Observable<QuoteRequest>;
  form = new UntypedFormGroup({
    displayName: new UntypedFormControl(''),
    description: new UntypedFormControl(''),
  });

  constructor(private context: QuoteContextFacade) {}

  private get valuesFromQuote() {
    return pick(this.context.get('entity'), 'displayName', 'description');
  }

  ngOnInit() {
    this.quote$ = this.context.select('entityAsQuoteRequest');

    this.context.hold(this.quote$, () => this.reset());
  }

  update() {
    const formValues = this.form.value;
    const quoteValues = this.valuesFromQuote;

    if (
      formValues.displayName !== quoteValues.displayName ||
      // eslint-disable-next-line eqeqeq
      formValues.description != quoteValues.description
    ) {
      this.context.update(formValues);
    }
  }

  reset() {
    this.form.reset(this.valuesFromQuote);
  }
}
