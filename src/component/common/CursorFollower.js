import { useEffect, useState } from "react";
import { gsap } from "gsap";
import $ from "jquery";

const CursorFollower = () => {
  const [cursorClass, setCursorClass] = useState("");
  const [isCursorActive, setIsCursorActive] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    $(window).on("mousemove", (e) => {
      gsap.to(".cursor", { x: e.clientX, y: e.clientY, duration: 0.2, ease: "power2.out" });
    });

    $(document)
    .on("mouseenter", ".video-wrap, a, .cursor_detail, .cursor_video, .wm_el_list li", function () {
      //setCursorClass("hover_detail");
      if ($(this).is(".cursor_detail, .wm_el_list li, .cursor_video")) {
        
        if($(this).is(".cursor_video")){
          setCursorClass("cursor_open cursor_video");
        } else {
          setCursorClass("cursor_open");
        }
      } if($(this).hasClass('btn_close')){
        
        if($(this).is(".cursor_video")){
          setCursorClass("cursor_open cursor_txt_close cursor_video");
        } else {
          setCursorClass("cursor_open cursor_txt_close");
        }
      }/* else if ($(this).hasClass("video-wrap")) {
        setCursorClass("hover-video");
      } else {
        setCursorClass("hover-list");
      }*/
    })
    .on("mouseleave", ".video-wrap, a, .cursor_detail, .cursor_video, .wm_el_list li", function () {
      setCursorClass("");
    });

  return () => {
    $(window).off("mousemove");
    $(document).off("mouseenter mouseleave", ".video-wrap, a, .cursor_video, .cursor_detail");
  };
  }, []);

  // 터치 / 작은 화면 감지 함수
  const checkCursorActive = () => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 1024;

    return !(isTouch || isSmall);
  };

  // 활성 여부 체크 + state 업데이트
  const updateCursorMode = () => {
    setIsCursorActive(checkCursorActive());
  };

  // 활성/비활성 모드 감지 (초기 + resize)
  useEffect(() => {
    updateCursorMode();
    window.addEventListener("resize", updateCursorMode);
    return () => window.removeEventListener("resize", updateCursorMode);
  }, []);

  // 화면 밖으로 나갈 때 hidden 처리
  useEffect(() => {
    const onMouseOut = (e) => {
      const toElement = e.relatedTarget || e.toElement;
      if (!toElement) setIsHidden(true);
    };
    const onMouseOver = () => setIsHidden(false);

    window.addEventListener("mouseout", onMouseOut);
    window.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  // 마우스 움직임(커서 활성화 상태에서만 실행)
  useEffect(() => {
    if (!isCursorActive) return;

    const moveCursor = (e) => {
      gsap.to(".cursor", {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [isCursorActive]);

  // cursor 전체 className 만들기
  const cursorClasses = [
    "cursor",
    cursorClass,
    isCursorActive ? "" : "cursor_close",
    isHidden ? "hidden" : "",
  ].join(" ");

  return (
    <div className={cursorClasses}>
      <div className="cursor-inner">
        <span></span><span></span><span></span><span></span>
      </div>
      <span className="cursor-txt cursor-txt-detail">Details</span>
      <span className="cursor-txt cursor-txt-close">Close</span>

      <span className="cursor-txt cursor-txt-play">PLAY</span>
      <span className="cursor-txt cursor-txt-pause">PAUSE</span>
    </div>
  );
};

export default CursorFollower;
