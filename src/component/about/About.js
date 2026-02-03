import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import './about.scss';
import CursorFollower from '../common/CursorFollower';
import $ from 'jquery';
import { Data } from '../data/Data';

function About() {

    const [aboutEl, setItems] = useState([]);
    useLayoutEffect(() => {
      Data().then(({about}) => {
        const aboutInfos = about
          .map((doc) => ({
            txt_1_1: doc.data.txt_1_1[0].text || '',
            txt_1_2: doc.data.txt_1_2[0].text || '',
            txt_2_1: doc.data.txt_2_1[0].text || '',
            txt_2_2: doc.data.txt_2_2[0].text || '',
            img_1: doc.data.img_1?.url || '',
            img_2: doc.data.img_2?.url || '',
            img_3: doc.data.img_3?.url || '',
            img_4: doc.data.img_4?.url || '',
            img_5: doc.data.img_5?.url || '',

          }));

          console.log(aboutInfos)
        setItems(aboutInfos);
      });
    }, []);



  useLayoutEffect(() => {
    setTimeout(() => {
    
      const imgs = ['.img_1', '.img_2', '.img_3', '.img_4', '.img_5'];
      let index = 0;

      function showNext() {
        // 모든 이미지에서 show 제거
        $(imgs.join(',')).removeClass('show');

        // 현재 이미지에 show 추가
        $(imgs[index]).addClass('show');

        // 다음 순서로 이동
        index = (index + 1) % imgs.length;

        // 2초 뒤에 다시 실행
        setTimeout(showNext, 3000);
      }

      showNext();

      // cleanup
      return () => {
        $(imgs.join(',')).removeClass('show');
      };
    }, 1000);
  }, []);



  return (
    <div className="page_about ani">
      <CursorFollower />
      <a className="logo_home" href='/'><img src="/assets/img/logo_main.png" alt="dof"/></a>
      <section className="about_section">
        <div className='about_bg'></div>
        <h1 className='ani'>ABOUT</h1>
        <div className='about_flex'>
          <div className='about_el about_el_1'>
            <img className='img_1' src={aboutEl[0]?.img_1} alt='dope' />
            <img className='img_2' src={aboutEl[0]?.img_2} alt='dope' />
          </div>
          <div className='about_el about_el_2'>
            <div className='txt_w txt_w_1'>
              <div className='bold fade-slice'>{aboutEl[0]?.txt_1_1}</div>
              <div className='regular fade-slice'>{aboutEl[0]?.txt_1_2}</div>
            </div>
            <img className='img_3' src={aboutEl[0]?.img_3} alt='dope' />
          </div>
          <div className='about_el about_el_3'>
            <img className='img_4' src={aboutEl[0]?.img_4} alt='dope' />
            <img className='img_5' src={aboutEl[0]?.img_5} alt='dope' />
            <div className='txt_w txt_w_2'>
              <div className='bold fade-slice'>{aboutEl[0]?.txt_2_1}</div>
              <div className='regular fade-slice'>{aboutEl[0]?.txt_2_2}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
