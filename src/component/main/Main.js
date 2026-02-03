import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import Intro from '../intro/Intro';
import './main.scss';
import $ from 'jquery';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { Data } from '../data/Data';
import Footer from '../common/Footer';

gsap.registerPlugin(SplitText, Physics2DPlugin, ScrollTrigger);

export default function Main() {

  const videosRef = useRef([]);
  const [items, setItems] = useState([]);
  const [infos, setInfos] = useState([]);

useEffect(() => {
  Data().then(({ docs, infos }) => {
    // ✅ 리스트 데이터
    const mainItems = docs
      .filter((doc) => doc.data.home === true)
      .sort((a, b) => b.data.home_order - a.data.home_order)
      .map((doc) => ({
        id: doc.id,
        title: doc.data.title?.[0]?.text || '',
        client: doc.data.client?.[0]?.text || '',
        title_video: (doc.data.title_video || '').replace(/^http:\/\//, 'https://'),
      }));

    // ✅ 메인 비디오 데이터 (보통 1개)
    const footerInfos = infos.map((doc) => ({
      main_video_pc: doc.data.main_title_video_pc?.[0]?.text || '',
      main_video_mob: doc.data.main_title_video_mob?.url || ''
    }));

    setItems(mainItems);
    setInfos(footerInfos);
  });
}, []);


  useEffect(() => {
    setTimeout(() => {
      $('.page_main').removeClass('page_hold');
    }, 700);
    window.scrollTo(0, 0);
  }, []);
  /*
  useEffect(() => {
    setTimeout(() => {
      $('.page_main').removeClass('page_hold');
    }, 700);
    window.scrollTo(0, 0);

    const section2 = document.querySelector(".section_2");
    if (!section2) return;

    const onScroll = () => {
      if (window.scrollY > 100) {
        section2.classList.add("active");
      } else {
        section2.classList.remove("active");
      }
      if (window.scrollY > 100) {

      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // 초기 체크

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);*/

  useEffect(() => {
    const section = document.querySelector('.section_2');
    if (!section) return;
    const els = Array.from(section.querySelectorAll('.s2el'));
    const count = els.length || 1;

    const getY = () =>
      window.pageYOffset || document.documentElement.scrollTop || 0;

    let secTop = 0,
      secHeight = 1,
      view = 1;
    const recalc = () => {
      // top은 문서 기준, 높이는 offsetHeight가 안정적
      secTop = getY() + section.getBoundingClientRect().top;
      secHeight = Math.max(section.offsetHeight, 1);
      view = Math.max(secHeight - window.innerHeight, 1); // 실제 스크롤 가능한 범위
    };

    const apply = () => {
      // 0~1로 클램프 (섹션 안에서의 진행률)
      const p = Math.min(Math.max((getY() - secTop) / view, 0), 1);

      els.forEach((el, i) => {
        const threshold = (i + 1) / count; // 등분 임계치
        el.classList.toggle('active', p >= threshold);
      });
    };

    const onScroll = () => apply();
    const onResize = () => {
      recalc();
      apply();
    };

    recalc();
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // 섹션 높이 변동(이미지 로딩 등)에 대응
    const ro = new ResizeObserver(() => {
      recalc();
      apply();
    });
    ro.observe(section);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = document.querySelector('.section_2');
    const s2el = document.querySelectorAll('.s2el');

    const video = document.querySelector('.sec_1_video_w video');
    if (!section || !video) return;

    const MIN_SCALE = 0.3; // 최소 scale

    const getY = () =>
      window.pageYOffset || document.documentElement.scrollTop || 0;

    let secTop = 0,
      secHeight = 1,
      view = 1;
    const recalc = () => {
      const rect = section.getBoundingClientRect();
      secTop = getY() + rect.top;
      secHeight = Math.max(section.offsetHeight, 1);
      view = Math.max(secHeight - window.innerHeight, 1); // 실제 스크롤 가능 범위
    };

    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

    // ▼ 마지막에 한 번만 실행
    let dropFired = false;

    const splits = [];

    const triggerDropForAll = () => {
      if (dropFired) return;
      dropFired = true;

      s2el.forEach((el) => {
        const isImage =
          el.classList.contains('abs_img') || el.tagName === 'IMG';
        const target = isImage
          ? el.tagName === 'IMG'
            ? el
            : el.querySelector('img') || el
          : el;

        // ⬇️ 이미지 컨테이너(.abs_img)나 IMG 자체는 직접 낙하
        if (isImage) {
          gsap.set(target, { willChange: 'transform' });
          gsap.to(target, {
            duration: gsap.utils.random(1.5, 3),
            physics2D: {
              velocity: gsap.utils.random(500, 1000),
              angle: 90,
              gravity: 3000,
            },
            rotation: gsap.utils.random(-90, 90),
            ease: 'none',
          });
          gsap.to(target, { autoAlpha: 0, duration: 1.5, delay: 0.15 });
        } else {
          // ⬇️ 텍스트는 SplitText 후 문자 단위 낙하, 한번만 실행
          let split = splits.find((s) => s._target === el);
          if (!split) {
            split = new SplitText(el, { type: 'words', linesClass: 'line' });
            split._target = el;
            splits.push(split);
          }

          gsap.to(split.words, {
            duration: () => gsap.utils.random(2.5, 3),
            physics2D: {
              velocity: () => gsap.utils.random(500, 1000),
              angle: 90,
              gravity: 3000,
            },
            rotation: () => gsap.utils.random(-90, 90),
            ease: 'none',
            stagger: 0.2,
          });
          gsap.to(split.words, { autoAlpha: 0, duration: 1.5, delay: 0.15 });
        }
      });
    };

    // 원상 복귀 애니메이션
    const trigger = ScrollTrigger.create({
      trigger: section,
      end: () => `bottom+=${window.innerHeight / 2} top`,
      invalidateOnRefresh: true,
      onEnterBack: () => {
        dropFired = false;

        s2el.forEach((el) => {
          const isImage =
            el.classList.contains('abs_img') || el.tagName === 'IMG';
          const target = isImage
            ? el.tagName === 'IMG'
              ? el
              : el.querySelector('img') || el
            : el;

          gsap.killTweensOf(target);

          if (isImage) {
            // 낙하 위치가 너무 깊어서, 위치 조정
            gsap.set(target, {
              y: () => window.innerHeight / 2,
            });

            gsap.to(target, {
              y: 0,
              rotation: 0,
              duration: () => gsap.utils.random(0.5, 1),
              ease: 'power2.inOut',
            });
            gsap.to(target, {
              autoAlpha: 1,
              duration: 1,
              delay: 0.15,
              onComplete: () => {
                gsap.set(target, {
                  clearProps: 'transform',
                });
              },
            });
          } else {
            const split = splits.find((s) => s._target === el);
            if (!split) return;

            gsap.killTweensOf(split.words);

            // 낙하 위치가 너무 깊어서, 위치 조정
            gsap.set(split.words, {
              y: () => window.innerHeight / 2,
            });

            gsap.to(split.words, {
              y: 0,
              rotation: 0,
              duration: () => gsap.utils.random(0.5, 1),
              stagger: 0.2,
              ease: 'power2.inOut',
            });

            gsap.to(split.words, {
              autoAlpha: 1,
              duration: 1,
              delay: 0.15,
              onComplete: () => {
                section.classList.remove('sec2_end');
              },
            });
          }
        });
      },
    });

    const apply = () => {
      const scrollY = getY();
      const p = clamp01((scrollY - secTop) / view); // 0~1

      // 비디오 스케일
      const scale = 1 - (1 - MIN_SCALE) * p; // 1 → MIN_SCALE
      video.style.transformOrigin = 'center center';
      video.style.willChange = 'transform';
      video.style.transform = `scale(${scale})`;

      // 섹션 끝에 닿았는지
      const pastSection = scrollY >= secTop + secHeight - window.innerHeight;
      //const pastSection2 = scrollY >= secTop + secHeight + (window.innerHeight / 1);

      // 스크롤트리거 end 위치 맞추기 위해서 0.5 더하였음
      const pastSection2 =
        scrollY >= 0.5 + secTop + secHeight + window.innerHeight / 2;

      video.classList.toggle('hide', pastSection);

      if (pastSection) {
        //triggerDropForAll(); // ← 여기서 한 번에 실행
      }

      if (pastSection2) {
        document.querySelector('.section_2').classList.add('sec2_end');
        triggerDropForAll(); // ← 여기서 한 번에 실행
        //document.querySelector('.section_3').classList.add("show");
      } else {
        document.querySelector('.section_3').classList.remove('show');
      }
    };

    const onScroll = () => apply();
    const onResize = () => {
      recalc();
      apply();
    };

    recalc();
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => {
      recalc();
      apply();
    });
    ro.observe(section);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      trigger.kill();
      splits.forEach((s) => s.revert && s.revert());
    };
  }, []);

  useLayoutEffect(() => {
    function sec3Float() {
      $(window).on('scroll', function () {
        let st = $(window).scrollTop();
        let sec3 = $('.section_3');
        let float = sec3.find('.float-wrap');

        if (sec3.length === 0 || float.length === 0) return;

        let sec3Top = sec3.offset().top;
        let floatTop = float.position().top; // 부모(section_3) 기준 위치
        let dist = floatTop; // section_3 시작부터 float-wrap까지 거리

        //let percent = ((st - sec3Top) / dist) * 100;
        let percentSec3 = Math.max(
          0,
          Math.min(
            110,
            100 -
              (($(window).scrollTop() - $('.sec3_1_height').offset().top) /
                $('.sec3_1_height').innerHeight()) *
                100
          )
        );
        let percentSec4 = Math.max(
          0,
          Math.min(
            110,
            100 -
              (($(window).scrollTop() - $('.sec4_1_height').offset().top) /
                $('.sec4_1_height').innerHeight()) *
                100
          )
        );
        let percentSec4Txt = Math.max(0,Math.min(110,100 - (($(window).scrollTop() - $('.sec4_2_height').offset().top + $(window).innerHeight()) / $('.sec4_2_height').innerHeight()) * 100)).toFixed(2);        
        if (st >= sec3Top && st <= sec3Top + dist) {

        }
        if (percentSec3 < 10) {
          $('.section_4').addClass('show');
        } else {
          $('.section_4').removeClass('show');
        }
        /*
        if(percent.toFixed(2) >= 0 && percent.toFixed(2) < 100){
          $('.sec3_txt_w h1:nth-child(1)').css('transform', `translateX(100 - (${(percent.toFixed(4)) * -1})%)`);
          $('.sec3_txt_w h1:nth-child(2)').css('transform', `translateX(${(percent.toFixed(4)) * 1}%)`);
          //console.log(percent.toFixed(4));
        }*/
       /*
        if (window.innerWidth < 1025) {

          const $list = $('.float-wrap_list');
          const scrollTop = $(window).scrollTop();
          const start = $list.offset().top;
          const end = $list.offset().top + $list.innerHeight() - $(window).innerHeight();

          let percentMob = ((scrollTop - start) / (end - start)) * 100;
          percentMob = Math.max(0, Math.min(100, percentMob)); // 0 ~ 100 고정

          const $videos = $('.video_wrap video');
          const count = $videos.length;
          if (count > 0) {
            // 각 구간 크기
            const section = 100 / count;
            // 몇 번째 영상인지 계산
            let index = Math.floor(percentMob / section);
            if (index >= count) index = count - 1; // 100%일 때 마지막 영상
            // 클래스 토글
            $videos.removeClass('play');
            $videos.eq(index).addClass('play');
            //$videos.eq(index).currentTime = 0;
            //$videos.eq(index).play();
            $('.sec3_ul li').removeClass('play');
            $('.sec3_ul li').eq(index).addClass('play');
          }
        }*/

        if (percentSec3 >= 0 && percentSec3 < 110) {
          $('.sec3_txt_w h1:nth-child(1)').css(
            'transform',
            `translateX(-${percentSec3.toFixed(2)}%)`
          );
          $('.sec3_txt_w h1:nth-child(2)').css(
            'transform',
            `translateX(${percentSec3.toFixed(2)}%)`
          );
        }
        if (window.innerWidth > 1024) {
          if (percentSec4 >= 0 && percentSec4 < 110) {
            $('.to_right .box').css('width', `${percentSec4.toFixed(2)}%`);
            $('.to_left .box').css('width', `${percentSec4.toFixed(2)}%`);
            $('.to_top .box').css('height', `${percentSec4.toFixed(2)}%`);
            $('.to_bottom .box').css('height', `${percentSec4.toFixed(2)}%`);
          }
          if (percentSec4 >= 110) {
            $('.to_right .box').css('width', '100%');
            $('.to_left .box').css('width', '100%');
            $('.to_top .box').css('height', '100%');
            $('.to_bottom .box').css('height', '100%');
          }
        } else {
          $('.sec4_inner img').css(
            'transform',
            `scale(calc(100% + (3 * ${percentSec4.toFixed(4)}%)))`
          );
        }

        if (percentSec4Txt < 101) {
          $('.sec_4_txt_w').addClass('show');
          $('.sec_4_txt_w').css('backdrop-filter', `blur(calc(20px - (20px * (${percentSec4Txt} * 0.01))))`);
          //backdrop-filter: blur(20px);
          $('.s4t_1').css('transform', `translateY(calc((-200% - 24px) * (${percentSec4Txt} * 0.01)))`);
          $('.s4t_2_w').css('transform', `translateY(calc(50% * (${percentSec4Txt} * 0.01)))`);
          //translateY(calc(-100% * (-00 * 0.01)))
          //$('.s4t_1').css('transform', `translateY(${(percent.toFixed(4)) * -1}%)`);
          //translateY(calc((-200% - 24px) * (00 * 0.01)))
        } else {
          $('.sec_4_txt_w').removeClass('show');
        }

        if ($(window).scrollTop() >= $('.sec4_2_height').offset().top + $('.sec4_2_height').innerHeight() - $(window).innerHeight()) {
          $('.sec_4_txt_w').addClass('show_t1');
        } else {
          $('.sec_4_txt_w').removeClass('show_t1');
        }

        if ($(window).scrollTop() >= $('.sec4_2_height').offset().top + $('.sec4_2_height').innerHeight() - $(window).innerHeight() * 0.8 ) {
          $('.sec_4_txt_w').addClass('show_t2');
        } else {
          $('.sec_4_txt_w').removeClass('show_t2');
        }

        if ($(window).scrollTop() >= $('.sec4_2_end').offset().top) {
          $('.section_4').addClass('hit-bottom');
          $('.section_1').addClass('hide');

          //$('.page_main section').addClass('no-pointer');
        } else {
          $('.section_4').removeClass('hit-bottom');
          $('.section_1').removeClass('hide');
          //$('.page_main section').removeClass('no-pointer');
        }

        //$('.sec4_2_height')
        //console.log(percentSec4Txt);
        //if($('.sec4_2_height'))
        if ($(window).scrollTop() >= $('.end_section').offset().top) {
          $('.page_main section').addClass('no-pointer');
        } else {
          $('.page_main section').removeClass('no-pointer');
        }
      });
    }

    window.addEventListener('scroll', sec3Float());
    window.addEventListener('resize', sec3Float());
  }, []);

  useEffect(() => {
    if ($('.float-wrap').length) {
      function floating() {
        if (window.innerWidth > 100) {
          $('.float-wrap').each(function () {
            const $wrap = $(this);
            const $el = $wrap.find('.float-el');
            const scrollTop = $(document).scrollTop();
            const wrapOffsetTop = $wrap.offset().top;
            const wrapHeight = $wrap.innerHeight();
            //const elHeight = $el.innerHeight();
            const floatBottom = wrapOffsetTop + wrapHeight - $(window).height();

            if (scrollTop >= wrapOffsetTop) {
              $el.addClass('floating');
            } else {
              $el.removeClass('floating');
            }

            if (scrollTop > floatBottom) {
              $el.addClass('float-bottom');
            } else {
              $el.removeClass('float-bottom');
            }
          });
        }
      }

      floating();
      $(document).scroll(function () {
        floating();
      });
      $(window).resize(function () {
        floating();
      });
    }

    
  }, []);

  const handleEnter = (index) => {
    const video = videosRef.current[index];
    if (video) {
      video.classList.add('play');
      video.currentTime = 0;
      video.play();
    }

    const li = document.querySelectorAll('.sec3_ul li')[index];
    if (!li) return;

    const h4 = li.querySelector('h4');
    const span = li.querySelector('span');

    const winW = window.innerWidth;

    const h4Move = -(h4.offsetWidth - winW / 2) - 76;
    const spanMove = (span.offsetWidth - winW / 2) + 76;

    // transform 적용
    h4.style.transform = `translateX(${h4Move}px)`;
    span.style.transform = `translateX(${spanMove}px)`;

  };

  const handleLeave = (index) => {
    const video = videosRef.current[index];
    if (video) {
      video.classList.remove('play');
      //video.pause();
      //video.currentTime = 0; // 필요 없으면 지워도 됨
    }
    const li = document.querySelectorAll('.sec3_ul li')[index];
    if (!li) return;

    li.querySelector('h4').style.transform = 'translateX(0)';
    li.querySelector('span').style.transform = 'translateX(0)';

  };

  useEffect(() => {
    const stopPlayingOnScroll = () => {
      if (window.innerWidth > 1024) return;

      // video_wrap 안의 play 클래스 가진 모든 video 중지
      const videos = document.querySelectorAll('.video_wrap video.play');
      videos.forEach((v) => {
        v.pause();
        v.classList.remove('play');
      });
    };

    window.addEventListener('scroll', stopPlayingOnScroll);

    return () => {
      window.removeEventListener('scroll', stopPlayingOnScroll);
    };
  }, []);

  function setInitialTranslate() {
    const items = document.querySelectorAll('.sec3_ul li');

    items.forEach((li) => {
      const h4 = li.querySelector('h4');
      const span = li.querySelector('span');
      if (!h4 || !span) return;

      const winW = window.innerWidth;

      const h4Move = -(h4.offsetWidth - winW / 2) - 76;
      const spanMove = (span.offsetWidth - winW / 2) + 76;

      h4.style.transform = `translateX(${h4Move}px)`;
      span.style.transform = `translateX(${spanMove}px)`;
    });
  }
  function resetTranslateOnActiveOnce() {
  const target = document.querySelector('.sec3_ul.ani');
  if (!target) return;

  const observer = new MutationObserver(() => {
    if (target.classList.contains('active')) {
      target.querySelectorAll('li').forEach((li) => {
        const h4 = li.querySelector('h4');
        const span = li.querySelector('span');
        if (!h4 || !span) return;

        h4.style.transform = 'translateX(0)';
        span.style.transform = 'translateX(0)';
      });

      observer.disconnect(); // ✅ 딱 1번만 실행하고 종료
    }
  });

  observer.observe(target, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

  useLayoutEffect(() => {
  if (!items.length) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setInitialTranslate();        // ✅ 처음엔 바깥으로 밀고
      resetTranslateOnActiveOnce(); // ✅ active 붙으면 0으로 복귀
    });
  });
}, [items]);






  const scrollAnimation = () => {
    $('.ani, .ani2').each(function () {
      const aniPoint = $(this).offset().top + $(window).height() / 4;
      const windowBottom = $(window).scrollTop() + $(window).height();
      if (windowBottom > aniPoint) {
        if (!$(this).hasClass('active')) {
          $(this).addClass('active');
        }
      }
    });
  };
  /*useLayoutEffect(() => {
    const videoTest = document.querySelector('.testVideo');
    if (videoTest) {
      videoTest.muted = true;
      videoTest.play().catch((err) => {
        alert('video autoplay error: ' + err.message);
      });
    }
  }, []);*/
  useEffect(() => {
    window.addEventListener('scroll', scrollAnimation);

    return () => {
      window.removeEventListener('scroll', scrollAnimation);
    };
  }, []);

  useEffect(() => {
    const section1 = document.querySelector('.section_1');
    const section = document.querySelector('.section_2');
    //const section3 = document.querySelector('.section_space');
    if (!section) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      // 중간부터 맨아래까지 구간
      const start = sectionTop + sectionHeight / 2;
      const end = sectionTop + sectionHeight;

      let progress = (scrollTop - start) / (end - start);
      progress = Math.min(Math.max(progress, 0), 1);

      section1.style.backgroundColor = `rgba(0, 0, 0, ${progress})`;
      //section3.style.backgroundColor = `rgba(0, 0, 0, ${progress})`;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isPc, setIsPc] = useState(window.innerWidth > 1024);

  useEffect(() => {
  const onResize = () => {
    setIsPc(window.innerWidth > 1024);
  };

  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);

  return (
    <div className="page_main page_wrap">
      <Intro />

      <section className="section_1">
        <div className="sec_1_video_w">
          <video
            className="testVideo intro_out pc"
            playsInline
            autoPlay
            muted
            /*loading="lazy"*/
            preload="auto"
            loop
            onCanPlay={(e) => {
              // 모바일에서 Safari가 막을 때 예외 처리
              e.currentTarget.play().catch(() => {});
            }}

            /*src="https://studiodof1.cafe24.com/studiodof1_9a51d1bccd25e686686d8172de179de2_HD.mp4"*/
            src={isPc ? infos?.[0]?.main_video_pc : infos?.[0]?.main_video_mob}

          ></video>

          
          {/*<video playsInline autoPlay muted loading="lazy" loop src="https://studiodof.mycafe24.com/assets/main_video_1.mp4"></video>*/}
        </div>
      </section>
      <section className="section_2">
        <div className="sec2_inner">
          <div className="flex">
            <h2 className="bold s2el">
              <span>FROM VISION.</span>
            </h2>
            <h2 className="bold s2el">
              <span>TO SCREEN</span>
            </h2>
          </div>

          <div className="flex">
            <h2 className="s2el">
              <span>somewhere</span>
            </h2>
            <h2 className="s2el abs">
              <span>between the</span>
            </h2>
            <h2 className="s2el">
              <span>Idea</span>
            </h2>
          </div>

          <div className="flex">
            <h2 className="s2el">
              <span>and the</span>
            </h2>
            <h2 className="s2el abs">
              <span>final</span>
            </h2>
            <h2 className="s2el">
              <span>frame</span>
            </h2>
          </div>

          <div className="flex flex_end">
            <h2 className="s2el blur">
              <span>that&rsquo;s us</span>
            </h2>

          </div>

          <div className="flex">
            <h2 className="s2el num num_1">
              <span className="point_font">Production</span>
            </h2>
            <h2 className="s2el abs num num_2">
              <span className="point_font">Vfx</span>
            </h2>
            <h2 className="s2el abs">
              <span>and</span>
            </h2>
          </div>

          <div className="flex">
            <h2 className="s2el num num_3">
              <span className="point_font">Design</span>
            </h2>
            <h2 className="s2el s2el_left blur">
              <span>done properly!</span>
            </h2>

            <div className="s2el abs_img">
              <img src="/assets/img/sec_2_img.png" alt="" />
            </div>
          </div>
        </div>
      </section>
      <section className="section_space"></section>
      <section className="section_3">
        <div className="sec3_1_space"></div>
        <div className="sec3_1_height"></div>
        <div className="float-wrap float-wrap_bg">
          <div className="sec3_bg float-el">
            <img src="/assets/img/noise.gif" alt="" />
          </div>
        </div>
        <div className="float-wrap float-wrap_head">
          <div className="sec3_inner float-el">
            <div className="sec3_txt_w">
              <h1>a few things</h1>
              <h1>we&rsquo;ve worked on</h1>
            </div>
          </div>
        </div>
        <div className="float-wrap float-wrap_list">
          <div className="video_wrap">
            {items.map((item, i) => (
              <video
                key={item.id}
                ref={(el) => (videosRef.current[i] = el)}
                muted
                playsInline
                loop
                loading="lazy"
                src={item.title_video}
                //title={`dof`}
              ></video>
            ))}
          </div>
          <div className="float-el">
            <ul className="sec3_ul ani">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <div>
                    <h4>{item.client}</h4>
                    <span>{item.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="section_4">
        <div className="sec4_1_space"></div>
        <div className="sec4_inner">
          <img src="/assets/img/sec4_img.jpg" alt='' />
          <div className="sec4_grid">
            <div className="to_right">
              <div className="box"></div>
            </div>
            <div className="to_top">
              <div className="box"></div>
            </div>
            <div className="to_bottom">
              <div className="box"></div>
            </div>
            <div className="to_left">
              <div className="box"></div>
            </div>
          </div>
        </div>
        <div className="sec_4_txt_w">
          <div className="sec_4_txt_inner">
            <h1 className="s4t_1">we</h1>
            <div className="s4t_2_w">
              <h1>build stories.</h1>
              <h1>
                bring ideas to <br className="mob_only" />
                screen.
              </h1>
              <h1>
                make things <br className="mob_only" />
                move.
              </h1>
            </div>
          </div>
          <span className="s4t_3">
            We like ideas that move.
            <br />
            And we make sure they land.
          </span>
          <h1 className="s4t_4">dope.</h1>
        </div>
        <div className="sec4_1_height"></div>
        <div className="sec4_2_space"></div>
        <div className="sec4_2_height"></div>
        <div className="sec4_2_space"></div>
        <div className="sec4_3_space sec4_2_end"></div>
      </section>
      <section className="end_section"></section>
      <Footer />
    </div>
  );
}
