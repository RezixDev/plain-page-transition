import TWEEN, { Tween } from "@tweenjs/tween.js";

import { Page, AnimateExit, AnimateEnter } from "../Page";
import { getBoundingRectCustom } from "../../../utils/getBoundingRectCustom";
import { Paragraph } from "../../../utils/Paragraph";
import { globalState } from "../../../globalState";

export class LandingPage extends Page {
  _exitPageTween: Tween<{}> | null = null;

  constructor() {
    super();
  }

  animateExit(props: AnimateExit) {
    super.animateExit(props);

    const { fromEl, fromId, toEl, toId, trigger, resolveFn } = props;

    this._animatedParagraphs.forEach((p) => p.animateOut());

    if (toId === "case-study") {
      let fig: HTMLElement;

      if (!(trigger instanceof HTMLAnchorElement)) {
        const elId = toEl.dataset.transitionContentId!.slice(0, -7);

        fig = fromEl.querySelector(`[data-figure-id="${elId}"]`) as HTMLElement;

        // return console.log("trigger is not an anchor element");
      } else {
        fig = trigger.querySelector("figure")!;
      }

      const figRect = getBoundingRectCustom(fig);

      const destFig = toEl.querySelector("figure")!;
      const destFigRect = getBoundingRectCustom(destFig);

      const toScrollId = `[data-transition-content-id="${toEl.dataset.transitionContentId}"]`;
      const fromScrollId = `[data-transition-content-id="${fromEl.dataset.transitionContentId}"]`;

      const toScrollPos = globalState.savedScrollPositions.get(toScrollId) || 0;
      const fromScrollPos =
        globalState.savedScrollPositions.get(fromScrollId) || 0;

      const transX = destFigRect.left - figRect.left;
      const transY =
        destFigRect.top - figRect.top + fromScrollPos - toScrollPos;

      //select all figs on the fromEl
      const figs = fromEl.querySelectorAll("figure");
      //remove the fig that is being animated
      const figsArr = Array.from(figs).filter((f) => f !== fig);

      figsArr.forEach((f) => {
        const child = f.children[0] as HTMLElement;
        if (!child) return;
        child.classList.add("figure-img-case-study--out");
      });

      if (this._exitPageTween) this._exitPageTween.stop();

      this._exitPageTween = new TWEEN.Tween({
        height: figRect.height,
        width: figRect.width,
        transX: 0,
        transY: 0,
        normalized: 0,
      })
        .to(
          {
            height: destFigRect.height,
            width: destFigRect.width,
            transX: transX,
            transY: transY,
            normalized: 1,
          },
          1200
        )
        .delay(400)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate((obj) => {
          fig.style.width = `${obj.width}px`;
          fig.style.height = `${obj.height}px`;

          fig.style.transform = `translate(${obj.transX}px, ${obj.transY}px)`;
        })
        .start()
        .onComplete(() => {
          this._animatedParagraphs.forEach((p) => p.destroy());
          this._animatedParagraphs = [];

          figsArr.forEach((f) => {
            const child = f.children[0] as HTMLElement;
            if (!child) return console.log("no child");
            child.classList.remove("figure-img-case-study--out");
          });

          fig.style.width = figRect.width + "px";
          fig.style.height = figRect.height + "px";
          fig.style.transform = `translate(0px, 0px)`;

          resolveFn();
        });
      // }
    }
  }

  animateEnter(props: AnimateEnter) {
    super.animateEnter(props);
    const { el, pageId } = props;

    const paragraphs = el.querySelectorAll('[data-animation="paragraph"]');

    if (pageId === "landing") {
      Array.from(paragraphs).forEach((p) => {
        this._animatedParagraphs.push(
          new Paragraph({ element: p as HTMLElement })
        );
      });

      window.requestAnimationFrame(() => {
        this._animatedParagraphs.forEach((p) => p.animateIn());
      });
    }
  }
}
