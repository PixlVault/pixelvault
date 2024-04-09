import { useRef, useEffect } from 'react';

const Popup = ({ children, onClose }) => {
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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div ref={overlayRef} className="flex flex-col items-stretch justify-center bg-gray-100 rounded-lg">
        <div className="flex">
          <div className="grow"></div>
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
