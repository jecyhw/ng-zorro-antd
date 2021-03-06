import {
  ComponentFactory,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  Renderer2,
  ViewContainerRef
} from '@angular/core';

import { distinctUntilChanged } from 'rxjs/operators';

import { InputBoolean } from '../core/util/convert';
import { NzTooltipDirective } from '../tooltip/nz-tooltip.directive';
import { NzPopconfirmComponent } from './nz-popconfirm.component';

@Directive({
  selector: '[nz-popconfirm]',
  host: {
    '[class.ant-popover-open]': 'isTooltipOpen'
  }
})
export class NzPopconfirmDirective extends NzTooltipDirective implements OnInit {
  factory: ComponentFactory<NzPopconfirmComponent> = this.resolver.resolveComponentFactory(NzPopconfirmComponent);

  protected needProxyProperties = [
    'nzTitle',
    'nzContent',
    'nzOverlayClassName',
    'nzOverlayStyle',
    'nzMouseEnterDelay',
    'nzMouseLeaveDelay',
    'nzVisible',
    'nzTrigger',
    'nzPlacement',
    'nzOkText',
    'nzOkType',
    'nzCancelText',
    'nzCondition'
  ];

  @Input() nzOkText: string;
  @Input() nzOkType: string;
  @Input() nzCancelText: string;
  @Input() @InputBoolean() nzCondition: boolean;
  @Output() readonly nzOnCancel = new EventEmitter<void>();
  @Output() readonly nzOnConfirm = new EventEmitter<void>();

  constructor(
    elementRef: ElementRef,
    hostView: ViewContainerRef,
    resolver: ComponentFactoryResolver,
    renderer: Renderer2,
    @Optional() tooltip: NzPopconfirmComponent
  ) {
    super(elementRef, hostView, resolver, renderer, tooltip);
  }

  ngOnInit(): void {
    if (!this.tooltip) {
      const tooltipComponent = this.hostView.createComponent(this.factory);
      this.tooltip = tooltipComponent.instance;
      // Remove element when use directive https://github.com/NG-ZORRO/ng-zorro-antd/issues/1967
      this.renderer.removeChild(this.renderer.parentNode(this.elementRef.nativeElement), tooltipComponent.location.nativeElement);
      this.isDynamicTooltip = true;
      this.needProxyProperties.forEach(property => this.updateCompValue(property, this[ property ]));
      const visible_ = this.tooltip.nzVisibleChange.pipe(distinctUntilChanged()).subscribe(data => {
        this.visible = data;
        this.nzVisibleChange.emit(data);
      });
      const cancel_ = (this.tooltip as NzPopconfirmComponent).nzOnCancel.subscribe(() => {
        this.nzOnCancel.emit();
      });
      const confirm_ = (this.tooltip as NzPopconfirmComponent).nzOnConfirm.subscribe(() => {
        this.nzOnConfirm.emit();
      });
      this.subs_.add(visible_);
      this.subs_.add(cancel_);
      this.subs_.add(confirm_);
    }
    this.tooltip.setOverlayOrigin(this);
  }
}
