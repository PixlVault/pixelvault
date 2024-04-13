import { useState, useRef, useEffect } from 'react';

const Dropdown = ({ title, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const titleButtonRef = useRef(null);

  const toggleOpen = () => {
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (titleButtonRef.current && titleButtonRef.current.contains(event.target)) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mouseup', handleClickOutside);
  }, []);

  return (
    <div>
      <div className="flex flex-col space-y-1">
        <button type="button" className="inline-flex w-full justify-center gap-x-1.5 text-sm" id="menu-button" onClick={toggleOpen} ref={titleButtonRef}>
          {title}
          <svg className="-mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </button>
        <div className="inline-block relative text-left">
          {menuOpen ?
            <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" ref={menuRef}>
              <div className="py-1" role="none">
                {children}
              </div>
            </div>
            : ""
          }
        </div>
      </div>



    </div>
  );
};

export default Dropdown;