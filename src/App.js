import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import $ from 'jquery';
import './App.css';
import Main from './component/main/Main';
import Work from './component/work/Work';
import About from './component/about/About';
import Contact from './component/contact/Contact';

import Header from './component/common/Header';
//import Footer from './component/common/Footer';
import './component/common/common.scss';
import useFadeSlice from './utils/fadeSlice';




function AppContent() { // ✅ 현재 경로 감지
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      //lerp: 0.14,
      //smooth: true,
      autoRaf: false,     // ✅ 직접 raf 통합
      duration: 4,
      easing: t => 1 - Math.pow(2, -12 * t),
      smoothWheel: true,
      smoothTouch: true,
      wheelMultiplier: 1,
      gestureOrientation: 'vertical',
    });
    lenisRef.current = lenis;
    window.globalLenis = lenis;

    // RAF 루프
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);


    
    // ✅ scrollable 요소에서 wheel/touch 이벤트는 Lenis 무시
    const stopLenisInScrollable = (e) => {
      if (e.target.closest('.scrollable')) {
        e.stopPropagation(); // Lenis로 이벤트 전달 차단
      }
    };

    // wheel + 터치 모두 차단
    document.querySelectorAll('.scrollable').forEach((el) => {
      el.addEventListener('wheel', stopLenisInScrollable, { passive: false });
      el.addEventListener('touchstart', stopLenisInScrollable, {
        passive: false,
      });
      el.addEventListener('touchmove', stopLenisInScrollable, {
        passive: false,
      });
    });

    return () => {
      lenis.destroy();
      document.querySelectorAll('.scrollable').forEach((el) => {
        el.removeEventListener('wheel', stopLenisInScrollable);
        el.removeEventListener('touchstart', stopLenisInScrollable);
        el.removeEventListener('touchmove', stopLenisInScrollable);
      });
    };
  }, []);

  const currentLocation = useLocation();

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [currentLocation.pathname]);

  

  useEffect(() => {
    const handleRouteChange = () => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  useEffect(() => {
  const lenis = new Lenis({
    autoRaf: false,
    duration: 4,
    easing: (t) => 1 - Math.pow(2, -12 * t),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
  });

  // RAF 루프
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // ✅ 키보드 스크롤도 Lenis에 위임
  const handleKeyScroll = (e) => {
    const scrollAmount = window.innerHeight * 0.8; // PageDown 거리 정도
    if (['PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      lenis.scrollTo(window.scrollY + scrollAmount);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      lenis.scrollTo(window.scrollY - scrollAmount);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      lenis.scrollTo(window.scrollY + 100);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      lenis.scrollTo(window.scrollY - 100);
    } else if (e.key === 'Home') {
      e.preventDefault();
      lenis.scrollTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      lenis.scrollTo(document.body.scrollHeight);
    }
  };

  window.addEventListener('keydown', handleKeyScroll);
  return () => {
    window.removeEventListener('keydown', handleKeyScroll);
    lenis.destroy();
  };
}, []);


  // vh 단위 보정
  const setPropertyVh = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // 리사이즈 중 애니메이션 비활성화
  const resizingEvent = () => {
    $('.ani, .ani2').addClass('not');
  };
  function afterResizingEvent() {
    $('.ani, .ani2').removeClass('not');
    runAniGlobal();
  }

  // 스크롤 애니메이션
  const scrollAnimation = () => {
    $('.ani, .ani2').each(function () {
      const aniPoint = $(this).offset().top + $(window).height() / 15;
      const windowBottom = $(window).scrollTop() + $(window).height();
      if (windowBottom > aniPoint) {
        if (!$(this).hasClass('active')) {
          $(this).addClass('active');
        }
      }
    });
  };

  useEffect(() => {
    setPropertyVh();
    //
    
    setTimeout(() => {
      
    }, 500);
    window.addEventListener('resize', setPropertyVh);
    window.addEventListener('resize', resizingEvent);
    window.addEventListener('scroll', runAniGlobal);

    let doit;
    window.addEventListener('resize', () => {
      clearTimeout(doit);
      doit = setTimeout(afterResizingEvent, 100);
    });

    return () => {
      window.removeEventListener('resize', setPropertyVh);
      window.removeEventListener('resize', resizingEvent);
      window.removeEventListener('scroll', runAniGlobal);
      window.removeEventListener('resize', afterResizingEvent);
    };
  }, []);

  function runAniGlobal() {}

  function RouteAnimationActivator() {
    const location = useLocation();
    useFadeSlice();
  //$('.ani.active').removeClass('active');
    useLayoutEffect(() => {
      
      $('.ani.active').removeClass('active');
      
      setTimeout(() => {
        //useFadeSlice();
        //runAniGlobal();
        
        scrollAnimation();
        
      }, 1000);
    }, [location.pathname]);

    return null;
  }
  useEffect(() => {
    //$(window).on("resize", updateFadeSlices());
  }, []);
/*
  useEffect(() => {
    const handleResize = () => updateFadeSlices();

    // 폰트 로드 후 텍스트 슬라이스 적용
    if (document.fonts) {
      document.fonts.ready.then(() => {
        updateFadeSlices();
      });
    } else {
      setTimeout(updateFadeSlices, 800);
    }

    $(window).on("resize", handleResize);
    return () => $(window).off("resize", handleResize);
  }, []);
*/

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route path="/work" element={<Work />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/*<Route exact path="/" element={<Main />} />*/}
        {/*<Route exact path="/" element={<Main />} />
        <Route path="/worksmajor" element={<WorksMajor />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:id" element={<Works />} />
        {<Route path="/test" element={<Test />} />}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />*/}
      </Routes>
      <RouteAnimationActivator />
      {/*<Footer />*/}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
