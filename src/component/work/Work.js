import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { PrismicRichText } from '@prismicio/react';
import './work.scss';
import CursorFollower from '../common/CursorFollower';
import $ from 'jquery';
import gsap, { snap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Data } from '../data/Data';

gsap.registerPlugin(Draggable); 
function Work() {
  const [items, setItems] = useState([]);
  const [listItems, setListItems] = useState([]); // work_list용
  const [hoverImg, setHoverImg] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const videoRefs = useRef([]);

  

  const handlePlayToggle = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    const btn = document.querySelectorAll(".wm_btn_play")[index];
    const isMobile = window.innerWidth <= 1024;

    if (!isMobile) return; // PC에서는 기존 자동재생 유지

    if (video.paused) {
      video.play();
      btn.textContent = "Pause";       // 버튼 텍스트 변경
    } else {
      video.pause();
      btn.textContent = "Play !";
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 1024;
      const videos = videoRefs.current;
      const buttons = document.querySelectorAll(".wm_btn_play");

      videos.forEach((video, i) => {
        if (!video) return;

        if (isMobile) {
          video.pause();
          if (buttons[i]) buttons[i].textContent = "Play !";
        } else {
          video.play();
          if (buttons[i]) buttons[i].textContent = "Pause";
        }
      });
    };

    // 초기 1회 실행
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  

  useEffect(() => {
    Data().then(({docs}) => {
      const workMainItems = docs
        .filter((doc) => doc.data.work_main === true)
        .sort((a, b) => b.data.work_main_order - a.data.work_main_order)
        .map((doc) => ({
          id: doc.id,
          title: doc.data.title?.[0]?.text || '',
          client: doc.data.client?.[0]?.text || '',
          title_video: doc.data.title_video || '',
          credit: doc.data.credit || [],
          title_img: doc.data.title_img?.url || '',
        }));
      setItems(workMainItems);

      const workListItems = docs
        .filter(
          (doc) => doc.data.work_main !== true // ✅ work_main true 제외
        )
        .sort((a, b) => b.data.work_list_order - a.data.work_list_order)
        .map((doc) => ({
          id: doc.id,
          title: doc.data.title?.[0]?.text || '',
          client: doc.data.client?.[0]?.text || '',
          title_img: doc.data.title_img?.url || '',
          // ✅ media 정규화: [{type:'image', src, alt}] 또는 [{type:'video', src}]
          media: (doc.data.media || [])
            .map((m) => {
              const imgUrl = m.portfolio_img?.url;
              const vidUrl = m.portfolio_video;
              if (imgUrl)
                return {
                  type: 'image',
                  src: imgUrl,
                  alt: m.portfolio_img?.alt || '',
                };
              if (vidUrl) return { type: 'video', src: vidUrl };
              return null;
            })
            .filter(Boolean),
          credit: doc.data.credit || [],
        }));
      setListItems(workListItems);
    });
  }, []);

  useLayoutEffect(() => {
    // 버튼 클릭 이벤트
    const clickHandler = function () {
      $(this).siblings('article').toggleClass('show');
      $(this)
        .siblings('article')
        .css(
          'height',
          `${$(this).siblings('article').find('div').innerHeight()}px`
        );

      if ($(this).hasClass('btn_close')) {
        $(this).removeClass('btn_close');
        $('.cursor').removeClass('cursor_txt_close');
      } else {
        $(this).addClass('btn_close');
        $('.cursor').addClass('cursor_txt_close');
      }

    };

    $(document).on('click', '.wm_btn, .btn_de_credit', clickHandler);

    return () => {
      $(document).off('click', '.wm_btn, .btn_de_credit', clickHandler);
    };
  }, []);




  
useLayoutEffect(() => {
  if (items.length === 0) return;

  const container = document.querySelector('.wm_wrap');
  const slides = document.querySelectorAll('.wm_el');
  const page = document.querySelector('.page_work');

  if (!container || slides.length === 0 || !page) return; // 안전빵 (원래 동작엔 영향 없음)

  let slideHeight = window.innerHeight;
  let resizeId;

  // 스크롤 애니메이션 관련 변수
  let current = 0;
  let target = 0;
  let isThrottled = false;

  // 자석 스크롤 속도 변수들 (숫자 크기가 커질수록 속도가 빨라집니다)
  const scrollSpeed = 0.08;
  const snapSpeed = 0.1;

  function updateHeight() {
    cancelAnimationFrame(resizeId);
    resizeId = requestAnimationFrame(() => {
      slideHeight = window.innerHeight;
      $('.section_1').css('height', `${slideHeight * slides.length}px`);
      gsap.set(container, { y: -current * slideHeight });
    });
  }

  $('.section_1').css('height', `${slideHeight * slides.length}px`);

  // 선형 보간 함수
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ✅ wheel 이벤트
  const isMac = navigator.platform.toUpperCase().includes('MAC');

  const onWheel = (e) => {
    // 🔥🔥 여기만 새로 추가된 로직
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileWidth = window.innerWidth <= 1024;

    // 📌 모바일 / 1024이하 / .page_work에 scrolling_page 있으면 커스텀 스크롤 안 타게
    if (
      isTouchDevice ||
      isMobileWidth ||
      page.classList.contains('scrolling_page')
    ) {
      return;
    }

    if (document.querySelector('.wm_detail_w.show')) return;
    if (isThrottled) return;

    const multiplier = isMac ? 0.0015 : 0.0025;

    target += e.deltaY * multiplier;
    target = Math.max(0, Math.min(slides.length - 1, target));

    isThrottled = true;
    setTimeout(() => {
      isThrottled = false;
    }, 15);
  };

  // 슬라이드 자석 효과
  const animateWheel = () => {
    const nearest = Math.round(target);
    const dist = nearest - target;

    if (Math.abs(dist) < 0.5) {
      target = lerp(target, nearest, snapSpeed);
    }

    current = lerp(current, target, scrollSpeed);
    container.style.transform = `translateY(${-current * slideHeight}px)`;

    requestAnimationFrame(animateWheel);
  };

  window.addEventListener('wheel', onWheel, { passive: true });
  animateWheel();
  $(window).on('resize', updateHeight);

  return () => {
    $(window).off('resize', updateHeight);
    window.removeEventListener('wheel', onWheel);
  };
}, [items]);

  
 

  useLayoutEffect(() => {
    // 1. 기존 oncontextmenu 제거
    document.oncontextmenu = null;

    // 2. jQuery 바인딩 제거
    if (typeof $ !== 'undefined') {
      $(document).off('contextmenu');
    }

    // 3. addEventListener로 걸린 모든 contextmenu 막기 무력화
    const forceAllow = (e) => {
      // 막아둔 preventDefault가 있어도 다시 기본 동작 실행시킴
      e.stopPropagation();
    };
    window.addEventListener('contextmenu', forceAllow, true);

    return () => {
      window.removeEventListener('contextmenu', forceAllow, true);
    };
  }, []);

  useEffect(() => {
    $('.wm_el_list li').click(function () {
      $('.wm_detail_w').addClass('show');
      $('.btn_de_credit').removeClass('btn_close');
      $('.de_credit article').removeClass('show');
    });
    $('.list_detail_close').click(function () {
      $('.wm_detail_w').removeClass('show');
      $('.btn_de_credit').removeClass('btn_close');
      $('.de_credit article').removeClass('show');
    });
  }, [listItems]); // ✅ listItems가 바뀐 후 바인딩

  useEffect(() => {
    // 터치 디바이스면 실행하지 않음
    if ('ontouchstart' in window) return;
    if (document.querySelector('.page_work').classList.contains("scrolling_page")) return;
 
    if (!selectedItem) return;
    const el = document.querySelector('.de_img_scroll');
    if (!el) return;

    let current = el.scrollLeft;
    let target = el.scrollLeft;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        e.stopPropagation();

        const maxScroll = el.scrollWidth - el.clientWidth;
        target = Math.min(Math.max(0, target + e.deltaY), maxScroll); // ✅ 바운더리 보정
      }
    };

    const animate = () => {
      current += (target - current) * 0.1;
      el.scrollLeft = current;
      requestAnimationFrame(animate);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    animate();

    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [selectedItem]);

  
  /*
  useEffect(() => {
    let rafId;

    const updateProgress = () => {
      const videos = document.querySelectorAll('.de_video_w video');
      videos.forEach((video) => {
        if (!video.paused && video.duration > 0) {
          const progressEl = video
            .closest('.de_video_w')
            .querySelector('.progress-fill');
          const percent = (video.currentTime / video.duration) * 100;
          progressEl.style.width = `${percent}%`;
        }
      });
      rafId = requestAnimationFrame(updateProgress);
    };

    rafId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(rafId);
  }, [selectedItem]); // ✅ 디테일 열릴 때만 실행*/

  useEffect(() => {
  let rafId;

  const updateProgress = () => {
    const videos = document.querySelectorAll(
      '.de_video_w video, .wm_video_w video'
    );

    videos.forEach((video) => {
      if (!video.duration) return;

      const wrap =
        video.closest('.de_video_w') || video.closest('.wm_video_w');
      const fill = wrap?.querySelector('.progress-fill');
      if (!fill) return;

      const percent = (video.currentTime / video.duration) * 100;
      fill.style.width = percent + '%';
    });

    rafId = requestAnimationFrame(updateProgress);
  };

  rafId = requestAnimationFrame(updateProgress);
  return () => cancelAnimationFrame(rafId);
}, [selectedItem]);


  useEffect(() => {
    const page = document.querySelector('.page_work');
    if (!page) return;

    const applyScrollMode = () => {
      if (window.innerWidth <= 1024) {
        page.classList.add('scrolling_page');
      } else {
        page.classList.remove('scrolling_page');
      }
    };

    // 초기 실행
    applyScrollMode();

    // 리사이즈 반응
    window.addEventListener('resize', applyScrollMode);

    return () => {
      window.removeEventListener('resize', applyScrollMode);
    };
  }, []);



  const pauseAllDetailVideos = () => {
  document.querySelectorAll('.de_video_w video').forEach((v) => {
    v.pause();
    v.currentTime = 0;
    v.classList.remove('btn_close');

    const btn = v.parentElement.querySelector('.mob_play_btn');
    if (btn) btn.classList.remove('active');
  });
};


    return (
    <div className="page_work">
      <CursorFollower />
      <a className="logo_home" href='/'><img src="/assets/img/logo_main.png" alt="dof"/></a>
      <div className="slide_container">
        <section className="section_1">
          <div className="wm_wrap">
            {items.map((item, i) => (
              <div className="wm_el" key={item.id || i}>


                {/*<div className="wm_video_w">
                  <video
                    ref={(el) => (videoRefs.current[i] = el)}
                    playsInline
                    autoPlay={window.innerWidth > 1024}
                    muted
                    loading="lazy"
                    loop
                    preload="metadata"
                    src={item.title_video}
                  />
                  <img src={item.title_img}/>
                </div>*/}
                <div className="wm_video_w cursor_video">
                  <video
                    ref={(el) => (videoRefs.current[i] = el)}
                    playsInline
                    autoPlay={window.innerWidth > 1024}
                    muted
                    loop
                    preload="metadata"
                    src={item.title_video}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      const video = e.currentTarget;
                      const wrap = video.closest('.wm_video_w');
                      const cursor = document.querySelector('.cursor');

                      if (video.paused) {
                        video.play();
                        video.classList.add('cursor_txt_close');
                        wrap?.classList.add('btn_close');
                        cursor?.classList.add('cursor_txt_close');
                      } else {
                        video.pause();
                        video.classList.remove('cursor_txt_close');
                        wrap?.classList.remove('btn_close');
                        cursor?.classList.remove('cursor_txt_close');
                      }
                      
                    }}
                  />

                  <img src={item.title_img} />

                  {/* ✅ progress bar 추가 */}
                  <div
                    className="progress-bar"
                    onPointerDown={(e) => {
                      const bar = e.currentTarget;
                      const video = bar.closest(".wm_video_w").querySelector("video");
                      const fill = bar.querySelector(".progress-fill");
                      const rect = bar.getBoundingClientRect();

                      const update = (x) => {
                        const px = Math.max(rect.left, Math.min(x, rect.right));
                        const percent = (px - rect.left) / rect.width;
                        video.currentTime = video.duration * percent;
                        fill.style.width = percent * 100 + "%";
                      };

                      update(e.clientX);

                      const move = (ev) => update(ev.clientX);
                      const up = () => {
                        window.removeEventListener("pointermove", move);
                        window.removeEventListener("pointerup", up);
                      };

                      window.addEventListener("pointermove", move);
                      window.addEventListener("pointerup", up);
                    }}
                  >
                    <div className="progress-fill" />
                  </div>
                </div>


                <h1 className="name_1">{item.title}</h1>
                <h1 className="name_2">{item.client}</h1>

                <div className="wm_btn cursor_detail toggle_close">
                  (Credit)
                </div>

                {/* 재생 버튼 */}
                <div
                  className="wm_btn_play"
                  onClick={() => handlePlayToggle(i)}
                >
                  Play !
                </div>

                <article>
                  <div data-lenis-prevent>
                    <PrismicRichText field={item.credit} />
                  </div>
                </article>

              </div>
            ))}


            {listItems.map((item, i) => (
              <div className="wm_el_mob mob_only" key={item.id || i}>
                <div className="wm_img_w">
                  <img src={item.title_img}/>
                </div>
                <h1 className="name_1">{item.title}</h1>
                <h1 className="name_2">{item.client}</h1>
                <div className="wm_btn cursor_detail toggle_close">
                  (Credit)
                </div>
                
                <div
                  className="wm_btn_detail"
                  onClick={() => {
                    setSelectedItem(item);
                    document.querySelector('.wm_detail_w')?.classList.add('show');
                    const el = document.querySelector('.de_img_scroll');
                    if (el) el.scrollLeft = 0;
                  }}
                >
                  Details →
                </div>
                <article>
                  <div data-lenis-prevent>
                    <PrismicRichText field={item.credit} />
                  </div>
                </article>
              </div>
            ))}

            <div className="wm_el wm_el_list">
              <div className="wm_list_hover_img_w">
                <img className={hoverImg ? "" : "hide"} src={hoverImg} alt="" />
              </div>
              <ul className="scrollable">
                {listItems.map((item) => (
                  <li
                    key={item.id}
                    onMouseEnter={() => setHoverImg(item.title_img)}
                    onClick={() => {
                      setSelectedItem(item);
                      const el = document.querySelector('.de_img_scroll');
                      if (el) el.scrollLeft = 0; // 맨 처음으로 이동
                    }}
                  >
                    <span>{item.title}</span>
                    <span>{item.client}</span>
                  </li>
                ))}
              </ul>
              <div className={`wm_detail_w ${selectedItem ? 'show' : ''}`}>
                <div className="list_detail_close btn_close cursor_detail" onClick={pauseAllDetailVideos}>
                  <span>Close</span>
                  <div className="xbox"></div>
                </div>

                <div className='sp_scroll_w scrollable'>
                {selectedItem && (
                  <>
                    <div className="de_img_w">
                      <div
                        className="de_img_scroll scrollable"
                        data-lenis-prevent
                      >
                        {selectedItem.media.length === 0 && (
                          <img src="/assets/img/placeholder.jpg" alt="" />
                        )}

                        {selectedItem.media.map((m, i) =>
                          m.type === 'image' ? (
                            <img
                              key={i}
                              src={m.src}
                              alt={m.alt}
                              loading="lazy"
                            />
                          ) : (
                            <div className="de_video_w" key={i}>
                              <video
                                className="cursor_video"
                                playsInline                                
                                controls={false}
                              
                                src={m.src}
                                ref={(el) => {
                                  if (!el) return;

                                  // ✅ 중복 등록 방지
                                  if (el.__syncBound__) return;
                                  el.__syncBound__ = true;

                                  const syncWidth = () => {
                                    const wrap = el.closest('.de_video_w');
                                    if (!wrap) return;

                                    const w = el.getBoundingClientRect().width;
                                    if (w > 0) wrap.style.width = w + 'px';
                                  };

                                  el.addEventListener('loadedmetadata', syncWidth);
                                  el.addEventListener('loadeddata', syncWidth);
                                  window.addEventListener('resize', syncWidth);

                                  // ✅ 최초 1회 강제 실행 (Safari에서 중요)
                                  requestAnimationFrame(syncWidth);
                                }}


                                onPointerUp={(e) => {
                                  e.stopPropagation();
                                  const video = e.currentTarget;
                                  const cursorVideo =
                                    document.querySelector('.cursor_video');

                                  if (video.paused) {
                                    video.play();
                                    video.classList.add('btn_close');
                                    cursorVideo.classList.add('cursor_txt_close');
                                    video.parentElement.querySelector('.mob_play_btn').classList.add('active');
                                  } else {
                                    video.pause();
                                    video.classList.remove('btn_close');
                                    cursorVideo.classList.remove('cursor_txt_close');
                                    video.parentElement.querySelector('.mob_play_btn').classList.remove('active');
                                  }
                                }}
                              />
                              <div className='mob_play_btn'>
                                <img className='btn_play' src="/assets/img/mob_play_btn.png"></img>
                                <img className='btn_pause' src="/assets/img/mob_pause_btn.png"></img>
                              </div>
                              {/*<div
                                className="progress-bar"
                                onMouseDown={(e) => {
                                  const bar = e.currentTarget;
                                  const video = bar
                                    .closest('.de_video_w')
                                    .querySelector('video');
                                  const progressEl =
                                    bar.querySelector('.progress-fill');
                                  const rect = bar.getBoundingClientRect();

                                  // 진행률 업데이트 함수
                                  const updateProgress = (clientX) => {
                                    const x = Math.max(
                                      rect.left,
                                      Math.min(clientX, rect.right)
                                    );
                                    const percent =
                                      (x - rect.left) / rect.width;
                                    video.currentTime =
                                      video.duration * percent;
                                    progressEl.style.width = `${
                                      percent * 100
                                    }%`; // ✅ 드래그 시 즉시 반영
                                  };

                                  // 처음 클릭 위치 반영
                                  updateProgress(e.clientX);

                                  // 드래그 이벤트 등록
                                  const onMove = (ev) =>
                                    updateProgress(ev.clientX);
                                  const onUp = () => {
                                    window.removeEventListener(
                                      'mousemove',
                                      onMove
                                    );
                                    window.removeEventListener('mouseup', onUp);
                                  };

                                  window.addEventListener('mousemove', onMove);
                                  window.addEventListener('mouseup', onUp);
                                }}
                                onTouchStart={(e) => {
                                  const bar = e.currentTarget;
                                  const video = bar
                                    .closest('.de_video_w')
                                    .querySelector('video');
                                  const progressEl =
                                    bar.querySelector('.progress-fill');
                                  const rect = bar.getBoundingClientRect();

                                  const updateProgress = (touchX) => {
                                    const x = Math.max(
                                      rect.left,
                                      Math.min(touchX, rect.right)
                                    );
                                    const percent =
                                      (x - rect.left) / rect.width;
                                    video.currentTime =
                                      video.duration * percent;
                                    progressEl.style.width = `${
                                      percent * 100
                                    }%`; // ✅ 드래그 시 즉시 반영
                                  };

                                  updateProgress(e.touches[0].clientX);

                                  const onMove = (ev) =>
                                    updateProgress(ev.touches[0].clientX);
                                  const onEnd = () => {
                                    window.removeEventListener(
                                      'touchmove',
                                      onMove
                                    );
                                    window.removeEventListener(
                                      'touchend',
                                      onEnd
                                    );
                                  };

                                  window.addEventListener('touchmove', onMove);
                                  window.addEventListener('touchend', onEnd);
                                }}
                              >
                                <div className="progress-fill"></div>
                              </div>*/}
                              <div
                                className="progress-bar"
                                onPointerDown={(e) => {
                                  const bar = e.currentTarget;
                                  const video = bar.closest(".de_video_w").querySelector("video");
                                  const progressEl = bar.querySelector(".progress-fill");
                                  const rect = bar.getBoundingClientRect();

                                  // 진행률 업데이트
                                  const updateProgress = (clientX) => {
                                    const x = Math.max(rect.left, Math.min(clientX, rect.right));
                                    const percent = (x - rect.left) / rect.width;
                                    video.currentTime = video.duration * percent;
                                    progressEl.style.width = percent * 100 + "%";
                                  };

                                  // 최초 클릭 or 터치 바로 반영
                                  updateProgress(e.clientX);

                                  // 드래그 이동
                                  const onMove = (ev) => updateProgress(ev.clientX);

                                  // 드래그 종료
                                  const onUp = () => {
                                    window.removeEventListener("pointermove", onMove);
                                    window.removeEventListener("pointerup", onUp);
                                  };

                                  // 등록
                                  window.addEventListener("pointermove", onMove);
                                  window.addEventListener("pointerup", onUp);
                                }}
                              >
                                <div className="progress-fill"></div>
                              </div>

                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="info_w">
                      <h1 className="de_title">{selectedItem.title}</h1>
                      <h1 className="de_client">{selectedItem.client}</h1>
                      <div className="de_credit">
                        <span className="btn_de_credit cursor_detail toggle_close">
                          (Credit)
                        </span>
                        <article>
                          <div data-lenis-prevent>
                            <PrismicRichText field={selectedItem.credit} />
                          </div>
                        </article>
                      </div>
                    </div>
                  </>
                )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <section className="section_2"></section>
    </div>
  );
}

export default Work;
