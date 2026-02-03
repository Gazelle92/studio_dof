import $ from "jquery";
import { useLayoutEffect, useState } from "react";
import { Data } from '../data/Data';
function Footer() {

  const [items, setItems] = useState([]);
  useLayoutEffect(() => {
    Data().then(({infos}) => {
      const footerInfos = infos
        .map((doc) => ({
          footerTitle: doc.data.footer_txt[0].text || '',
          email: doc.data.mail_address[0].text || '',
          whatWeDo: doc.data.what_we_do || [],
          social: doc.data.social || [],
          address: doc.data.address[0].text || '',
          phoneNumber: doc.data.phone_number[0].text || '',
          year: doc.data.year[0].text || '',
        }));
      setItems(footerInfos);
    });
  }, []);


  useLayoutEffect(() => {
    
    const footerHeight = () => {
      let endSectionMargin = $('.footer').innerHeight() - 4;
      $('.end_section').css('margin-bottom', `${endSectionMargin}px`)
    };
    $(window).resize(function(){
      footerHeight()
    })
    
    setTimeout(() => {
      footerHeight();
    }, 2400);

    $(window).scroll(function(){
      if( $(window).scrollTop() > $('.App').innerHeight() - $(window).height()/* + $('.footer').innerHeight() */){
        $('.intro').addClass('logo_bottom');
        $('.page_wrap').addClass('footer_on');
      } else {
        $('.intro').removeClass('logo_bottom');
        $('.page_wrap').removeClass('footer_on');
      }
    })
    //window.addEventListener("resize", footerHeight);
    return () => {
      window.removeEventListener("resize", footerHeight());
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer_inner">
        <div className="footer_t">
          <h1 className="hi">{items[0]?.footerTitle}</h1>
          <div className="footer_t_2">
            <span>(CONTACT)</span>
            <a href={`mailto:${items[0]?.email}`}>{items[0]?.email}</a>
          </div>
        </div>
        <div className="footer_list_w">
          <div className="fl_left">
            <span>( What We Do )</span>
            <ul>
              {items[0]?.whatWeDo?.map((item, i) => (
                <li key={i}>
                  {item.what_we_do_url?.length > 0 ? (
                    <a href={item.what_we_do_url?.[0]?.text}>
                      {item.what_we_do_title?.[0]?.text}
                    </a>
                  ) : (
                    <a>{item.what_we_do_title?.[0]?.text}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="fl_right">
            <span>( Social )</span>
            <ul>
              {items[0]?.social?.map((item, i) => (
                <li key={i}>
                  <a 
                    href={item.social_url?.url || "#"} 
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.social_title?.[0]?.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>          
        </div>
        <div className="a_p">
          <address>{items[0]?.address}</address>
          <a>{items[0]?.phoneNumber}</a>
        </div>
        <div className="copyright pc_only">
          <span>{items[0]?.year} STUDIO DOF. All rights reserved. website by <a href="https://www.hummman.com/" target="_blank">HUMMMAN</a></span>
        </div>
        <div className="copyright mob_only">
          <span>©{items[0]?.year} STUDIO DOF. All rights reserved.</span>
          <span>website by <a href="https://www.hummman.com/" target="_blank">HUMMMAN</a></span>
        </div>
      </div>
      <div className="footer_logo_section"><img src="/assets/img/logo_main.png" alt="dof"></img></div>
    </footer>
  );
}

export default Footer;