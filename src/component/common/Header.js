import { useLayoutEffect, useState, useEffect } from "react";
import { Link } from "react-router-dom";  
import { Data } from '../data/Data';
function Header() {

  const [time, setTime] = useState("");

  const [items, setItems] = useState([]);
    useLayoutEffect(() => {
      Data().then(({infos}) => {
        const email = infos
          .map((doc) => ({
            email: doc.data.mail_address[0].text || '',

          }));
        setItems(email);
      });
    }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Seoul",
      };
      const formatted = new Intl.DateTimeFormat("ko-KR", options).format(now);
      setTime(formatted);
    };

    updateTime(); // 처음 실행
    const timer = setInterval(updateTime, 1000 * 60); // 1분마다 갱신
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header_links">
        <Link to="/about" className="header_link">ABOUT,</Link>
        <Link to="/work" className="header_link">WORK,</Link>
        <Link to="/contact" className="header_link">CONTACT</Link>
      </div>
      <div className="header_txt">
        based in seoul.<br></br>
        working everywhere.
      </div>
      <div className="header_time">
        <span className="time">{time}</span>
        <span className="loca">SEOUL</span>
      </div>
      <div className="header_email">→ {items[0]?.email}</div>
      <div className="scroll_down">
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span>scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;scroll down&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </div>
    </header>
  );
}

export default Header;