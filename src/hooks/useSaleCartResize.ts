import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  clampCartListRatio,
  clampCartWidthRatio,
  loadCartListRatio,
  loadCartWidthRatio,
  MAX_CART_LIST_RATIO,
  MAX_CART_WIDTH_RATIO,
  MIN_CART_LIST_RATIO,
  MIN_CART_WIDTH_RATIO,
  persistCartListRatio,
  persistCartWidthRatio,
} from "@/lib/sale";

const RESIZE_HANDLE_HEIGHT = 10;
const RESIZE_HANDLE_WIDTH = 10;

function setBodyResizeState(active: boolean, cursor: "ew-resize" | "ns-resize" | null) {
  document.body.style.userSelect = active ? "none" : "";
  document.body.style.cursor = active && cursor ? cursor : "";
  document.body.style.touchAction = active ? "none" : "";
}

export function useSaleCartResize() {
  const saleLayoutRef = useRef<HTMLDivElement>(null);
  const cartColumnRef = useRef<HTMLDivElement>(null);
  const cartHeaderRef = useRef<HTMLDivElement>(null);
  const cartListRef = useRef<HTMLDivElement>(null);
  const [listRatio, setListRatio] = useState(loadCartListRatio);
  const [widthRatio, setWidthRatio] = useState(loadCartWidthRatio);
  const [listHeightPx, setListHeightPx] = useState(0);
  const [cartWidthPx, setCartWidthPx] = useState(0);
  const listRatioRef = useRef(listRatio);
  const widthRatioRef = useRef(widthRatio);
  const isDraggingWidthRef = useRef(false);
  const isDraggingListRef = useRef(false);
  const widthFrameRef = useRef<number | null>(null);
  const listFrameRef = useRef<number | null>(null);
  listRatioRef.current = listRatio;
  widthRatioRef.current = widthRatio;

  const applyCartWidth = useCallback((widthPx: number) => {
    cartColumnRef.current?.style.setProperty(
      "--sale-cart-width",
      `${Math.round(widthPx)}px`,
    );
  }, []);

  const applyListHeight = useCallback((heightPx: number) => {
    const list = cartListRef.current;
    if (!list) return;
    list.style.height = `${Math.round(heightPx)}px`;
  }, []);

  const measureListHeight = useCallback(() => {
    if (isDraggingListRef.current) return;

    const column = cartColumnRef.current;
    const header = cartHeaderRef.current;
    if (!column || !header) return;

    const availableHeight =
      column.clientHeight - header.offsetHeight - RESIZE_HANDLE_HEIGHT;
    if (availableHeight <= 0) return;

    const nextHeight = Math.round(availableHeight * listRatioRef.current);
    setListHeightPx(nextHeight);
    applyListHeight(nextHeight);
  }, [applyListHeight]);

  const measureCartWidth = useCallback(() => {
    if (isDraggingWidthRef.current) return;

    const layout = saleLayoutRef.current;
    if (!layout) return;

    const availableWidth = layout.clientWidth - RESIZE_HANDLE_WIDTH;
    if (availableWidth <= 0) return;

    const nextWidth = Math.round(availableWidth * widthRatioRef.current);
    setCartWidthPx(nextWidth);
    applyCartWidth(nextWidth);
  }, [applyCartWidth]);

  useLayoutEffect(() => {
    measureListHeight();
    measureCartWidth();
  }, [measureListHeight, measureCartWidth]);

  useEffect(() => {
    const column = cartColumnRef.current;
    const layout = saleLayoutRef.current;
    if (!column && !layout) return;

    const observer = new ResizeObserver(() => {
      measureListHeight();
      measureCartWidth();
    });

    if (column) observer.observe(column);
    if (layout) observer.observe(layout);

    return () => observer.disconnect();
  }, [measureListHeight, measureCartWidth]);

  const startListResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();

      const column = cartColumnRef.current;
      const header = cartHeaderRef.current;
      const handle = event.currentTarget;
      if (!column || !header) return;

      const availableHeight =
        column.clientHeight - header.offsetHeight - RESIZE_HANDLE_HEIGHT;
      if (availableHeight <= 0) return;

      isDraggingListRef.current = true;
      handle.setPointerCapture(event.pointerId);
      setBodyResizeState(true, "ns-resize");

      const startY = event.clientY;
      const startHeight = listHeightPx || availableHeight * listRatioRef.current;
      let pendingHeight = startHeight;

      const flushListHeight = () => {
        listFrameRef.current = null;
        const nextRatio = clampCartListRatio(pendingHeight / availableHeight);
        listRatioRef.current = nextRatio;
        applyListHeight(pendingHeight);
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        pendingHeight = Math.min(
          availableHeight * MAX_CART_LIST_RATIO,
          Math.max(
            availableHeight * MIN_CART_LIST_RATIO,
            startHeight + (moveEvent.clientY - startY),
          ),
        );

        if (listFrameRef.current == null) {
          listFrameRef.current = requestAnimationFrame(flushListHeight);
        }
      };

      const finishResize = (moveEvent: PointerEvent) => {
        if (listFrameRef.current != null) {
          cancelAnimationFrame(listFrameRef.current);
          listFrameRef.current = null;
        }

        isDraggingListRef.current = false;
        setBodyResizeState(false, null);

        if (handle.hasPointerCapture(moveEvent.pointerId)) {
          handle.releasePointerCapture(moveEvent.pointerId);
        }

        const nextRatio = clampCartListRatio(pendingHeight / availableHeight);
        listRatioRef.current = nextRatio;
        const nextHeight = Math.round(availableHeight * nextRatio);
        setListRatio(nextRatio);
        setListHeightPx(nextHeight);
        applyListHeight(nextHeight);
        persistCartListRatio(nextRatio);

        handle.removeEventListener("pointermove", handlePointerMove);
        handle.removeEventListener("pointerup", finishResize);
        handle.removeEventListener("pointercancel", finishResize);
      };

      handle.addEventListener("pointermove", handlePointerMove);
      handle.addEventListener("pointerup", finishResize);
      handle.addEventListener("pointercancel", finishResize);
    },
    [applyListHeight, listHeightPx],
  );

  const startWidthResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();

      const layout = saleLayoutRef.current;
      const handle = event.currentTarget;
      if (!layout) return;

      const availableWidth = layout.clientWidth - RESIZE_HANDLE_WIDTH;
      if (availableWidth <= 0) return;

      isDraggingWidthRef.current = true;
      handle.setPointerCapture(event.pointerId);
      setBodyResizeState(true, "ew-resize");

      const startX = event.clientX;
      const startWidth = cartWidthPx || availableWidth * widthRatioRef.current;
      let pendingWidth = startWidth;

      const flushCartWidth = () => {
        widthFrameRef.current = null;
        const nextRatio = clampCartWidthRatio(pendingWidth / availableWidth);
        widthRatioRef.current = nextRatio;
        applyCartWidth(pendingWidth);
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        pendingWidth = Math.min(
          availableWidth * MAX_CART_WIDTH_RATIO,
          Math.max(
            availableWidth * MIN_CART_WIDTH_RATIO,
            startWidth + (moveEvent.clientX - startX),
          ),
        );

        if (widthFrameRef.current == null) {
          widthFrameRef.current = requestAnimationFrame(flushCartWidth);
        }
      };

      const finishResize = (moveEvent: PointerEvent) => {
        if (widthFrameRef.current != null) {
          cancelAnimationFrame(widthFrameRef.current);
          widthFrameRef.current = null;
        }

        isDraggingWidthRef.current = false;
        setBodyResizeState(false, null);

        if (handle.hasPointerCapture(moveEvent.pointerId)) {
          handle.releasePointerCapture(moveEvent.pointerId);
        }

        const nextRatio = clampCartWidthRatio(pendingWidth / availableWidth);
        widthRatioRef.current = nextRatio;
        const nextWidth = Math.round(availableWidth * nextRatio);
        setWidthRatio(nextRatio);
        setCartWidthPx(nextWidth);
        applyCartWidth(nextWidth);
        persistCartWidthRatio(nextRatio);

        handle.removeEventListener("pointermove", handlePointerMove);
        handle.removeEventListener("pointerup", finishResize);
        handle.removeEventListener("pointercancel", finishResize);
      };

      handle.addEventListener("pointermove", handlePointerMove);
      handle.addEventListener("pointerup", finishResize);
      handle.addEventListener("pointercancel", finishResize);
    },
    [applyCartWidth, cartWidthPx],
  );

  return {
    saleLayoutRef,
    cartColumnRef,
    cartHeaderRef,
    cartListRef,
    listHeightPx,
    listRatio,
    cartWidthPx,
    widthRatio,
    minListRatio: MIN_CART_LIST_RATIO,
    maxListRatio: MAX_CART_LIST_RATIO,
    minWidthRatio: MIN_CART_WIDTH_RATIO,
    maxWidthRatio: MAX_CART_WIDTH_RATIO,
    startListResize,
    startWidthResize,
  };
}
