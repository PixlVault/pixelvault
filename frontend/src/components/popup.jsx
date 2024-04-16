import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const Popup = ({ children, onClose, title, hiddenClose = false }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 fade-in backdrop-blur-sm">
      <div ref={overlayRef} className="flex flex-col items-stretch justify-center bg-gray-100 rounded-lg">
        <div className="flex">
          <div className="flex items-center justify-start grow">
          <span className='font-semibold text-lg ml-4'>{title}</span></div>
          <button hidden={hiddenClose} onClick={() => onClose()} className="bg-transparent text-black hover:bg-transparent">X</button>
        </div>
        <div className="w-full h-full min-w-lg min-h-lg">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('popup-root') // Make sure you have a div with id 'popup-root' in your index.html
  );
};

export default Popup;
