import { useLayoutEffect } from "react";
import $ from "jquery";

/** ---------------------------------------
 * fadeSlice 원본문 저장용 WeakMap
 * --------------------------------------- */
let fadeSliceOriginalTexts = new WeakMap();

/** ---------------------------------------
 * 🚀 단일 요소 줄 나누기 함수
 * --------------------------------------- */
function applyFadeSlice($target, description) {
  if (!$target || $target.length === 0) return;

  /** 텍스트 정리 */
  let text = (description || $target[0].innerText || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return;

  $target.empty();

  const words = text.split(" ");
  const maxWidth = $target.width();

  const lines = [];
  let current = [];

  /** measuring span */
  const $measure = $("<span></span>").css({
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "nowrap",
    top: -9999,
    left: -9999,
    fontFamily: $target.css("font-family"),
    fontSize: $target.css("font-size"),
    fontWeight: $target.css("font-weight"),
    letterSpacing: $target.css("letter-spacing"),
  }).appendTo("body");

  const measure = (arr) => {
    $measure.text(arr.join(" "));
    return $measure.width();
  };

  /** 줄 계산 */
  words.forEach((w) => {
    const test = [...current, w];
    if (measure(test) > maxWidth && current.length > 0) {
      lines.push([...current]);
      current = [w];
    } else {
      current.push(w);
    }
  });

  if (current.length) lines.push(current);

  $measure.remove();

  /** DOM 렌더링 */
  lines.forEach((words) => {
    const $l = $('<div class="line"></div>');
    const $i = $('<div class="inner"></div>');
    words.forEach((w, idx) => {
      $i.append($("<span>").text(w));
      if (idx < words.length - 1) $i.append(" ");
    });
    $l.append($i);
    $target.append($l);
  });
}

/** ---------------------------------------
 * 🚀 모든 fade-slice 초기 실행
 * --------------------------------------- */
function initFadeSliceAll() {
  $(".fade-slice").each(function () {
    const $el = $(this);
    let original = $el.data("description") || $el[0].innerText || "";

    fadeSliceOriginalTexts.set(this, original);
    applyFadeSlice($el, original);
  });
}

/** ---------------------------------------
 * 🚀 리사이즈 시 재계산
 * --------------------------------------- */
function updateFadeSliceAll() {
  $(".fade-slice").each(function () {
    const original = fadeSliceOriginalTexts.get(this) || this.innerText;
    applyFadeSlice($(this), original);
  });
}

/** ---------------------------------------
 * 🔥 커스텀 훅: 페이지 전환마다 자동 실행
 * --------------------------------------- */
export default function useFadeSlice(deps = []) {
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setTimeout(() => {
        initFadeSliceAll();
        updateFadeSliceAll();
      }, 300);

    }, 100);

    $(window).on("resize", updateFadeSliceAll);

    return () => {
      clearTimeout(timer);
      $(window).off("resize", updateFadeSliceAll);
    };
  }, deps); // 🔥 deps 추가!
}
