import { useEffect } from "react";
import $ from "jquery";
import "./intro.scss";
export function runAniGlobal() {
  $(".ani, .ani2").each(function () {
    const aniPoint = $(this).offset().top + $(window).height() / 15;
    const windowBottom = $(window).scrollTop() + $(window).height();
    if (windowBottom > aniPoint) {
      if (!$(this).hasClass("active")) {
        $(this).addClass("active");
      }
    }
  });
  
  
}


export default function Intro() {

  useEffect(() => {
    $('body').addClass('no_scroll');
    setTimeout(() => {
      $('.intro').addClass('txt_active');

      setTimeout(() => {
        $('.intro').addClass('logo_active');
        setTimeout(() => {
          $('.intro').addClass('intro_out');
          
          $('.sec_1_video_w video').removeClass('intro_out');
          setTimeout(() => {
            $('.sec_1_video_w video').addClass('transition');
            $('body').removeClass('no_scroll');
          }, 2000);
        }, 700);
      }, 500);
    
    }, 2000);

    const onScroll = () => {
      if ($(window).scrollTop() > 50) {
        $(".intro").addClass("scrolled");
      } else {
        $(".intro").removeClass("scrolled");
      }
      
    };

    $(window).on("scroll", onScroll);
    return () => {
      $(window).off("scroll", onScroll);
    };

  }, []);

  return (
    <div className="intro ani">
      <div className="bg_wrap"></div>
      <div className="intro_txt"><img src="/assets/img/intro_txt.png" alt="dof"/></div>
      <div className="logo_fixed"><a href="/"><img src="/assets/img/logo_main.png" alt="dof"/></a></div>
    </div>
  );
}