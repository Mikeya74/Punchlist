import { useEffect } from "react";

export function useSwipeBack(onBack: () => void) {
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      const endX = e.changedTouches[0].clientX;
      const endY = Math.abs(e.changedTouches[0].clientY - startY);
      const diffX = endX - startX;

      if (diffX > 80 && endY < 60 && startX < 60) {
        onBack();
      }
    }

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onBack]);
}