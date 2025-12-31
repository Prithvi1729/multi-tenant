import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({ selector: 'button[autoBtn]' })
export class AutoBtnDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const btn: HTMLElement = this.el.nativeElement;
    const hasBtnClass = Array.from(btn.classList).some(c => c.startsWith('btn'));
    if (!hasBtnClass) {
      this.renderer.addClass(btn, 'btn');
      this.renderer.addClass(btn, 'btn-primary');
    }
  }
}
