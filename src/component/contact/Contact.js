import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import './contact.scss';
import CursorFollower from '../common/CursorFollower';
import $ from 'jquery';
import gsap, { snap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Data } from '../data/Data';

gsap.registerPlugin(ScrollTrigger);

  

function Contact() {

  const [items, setItems] = useState([]);
  useLayoutEffect(() => {
  Data().then(({ contact }) => {
    const contactInfos = contact.map((doc) => {

      const members = doc.data.member || [];

      members.sort((a, b) => {
        const ao = a.order ?? 9999;
        const bo = b.order ?? 9999;
        return ao - bo;
      });

      return {
        member: members, 
      };
    });

    setItems(contactInfos);
  });
}, []);

/*


  useLayoutEffect(() => {
    
  }, []);*/
  /*
useLayoutEffect(() => {
  if (window.globalLenis) {
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        return arguments.length
          ? window.globalLenis.scrollTo(value, { immediate: true })
          : window.scrollY;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });
    window.globalLenis.on("scroll", ScrollTrigger.update);
  }

  gsap.set(".scroll_el", { yPercent: 100 });
  gsap.set(".contact_bg", { yPercent: 60 });

  // ✅ 반응형 정의 (ScrollTrigger.matchMedia)
  const mm = ScrollTrigger.matchMedia({
    "(min-width: 1025px)": () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".detect_w",
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // 🔥 scrub 숫자로 주면 훨씬 부드럽게 (지연 시간)
          invalidateOnRefresh: true,
        },
      });

      tl.to(".scroll_el", {
        yPercent: 0,
        ease: "none",
        stagger: { each: 0.1 },
      });
    },

    "(max-width: 1024px)": () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".detect_w",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const mobileOrder = [
        ".contact_title .scroll_el",
        ".ul_1 .scroll_el",
        ".ul_2 .scroll_el",
      ];

      mobileOrder.forEach((sel, i) => {
        tl.to(sel, {
          yPercent: 0,
          ease: "none",
          stagger: { each: 0.1 },
        }, i * 0.2);
      });
    },
  });

  // ✅ contact_bg는 공통 (scrub: 1 → 부드럽게)
  gsap.fromTo(
    ".contact_bg",
    { yPercent: 60 },
    {
      yPercent: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".detect_w",
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    }
  );

  // ✅ 강제 refresh 최소화 (렌더 이후 1회만)
  let refreshed = false;
  const safeRefresh = () => {
    if (!refreshed) {
      ScrollTrigger.refresh();
      refreshed = true;
    }
  };
  setTimeout(safeRefresh, 200);

  // ✅ cleanup
  return () => {
    mm.revert();
    ScrollTrigger.getAll().forEach(st => st.kill());
  };
}, []);
*/

useLayoutEffect(() => {
  if (items.length === 0) return; 
  // ✅ Lenis 스크롤 관련 설정 유지 (혹시 다른 곳에서 사용 중이면)
  if (window.globalLenis) {
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        return arguments.length
          ? window.globalLenis.scrollTo(value, { immediate: true })
          : window.scrollY;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });
    window.globalLenis.on("scroll", ScrollTrigger.update);
  }

  // ✅ 초기 상태
  gsap.set(".scroll_el", { yPercent: 100, opacity: 0 });
  gsap.set(".contact_bg", { yPercent: 60, opacity: 0 });

  // ✅ 배경 먼저 올라오기
  const tl = gsap.timeline({ delay: 0.2 });

  tl.to(".contact_bg", {
    yPercent: 0,
    opacity: 1,
    ease: "power3.out",
    duration: 1.5,
  });

  const memberCount = items[0]?.member?.length || 0;

  const ulSelectors = Array.from({ length: memberCount }).map(
    (_, idx) => `.ul_${idx + 1} .scroll_el`
  );

  const isMobile = window.innerWidth <= 1024;
  const targets = isMobile
    ? [".contact_title .scroll_el", ...ulSelectors]
    : [".contact_title .scroll_el", ...ulSelectors];
    /*? [
        ".contact_title .scroll_el",
        ".ul_1 .scroll_el",
        ".ul_2 .scroll_el",
      ]
    : [
        ".contact_title .scroll_el",
        ".ul_1 .scroll_el",
        ".ul_2 .scroll_el",
        
      ];*/

  // ✅ 텍스트 순차 등장 (위로 올라오며 페이드인)
  tl.to(targets, {
    yPercent: 0,
    opacity: 1,
    ease: "power3.out",
    duration: 2,
    stagger: { each: 0.1 },
  }, "-=1"); // 배경 올라올 때 같이 시작

  return () => {
    tl.kill();
  };
}, [items]);








  return (
    <div className="page_contact">
      <CursorFollower />
      <a className="logo_home" href='/'><img src="/assets/img/logo_main.png" alt="dof"/></a>
      <section className="contact_section">
        <img className='contact_bg' src="/assets/img/contact_bg.png"/>
        <div className='detect_w'></div>
        <div className='contact_inner'>
          <div className='contact_title ani scroll_w'><div className='scroll_el'>CONTACT</div></div>

          {/*<div className='list_w'>
            <ul className='ul_1'>
              <li className='li_pos scroll_w'><div className="scroll_el">Executive Producer</div></li>
              <li className='li_name scroll_w'><div className="scroll_el">Ashley Jin Kim</div></li>
              <li className='li_email scroll_w'><div className="scroll_el">ashley.jinkim@d-of.com</div></li>
              <li className='li_tel scroll_w'><div className="scroll_el">+82) 10 2895 3776</div></li>
            </ul>
            <ul className='ul_2'>
              <li className='li_pos scroll_w'><div className="scroll_el">Executive Producer</div></li>
              <li className='li_name scroll_w'><div className="scroll_el">Seungjae CJ Hwang</div></li>
              <li className='li_email scroll_w'><div className="scroll_el">cj.hwang@d-of.com</div></li>
              <li className='li_tel scroll_w'><div className="scroll_el">+82) 10 3531 4410</div></li>
            </ul>  
          </div>*/}
          <div className="list_w">
            {items[0]?.member?.map((m, idx) => (
              <ul className={`ul_${idx + 1}`} key={idx}>
                <li className="li_pos scroll_w">
                  <div className="scroll_el">{m.position?.[0]?.text}</div>
                </li>

                <li className="li_name scroll_w">
                  <div className="scroll_el">{m.name?.[0]?.text}</div>
                </li>

                <li className="li_email scroll_w">
                  <div className="scroll_el">{m.email?.[0]?.text}</div>
                </li>

                <li className="li_tel scroll_w">
                  <div className="scroll_el">{m.phone_number?.[0]?.text}</div>
                </li>
              </ul>
            ))}
          </div>
        </div>
        







      </section>
    </div>
  );
}

export default Contact;
