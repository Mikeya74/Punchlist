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
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = Math.abs(endY - startY);

      // Swipe right at least 80px, and more horizontal than vertical
      if (diffX > 80 && diffY < 60 && startX < 60) {
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