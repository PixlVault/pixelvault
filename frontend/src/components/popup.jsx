import { useRef, useEffect } from 'react';

const Popup = ({ children, onClose, title }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mouseup', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 fade-in backdrop-blur-sm">
      <div ref={overlayRef} className="flex flex-col items-stretch justify-center bg-gray-100 rounded-lg">
        <div className="flex">
          <div className="flex items-center justify-start grow">
          <span className='font-semibold text-lg ml-4'>{title}</span></div>
          <button onClick={() => onClose()} className="bg-transparent text-black hover:bg-transparent">X</button>
        </div>
        <div className="w-full h-full max-w-lg max-h-lg min-w-lg min-h-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
